import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import {compare, genSaltSync, hashSync} from 'bcrypt-ts';
import {createToken, getToken, getUser} from './db';
import { authConfig } from './auth.config';
import NextAuth, {AuthError, NextAuthConfig} from "next-auth";
import {NextResponse} from "next/server";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export const authOptions: NextAuthConfig = {
    ...authConfig,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {

                const email = credentials?.email;
                const password = credentials?.password;

                //console.log(" Tentativo di login per:", email);

                if (!email || !password) {
                    console.error("Mancano email o password");
                    throw new Error("Email e password sono obbligatori");
                }

                const user = await getUser(email as string);
                if (!user) {
                    console.error("Utente non trovato nel database");
                    return null;
                }

                //console.log("Utente trovato:", user.email);

                const passwordsMatch = await compare(password as string, user.password!);

                //console.log("Password corretta?", passwordsMatch);

                if (!passwordsMatch) {
                    //console.error("Password errata per:", email);
                    throw new Error("IncorrectCredentials");
                }

                //Two-Factor-Authentication
                const otp = await createToken(email as string);


                await fetch("http://localhost:3000/api/send-otp", { method: 'POST', body: JSON.stringify({email, otp}) })

                console.log("Creazione otp e invio mail per:", email, otp);
                //console.log("Login riuscito per:", email);

                return {
                        id: user.id.toString(),
                        email: user.email,
                        pending2FA: true,
                    };


            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET
        })
    ],
    secret: process.env.AUTH_SECRET,
}