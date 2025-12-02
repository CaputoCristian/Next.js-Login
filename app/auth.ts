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
                remindMe: { type: "text"},
            },
            async authorize(credentials) {

                const email = credentials?.email;
                const password = credentials?.password;
                const remindMe = credentials?.remindMe;

                if (!email || !password) {
                    console.error("Credenziali incomplete");
                    throw new Error("Email e password sono obbligatori");
                }

                const user = await getUser(email as string);
                if (!user) {
                    console.error("Utente non trovato nel database");
                    return null;
                } else if (user.provider != "credentials")
                    throw new Error("Account registrato tramite un altro provider"); //TODO gestione errore.

                const passwordsMatch = await compare(password as string, user.password!);

                if (!passwordsMatch) {
                    throw new Error("IncorrectCredentials");
                }

                //Two-Factor-Authentication
                //Logica spostata nella callback di signIn()
                //const otp = await createToken(email as string);
                //await fetch("http://localhost:3000/api/send-otp", { method: 'POST', body: JSON.stringify({email, otp}) })

                //Ritorna il token di auth, criptato tramite AUTH_SECRET
                return {
                        id: user.id.toString(),
                        email: user.email,
                        pending2FA: true,
                        remindMe: remindMe === 'true'
                };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET
        })
    ],
    secret: process.env.AUTH_SECRET,
}