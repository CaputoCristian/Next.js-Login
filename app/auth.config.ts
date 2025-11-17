import { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
    pages: {
        signIn: '/login',
        error: '/login',
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