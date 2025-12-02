'use client';
import {signIn, useSession} from "next-auth/react"
import {FormEvent, useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import {Eye, EyeOff} from "lucide-react";
import Image from "next/image";
import googleLogo from "@/public/google.png";
import githubLogo from "@/public/github.png";

export default function LoginForm() {
    const router = useRouter();
    const [error, setError] = useState<string>('');

    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => setIsVisible(prevState => !prevState);

    const { status } = useSession();

    //Causa il reindirizzamento alla pagina di verifica dopo il login
    useEffect(() => {
        if (status === 'authenticated') {
            console.log("Reindirizzamento alla verifica.");

            router.push('/verify');

            // router.replace('/401');
        }
    }, [status, router]); // Il trigger avviene solo al cambiamento di stato


    //Prova ad effettuare il login
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(''); // Resetta eventuali errori precedenti

        const formData = new FormData(e.currentTarget);
        const rememberValue = formData.get("remember");
        const remindMeStatus = rememberValue ? "true" : "false";

        const response = await signIn('credentials', {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            remindMe: remindMeStatus,
            redirect: false
        });

        if (response.error) {
            //console.log("Autenticazione fallita");
            setError("Email o password non validi");
        }
        else {
            //console.log("Autenticazione riuscita");
            router.push('/verify');
        }

    }


    //TODO Creare un component per la login con Google e Github. In modo da riutilizzarlo per la register.
    const handleSubmitGoogle = async () => {
        await signIn("google");
        //router.push('/verify');
    }
    const handleSubmitGitHub = async () => {
        await signIn("github");
        //router.push('/verify');
    }

        return (
        <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-gray-100">
            <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
                <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-700 px-4 py-6 pt-8 text-center sm:px-16">
                    <h3 className="text-2xl font-semibold text-white">
                        Accesso
                    </h3>
                    <p className="text-sm text-gray-400">
                        Usa la tua email e password per accedere al tuo account.
                    </p>
                </div>


                <button
                    onClick={handleSubmitGoogle}
                    className="w-full flex items-center font-semibold justify-center h-14 px-6 mt-4 text-xl transition-colors duration-300 border-gray-600 bg-gray-700 text-gray-100 rounded-lg focus:shadow-outline hover:bg-gray-600 hover:border-gray-500"
                >
                    <Image src={googleLogo} alt="Google Logo" width={20} height={20} />
                    <span className="ml-4">Continue with Google</span>
                </button>

                <button
                    onClick={handleSubmitGitHub}
                    className="w-full flex items-center font-semibold justify-center h-14 px-6 mt-4 mb-2 text-xl transition-colors duration-300 border-gray-600 bg-gray-700 text-gray-100 rounded-lg focus:shadow-outline hover:bg-gray-600 hover:border-gray-500"
                >
                    <Image src={githubLogo} alt="Github Logo" width={20} height={20} />
                    <span className="ml-4">Continue with Github</span>
                </button>

                <div className="flex flex-col items-center justify-center space-y-3 border-gray-700 px-4 py-6 pt-8 text-center sm:px-16">
                    <h3 className="text-2xl font-semibold text-white">
                        Oppure
                    </h3>
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
                                aria-label={isVisible ? "Nascondi password" : "Mostra password"}
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

            <div className="flex items-center gap-2 mt-4">
                <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="text-sm text-gray-300">
                    Resta collegato
                </label>
            </div>

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
                Login
            </button>
        </form>

                <p className="text-sm text-gray-400 text-center mt-4">
                    Non hai un account?{" "}
                    <a href="/register" className="text-blue-400 hover:underline">
                        Registrati
                    </a>
                </p>
                
            </div>
        </div>
    );
}