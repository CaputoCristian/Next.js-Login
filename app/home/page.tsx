'use client'
//import {signOut} from "@/app/auth";
import { signOut } from "next-auth/react";
import {PowerIcon} from "lucide-react";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";

export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();

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

    async function handleLogOut() {
        await signOut({ redirectTo: "/login" });
    }

    return (

        <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-gray-100">
            <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
                <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-700 px-4 py-6 pt-8 text-center sm:px-16">
                    <h3 className="text-2xl font-semibold text-white">Home Page</h3>
                    <p className="text-sm text-gray-400">
                        Questa è un&#39;area protetta. Se la visualizzi allora sei autenticato.
                    </p>
                </div>
            </div>

            <button
                onClick={handleLogOut}
                className="
                    absolute
                    flex h-[48px] grow
                    items-center justify-center gap-2
                    bottom-34
                    px-6 py-3
                    rounded-full
                    bg-gradient-to-r from-red-500 to-red-700
                    text-white
                    font-medium
                    shadow-lg shadow-red-900/30
                    hover:from-red-600 hover:to-red-800
                    hover:scale-105
                    transition-all duration-300
                    border border-red-800/60
                "
            >   <PowerIcon className="w-6" />
                <div className="hidden md:block">Esci</div>
            </button>

        </div>
    );
}
