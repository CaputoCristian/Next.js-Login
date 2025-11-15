import CredentialsProvider from "next-auth/providers/credentials";
import {compare, genSaltSync, hashSync} from 'bcrypt-ts';
import {createToken, getUser, verifyOtp} from './db';
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
                password: { label: "Password", type: "password" },
                totpCode: { label: 'Two-factor Code', type: 'input' },
            },
            async authorize(credentials) {

                const email = credentials?.email;
                const password = credentials?.password;
                const totpCode = credentials?.totpCode;

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

                //Two-Factor-Authentication
                if (user.tfa_required && !totpCode) {
                        const otp = await createToken(email as string);

                    // dynamic import — questo avviene durante l'esecuzione (Node) e NON al bundle del middleware
                    //const { sendOtpEmail } = await import('@/app/util/sendOtpEmail'); // file che usa nodemailer
                    //    await sendOtpEmail(user.email, otp);


                    const res = await fetch("http://localhost:3000/api/send-otp", { method: 'POST', body: JSON.stringify({email, otp}) })


                        console.log("Creazione otp e invio mail per:", email);
                        throw new Error("Richiesta autenticazione a due fattori.");

                }

                //Mutuamente esclusivo con l'if precedente, in quanto lancia un errore e ferma il codice.
                if (user.tfa_required ) {
                    const valid = await verifyOtp(email as string, totpCode as string);
                    if (!valid) throw new Error("L'Otp inserito non è valido.");

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