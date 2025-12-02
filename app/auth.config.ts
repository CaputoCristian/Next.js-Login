import { NextAuthConfig } from 'next-auth';
import {createToken, getToken, createUserOAuth, getUser, verifyUser} from "@/app/db";
import {compare} from "bcrypt-ts";
import {now} from "effect/DateTime";

export const authConfig: NextAuthConfig = {
    pages: {
        signIn: '/login',
        error: '/error',
    },
    providers: [],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnHome = nextUrl.pathname.startsWith('/home');
            if (isOnHome) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                return Response.redirect(new URL('/home', nextUrl));
            }
            return true;
        },
        //Callback che avviene dopo aver eseguito l'accesso e controlla la mutua esclusività dei provider.
        async signIn({ user, account }) {

            if(!user || !user.email) throw new Error(
                "GenericUserError"
            )
            if(!account || !account.provider || !account.providerAccountId ) throw new Error(
                "GenericProviderError"
            )

            const email = user.email;
            const existingUser = await getUser(user.email);

            if (!existingUser || !existingUser.verified) {
                // Al primo accesso viene creato un nuovo utente. Se esiste, ma non verificato lo sovrascrive
                await createUserOAuth(
                    user.email,
                    account.provider,
                    account.providerAccountId,
                );

                //return true;
            }

            //Se l'utente esiste, controlla che il provider corrente sia quello esatto.
            else if (existingUser.provider && existingUser.provider !== account.provider) {
                console.error("L'account è legato ad un altro provider");
                //throw new Error("ProviderMismatch"); //No poiché ritorna AccessDenied
                return '/error?error=ProviderMismatch';
            }

            //Two-Factor-Authentication, se non ci sono problemi crea il token e lo invia.
            const otp = await createToken(email as string);
            await fetch("http://localhost:3000/api/send-otp", { method: 'POST', body: JSON.stringify({email, otp}) })

            console.log("Creazione otp e invio mail per:", email, otp);

            return true;
        },
        async jwt({ token, user, trigger, session }) {

            console.log("User:", user);

            //Login
            if (user) {
                token.remindMe = user.remindMe!;
                token.pending2FA = true;
                token.loginTimestamp = Date.now(); //Salva l'istante del primo login

                console.log("[JWT - PRIMO ACCESSO] Token creato:");
                console.log(token);

            }

            //Effettua la verifica dell'OTP
            if (trigger === "update" && session?.otp && token?.email) {
                const record = await getToken(token.email);

                console.log("[JWT - UPDATE TRIGGER] Sessione ricevuta:", session);

                if (!record) {
                    console.error("Nessun OTP trovato per l'utente");
                    return token; //Restituisce il token invariato
                }

                const tokenMatch = await compare(session.otp, record.token);

                const ageMs = Date.now() - record.creation_time.getTime();
                const maxAge = 5 * 60 * 1000; // 5 minuti

                if (tokenMatch && ageMs <= maxAge) {
                    await verifyUser(token.email);
                    token.pending2FA = false; //Verifica riuscita
                    //TODO eliminazione token dal DB
                } else {
                    console.error("Tentativo verifica OTP fallito o scaduto");

                }

                console.log("[JWT - UPDATE TRIGGER] Token dopo modifica:", token);

            }

            //DEBUG
            if (!user && trigger !== "update") {
                console.log("[JWT - REFRESH] Token in uso:", token);
            }

            const date = Date.now();

            //Invalida il token, slogga l'utente dopo 15 minuti, se non ha verificato la sessione
            if (token.pending2FA) {
                const timePending = date - (token.loginTimestamp as number);
                if (timePending > 15 * 60 * 1000) {
                        console.log("[JWT - SCADENZA 2FA] Token in uso:", token);
                    return null;
                }
            }

            //Se non si ha inserito la preferenza per restare collegati, la sessione si invalida dopo 3 ore.
            else if (!token.remindMe) {
                const timeLogged = date - (token.loginTimestamp as number);
                if (timeLogged > 3 * 60 * 60 * 1000) {
                    console.log("[JWT - SCADENZA NORMALE] Token in uso:", token);
                    return null; //Slogga l'utente
                }
            }

            return token;
        },


        async session({ session, token }) {

            if (token.pending2FA == undefined) {
                token.pending2FA = true;
                session.user.pending2FA = token.pending2FA;
            }
            else if (token.pending2FA !== undefined) {
                session.user.pending2FA = token.pending2FA;
            }
            if (token.remindMe !== undefined) {
                session.user.remindMe = token.remindMe;
            }
            //console.log("JWT CALLBACK IN SESSION→ token:", token);
            //console.log("JWT CALLBACK IN SESSION→ session:", session);

            return session;
        },
    },
    session: {
        strategy: "jwt", //La durata base del token è di 30 giorni.
    },
    secret: process.env.AUTH_SECRET,
} // satisfies NextAuthConfig;