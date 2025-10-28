import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from 'bcrypt-ts';
import { getUser } from './db';
import { authConfig } from './auth.config';

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {

                const username = credentials?.email;
                const password = credentials?.password;

                if (!username || !password) {
                    throw new Error("Email e password sono obbligatori");
                }

                const user = await getUser(username as string);
                if (user.length === 0) return null;
                const passwordsMatch = await compare(password as string, user[0].password!);
                if (!passwordsMatch) return null;
                return {
                    id: user.id,
                    email: user.email,
                    ...user
                };
            },
        }),
    ],
});