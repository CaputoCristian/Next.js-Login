'use client';
import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
    const params = useSearchParams();
    const error = params.get("error");


    const getErrorMessage = (errorCode: string | null): { title: string, message: string } => {
        switch (errorCode) {
            case "CallbackRouteError": //Errori generici di login/authorize
                return {
                    title: "Errore durante l'autenticazione",
                    message: "Qualcosa è andato storto, riprova."
                };

            case "SessionExpired":
                return {
                    title: "Sessione scaduta",
                    message: "La tua sessione è scaduta per inattività o è stata invalidata. Accedi nuovamente."
                };

            case "ProviderMismatch":
                return {
                    title: "Accesso Negato",
                    message: "Questo account è già registrato tramite un altro provider."
                };

            default:
                return {
                    title: "Errore generico durante l'accesso",
                    message: "Si è verificato un errore sconosciuto."
                };
        }
    };

    const { title, message } = getErrorMessage(error);



    return (

        <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-gray-100">
            <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
                <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-700 px-4 py-6 pt-8 text-center sm:px-16">
                    <h2 className="text-2xl font-semibold text-white">
                        {title}
                    </h2>
                    <p className = "text-red-500 mt-2 ">
                        {message}
                    </p>
                    <a href="/login" className="text-blue-400 hover:underline mt-3 inline-block">
                        Riprova.
                    </a>
                </div>

            </div>
        </div>
    );

}