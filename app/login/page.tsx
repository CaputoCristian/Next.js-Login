'use client';
import { signIn } from "next-auth/react"
import {FormEvent, useState} from 'react';
import { useRouter } from 'next/navigation';
import {Eye, EyeOff} from "lucide-react";

export default function LoginForm() {
    const router = useRouter();
    const [error, setError] = useState<string>('');

    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => setIsVisible(prevState => !prevState);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(''); // Resetta eventuali errori precedenti
        const formData = new FormData(e.currentTarget);

        const response = await signIn('credentials', {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
//            redirect: true,
//            redirectTo: "/home",
            redirect: false
        });
        if (response?.error) {
            console.error('Errore di login:', response.error);
            setError('Email o password non validi');
        } else {
            // Reindirizzamento alla home se l'autenticazione ha successo
          router.push('/home');
        }
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-gray-100">
            <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
                <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-700 px-4 py-6 pt-8 text-center sm:px-16">
                    <h3 className="text-2xl font-semibold text-white">Sign In</h3>
                    <p className="text-sm text-gray-400">
                        Use your email and password to access your account
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
                <label htmlFor="password" className=" mt-1 block text-sm font-medium text-gray-700">
                    Password
                </label>
                <div className="relative">

                    <input
                        id="password"
                        name="password"
                        type={isVisible ? "text" : "password"}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                             text-sm placeholder-gray-400 shadow-sm focus:border-blue-500
                             focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Inserisci la tua password"
                    />
                    <button
                        className="absolute right-2 flex items-center z-20 cursor-pointer top-1/2 -translate-y-1/2
                            text-gray-400 rounded-e-md focus:outline-none focus-visible:text-indigo-500 hover:text-indigo-500 transition-colors"
                        type="button"
                        onClick={toggleVisibility}
                        aria-label={isVisible ? "Hide password" : "Show password"}
                        aria-pressed={isVisible}
                        aria-controls="password"
                    >
                        {isVisible ? (
                            <EyeOff size={20} aria-hidden="true" />
                        ) : (
                            <Eye size={20} aria-hidden="true" />
                        )}
                    </button>
                </div>
            </div>




            <button
                type="submit"
                className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm
                 font-medium text-gray-100 shadow-sm transition-all
                 hover:bg-gray-600 hover:border-gray-500
                 focus:outline-none focus:ring-2 focus:ring-blue-500
                 active:scale-[0.98]"
            >
                Sign in
            </button>
        </form>

                <p className="text-sm text-gray-400 text-center mt-4">
                    Don't have an account?{" "}
                    <a href="/register" className="text-blue-400 hover:underline">
                        Sign Up
                    </a>
                </p>


            </div>
        </div>
    );
}