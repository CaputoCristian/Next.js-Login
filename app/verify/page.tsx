'use client';
import {signIn, useSession} from "next-auth/react"
import {FormEvent, useState} from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyOtp() {
    const router = useRouter();
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState("");

    const { update } = useSession();

    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => setIsVisible(prevState => !prevState);

    const [showOTP, setShowOTP] = useState<boolean>(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        const formData = new FormData(e.currentTarget);

        console.log("Invio controllo OTP", formData.get('otp'));

        const res = await fetch("/api/verify-otp", {
            method: "POST",
            body: JSON.stringify({
                otp: formData.get("otp"),
            }),
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            if (res.status === 400) {
                setError("");
            }
            else if (res.status === 409) {
                setError("")
            }
            else {
                setError("Errore nella verifica");
            }
            return;
        }

        if (res.ok) {
            console.log("Verifica completata1");

            await update({ pending2FA: false });

            router.push("/home");
        }

        await update({ pending2FA: false });

        console.log("Verifica completata");
        setSuccess("Verifica completata! Ora puoi accedere.");
        setTimeout(() => router.push("/home"), 1500);

    //    console.log("Richiesta autenticazione a due fattori.");
    //    setShowOTP(true);
    //    return;
    //} else {

    //if (response?.error == "TwoFactorAuthRequired" && formData.get('otp') == null) {
    //    console.log("Richiesta autenticazione a due fattori.", response.error);
    //    setShowOTP(true);


    //      } else {
    // Reindirizzamento alla home se l'autenticazione ha successo

    }



    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-gray-100">
            <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
                <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-700 px-4 py-6 pt-8 text-center sm:px-16">
                    <h3 className="text-2xl font-semibold text-white">
                        Two Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-400">
                        Enter the code you recieved in your mail
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                                id="otp"
                                name="otp"
                                required
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
                        Verify code
                    </button>
                </form>

                    <p className="text-sm text-gray-400 text-center mt-4">
                        Don&#39;t have an account?{" "}
                        <a href="/register" className="text-blue-400 hover:underline">
                            Sign Up
                        </a>
                    </p>

            </div>
        </div>
    );
}