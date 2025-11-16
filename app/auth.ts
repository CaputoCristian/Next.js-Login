import CredentialsProvider from "next-auth/providers/credentials";
import {compare, genSaltSync, hashSync} from 'bcrypt-ts';
import {createToken, getToken, getUser, verifyOtp} from './db';
import { authConfig } from './auth.config';
import NextAuth, {AuthError, NextAuthConfig} from "next-auth";
import {NextResponse} from "next/server";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

class InvalidLoginError extends AuthError {
    code = 'custom';
    errorMessage: string;
    constructor(message?: any, errorOptions?: any) {
        super(message, errorOptions);
        this.errorMessage = message;
    }
}

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

                console.log(" Tentativo di login per:", email);

                if (!email || !password) {
                    console.error("Mancano email o password");
                    throw new Error("Email e password sono obbligatori");
                }

                const user = await getUser(email as string);
                if (!user) {
                    console.error("Utente non trovato nel database");
                    return null;
                }

                console.log("Utente trovato:", user.email);

                const passwordsMatch = await compare(password as string, user.password!);

                console.log("Password corretta?", passwordsMatch);

                if (!passwordsMatch) {
                    console.error("Password errata per:", email);
                    throw new Error("IncorrectCredentials");
                }

                //Two-Factor-Authentication
                const otp = await createToken(email as string);


                await fetch("http://localhost:3000/api/send-otp", { method: 'POST', body: JSON.stringify({email, otp}) })

                console.log("Creazione otp e invio mail per:", email, otp);
                console.log("Login riuscito per:", email);

                return {
                        id: user.id.toString(),
                        email: user.email,
                        pending2FA: true,
                    };


            },
        }),
        CredentialsProvider({
            name: "TwoFactorAuth",
            credentials: {
                otp: {label: "OTP", type: "text"},
            },
            async authorize(credentials) {

                console.log("TFA START");


                const session = await auth();
                if (!session) throw new Error("User not logged in");

                const email = session.user.email;
                const otp = credentials?.otp;

                const record = await getToken(email);

                console.log('Trovati:',email, record);

                if (!record)
                    throw new Error("OTP not found");

                if (record.token !== otp)
                    throw new Error("Invalid OTP");

                // Controllo validità, il token scade dopo 5 minuti. Postgres e Prisma non permettono di farlo scadere in automatico
                const ageMs = Date.now() - record.creation_time.getTime();
                const maxAge = 5 * 60 * 1000;

                if (ageMs > maxAge)
                    throw new Error("OTP Expired");

                console.log('Verifica effettuata con successo');

                return {
                    id: session.user.id.toString(),
                    email: session.user.email,
                    pending2FA: false,
                };

            },
        })
    ],
    secret: process.env.AUTH_SECRET,
}