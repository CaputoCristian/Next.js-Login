import { NextAuthConfig } from 'next-auth';
import {createUser, createUserOAuth, getUser} from "@/app/db";

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

            console.log("=== SIGN IN CALLBACK START ===");
            console.log("User:", user);
            console.log("Account:", account);
            console.log("Email:", user.email);
            console.log("Provider:", account.provider);
            console.log("=== SIGN IN CALLBACK END ===");

            if(!user || !user.email) throw new Error(
                "Errore con i dati utente."
            )
            if(!account || !account.provider || !account.providerAccountId ) throw new Error(
                "ProviderGenericError"
            )

            const existingUser = await getUser(user.email);

            if (!existingUser) {
                // Al primo accesso viene creato un nuovo utente.
                await createUserOAuth(
                    user.email,
                    account.provider,
                    account.providerAccountId,
                );

                return true;
            }

            // Se l'utente esiste, controlla che il provider sia quello esatto.
            if (existingUser.provider && existingUser.provider !== account.provider) {
                console.error("L'account è legato ad un altro provider");
                //throw new Error("ProviderMismatch"); //No poiché ritorna AccessDenied
                return `/error?error=ProviderMismatch`;
            }

            return true;
        },
        async jwt({ token, user, trigger, session }) {

            //console.log("JWT CALLBACK → token:", token);
            //console.log("JWT CALLBACK → trigger:", trigger);
            //console.log("JWT CALLBACK → session:", session);

            if (user) {
                token.id = user.id;
                token.email = user.email;
                //Se non definito, inizializza true
                token.pending2FA = user.pending2FA ?? true;
            }

            if (trigger === "update" && session?.pending2FA !== undefined) {
                token.pending2FA = session.pending2FA;
            }

            return token;
        },

        async session({ session, token }) {
            session.user.id = token.id;
            session.user.email = token.email;
            session.user.pending2FA = token.pending2FA;

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