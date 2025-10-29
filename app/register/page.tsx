"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const formData = new FormData(e.currentTarget);
        const res = await fetch("/api/register", {
            method: "POST",
            body: JSON.stringify({
                email: formData.get("email"),
                password: formData.get("password"),
            }),
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            if (res.status === 400) {
                setError("Email o password non validi");
            }
            else if (res.status === 409) {
                setError("Utente già registrato")
            }
            else {
                setError("Errore nella creazione dell'account");
            }
            return;
        }

        setSuccess("Registrazione completata! Ora puoi accedere.");
        setTimeout(() => router.push("/login"), 1500);
    };
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-gray-100">
            <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
                <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-700 px-4 py-6 pt-8 text-center sm:px-16">
                    <h3 className="text-2xl font-semibold text-white">Register</h3>
                    <p className="text-sm text-gray-400">
                        Create your new account using email and password
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                             text-sm placeholder-gray-400 shadow-sm focus:border-blue-500
                             focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Inserisci la tua email"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                             text-sm placeholder-gray-400 shadow-sm focus:border-blue-500
                             focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Inserisci la tua password"
                        />

                    </div>

                    {error && (
                        <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm
                 font-medium text-gray-100 shadow-sm transition-all
                 hover:bg-gray-600 hover:border-gray-500
                 focus:outline-none focus:ring-2 focus:ring-blue-500
                 active:scale-[0.98]"
                    >
                        Sign up
                    </button>
                </form>

                <p className="text-sm text-gray-400 text-center mt-4">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-400 hover:underline">
                        Sign In
                    </a>
                </p>


            </div>
        </div>
    );
}