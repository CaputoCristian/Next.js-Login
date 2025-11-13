import CredentialsProvider from "next-auth/providers/credentials";
import {compare, genSaltSync, hashSync} from 'bcrypt-ts';
import { getUser } from './db';
import { authConfig } from './auth.config';
import NextAuth, { NextAuthConfig } from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export const authOptions: NextAuthConfig = {
    ...authConfig,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
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
                    return null;
                }

                console.log("Login riuscito per:", email);

                return {
                    id: user.id.toString(),  //NextAuth richiede un ID stringa, mentre Prisma lo genera come int
                    email: user.email,
                };
            },
        }),
    ],
    secret: process.env.AUTH_SECRET,
}