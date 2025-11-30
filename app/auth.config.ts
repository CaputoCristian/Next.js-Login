import { NextAuthConfig } from 'next-auth';
import {createToken, getToken, createUserOAuth, getUser} from "@/app/db";
import {compare} from "bcrypt-ts";

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
        async signIn({ user, account }) {
            // user.email, user.name, account.provider, account.providerAccountId

            //console.log("=== SIGN IN CALLBACK START ===");
            //console.log("User:", user);
            //console.log("Account:", account);
            //console.log("Email:", user.email);
            //console.log("Provider:", account.provider);
            //console.log("=== SIGN IN CALLBACK END ===");

            if(!user || !user.email) throw new Error(
                "GenericUserError"
            )
            if(!account || !account.provider || !account.providerAccountId ) throw new Error(
                "GenericProviderError"
            )

            const email = user.email;
            const existingUser = await getUser(user.email);

            if (!existingUser) {
                // Al primo accesso viene creato un nuovo utente.
                await createUserOAuth(
                    user.email,
                    account.provider,
                    account.providerAccountId,
                );

                //return true;
            }

            // Se l'utente esiste, controlla che il provider sia quello esatto.
            else if (existingUser.provider && existingUser.provider !== account.provider) {
                console.error("L'account è legato ad un altro provider");
                //throw new Error("ProviderMismatch"); //No poiché ritorna AccessDenied
                return `/error?error=ProviderMismatch`;
            }

            //Two-Factor-Authentication
            const otp = await createToken(email as string);
            await fetch("http://localhost:3000/api/send-otp", { method: 'POST', body: JSON.stringify({email, otp}) })

            console.log("Creazione otp e invio mail per:", email, otp);

            return true;
        },
        async jwt({ token, user, trigger, session }) {

            //console.log("JWT CALLBACK → token:", token);
            //console.log("JWT CALLBACK → trigger:", trigger);
            //console.log("JWT CALLBACK → session:", session);

            //l'email è sicuramente stata definita nel login, ma occorre controllarla per sopprimere un errore
            if (trigger === "update" && session?.otp && token?.email) {
                const record = await getToken(token.email);

                if (!record) {
                    console.error("Nessun OTP trovato per l'utente");
                    return token; //Restituisce il token invariato
                }

                const tokenMatch = await compare(session.otp, record.token);

                const ageMs = Date.now() - record.creation_time.getTime();
                const maxAge = 5 * 60 * 1000;

                if (tokenMatch && ageMs <= maxAge) {
                    token.pending2FA = false; //Verifica riuscita
                    //TODO eliminazione token dal DB
                } else {
                    console.warn("Tentativo verifica OTP fallito o scaduto");

                }

                //Non fare nulla se l'aggiornamento non è necessario.
                if (trigger === "update" && session?.pending2FA === false) {
                }
            }

            return token;
        },


        async session({ session, token }) {

            if (token.pending2FA) {
                session.user.pending2FA = token.pending2FA;
            }
            //console.log("JWT CALLBACK IN SESSION→ token:", token);
            //console.log("JWT CALLBACK IN SESSION→ session:", session);

            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.AUTH_SECRET,
} // satisfies NextAuthConfig;