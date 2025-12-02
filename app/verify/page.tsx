'use client';
import {useSession} from "next-auth/react"
import {FormEvent, useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from "next-auth/react";

export default function VerifyOtp() {
    const router = useRouter();
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState("");

    const [message, setMessage] = useState("");

    const { update, status } = useSession();

    useEffect(() => {
        if (status === 'unauthenticated') {
            console.log("Sessione scaduta o invalidata. Reindirizzamento al login.");

            router.push('/error?error=SessionExpired');

            // router.replace('/401');
        }
    }, [status, router]); // Il trigger avviene solo al cambiamento di stato

    if (status === 'unauthenticated') {
        return null; //Evita bug grafici prima del redirect
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        const formData = new FormData(e.currentTarget);
        const formOtp = formData.get("otp");

        console.log("Invio controllo OTP", formOtp);

        //Si trigger l'update del token, nel mentre viene verificato l'OTP.'
        const newSession = await update({ otp: formOtp });


        console.log("Aggiornamento sessione", newSession);
        console.log("Aggiornamento user", newSession?.user?.pending2FA);


        //Si controlla se la sessione è stata aggiornata
        if (newSession?.user?.pending2FA === false) {
            setSuccess("Verifica completata.");
            router.push("/home"); //Oppure .replace?
        } else {
            //Non usando l'API non si può definire l'errore specifico.
            setError("Codice non valido o scaduto. Riprova.");
        }
    }

    async function resendCode() {
        const res = await fetch("/api/resend-otp", { method: "POST" });

        if (res.status == 200) {
            setMessage("Controlla la tua mail.");
            return;
        }

    }

    async function handleBack() {
        await signOut({ redirectTo: "/login" });
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-gray-100">
            <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
                <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-700 px-4 py-6 pt-8 text-center sm:px-16 relative ">
                    <div className="absolute top-4 left-4 pb-6">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1 text-gray-400 hover:text-gray-200 underline"
                        >
                            <span className="text-lg">←</span>
                            <span>Torna indietro</span>
                        </button>
                    </div>

                    <h3 className="text-2xl font-semibold text-white mt-8">
                        Autenticazione a due fattori
                    </h3>
                    <p className="text-sm text-gray-400">
                        Inserisci il codice ricevuto via email.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                                id="otp"
                                name="otp"
                                required
                                maxLength={6}
                                inputMode="numeric"
                                pattern="\d{6}"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                             text-sm placeholder-gray-400 shadow-sm focus:border-blue-500
                             focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Inserisci il codice"
                            />

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm
                 font-medium text-gray-100 shadow-sm transition-all
                 hover:bg-gray-600 hover:border-gray-500
                 focus:outline-none focus:ring-2 focus:ring-blue-500
                 active:scale-[0.98]"
                    >
                        Verifica
                    </button>
                </form>

                <p className="text-sm text-gray-400 text-center mt-4">
                    <button
                        onClick={resendCode}
                        className="text-blue-400 hover:underline"
                    >
                        Invia di nuovo codice
                    </button>
                </p>

                {message && <p className="text-center text-sm text-blue-400 mt-2">
                    {message}
                </p>}

            </div>
        </div>
    );
}