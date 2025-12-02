"use client";
import {useState, FormEvent, useEffect} from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import {signIn, useSession} from "next-auth/react";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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


    //Chiama l'API di registrazione fornendo email e password, risposta di ok => esegui il login.
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        const formData = new FormData(e.currentTarget);

        if (!(formData.get("password") == formData.get("confirmPassword"))) {
            setError("Le password non coincidono");
            return;
        }
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
        }else{

            //Login compreso nella registrazione.
            return await signIn('credentials', {
                email: formData.get("email"),
                password: formData.get("password"),
                redirect: false
            });

        }

        //setSuccess("Registrazione completata! Ora puoi accedere.");
        //setTimeout(() => router.push("/verify"), 1500);


    };
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-gray-100">
            <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
                <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-700 px-4 py-6 pt-8 text-center sm:px-16">
                    <h3 className="text-2xl font-semibold text-white">Nuovo account</h3>
                    <p className="text-sm text-gray-400">
                        Crea un nuovo account per accedere.
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

                    <div>
                        <label htmlFor="confirmPassword" className=" mt-1 block text-sm font-medium text-gray-700">
                            Conferma la password
                        </label>
                        <div className="relative">

                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={isVisible ? "text" : "password"}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                             text-sm placeholder-gray-400 shadow-sm focus:border-blue-500
                             focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Conferma la tua password"
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

                    {error && (
                        <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
                    )}
                    {success && (
                        <p className="text-green-400 text-sm mb-3 text-center">{success}</p>
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
                    Hai già un account?{" "}
                    <a href="/login" className="text-blue-400 hover:underline">
                        Accedi
                    </a>
                </p>

            </div>
        </div>
    );
}