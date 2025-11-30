"use client";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import googleLogo from "@/public/google.png";
import githubLogo from "@/public/github.png";
import {Eye, EyeOff} from "lucide-react";

export default function ErrorPage() {
    const params = useSearchParams();
    const error = params.get("error");

    return (

        <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-gray-100">
            <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
                <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-700 px-4 py-6 pt-8 text-center sm:px-16">
                    <h2 className="text-2xl font-semibold text-white">
                        Errore durante l&#39;autenticazione
                    </h2>
                    <p className = "text-red-500 mt-2 ">
                        {error === "ProviderMismatch"
                        ? "Questo account è registrato con un altro provider."
                        : "Si è verificato un errore."
                    }
                    </p>
                    <a href="/login" className="text-blue-400 hover:underline mt-3 inline-block">
                        Riprova.
                    </a>
                </div>

            </div>
        </div>
    );

}