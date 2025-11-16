import { auth } from "@/app/auth";
import {NextRequest, NextResponse} from "next/server";
import type { NextAuthRequest } from "next-auth";

type ReqWithAuth = NextRequest & {
    auth?: {
        user?: {
            pending2FA?: boolean;
            email?: string;
            id?: string;
        } | null;
    };
};

export default auth((req: NextAuthRequest) => {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;
    const user = req.auth?.user ?? null;
    const isLoggedIn = !!user;
    const isPending2FA = !!user?.pending2FA;

    if (pathname.startsWith("/home")) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
        if (isPending2FA) {
            // Autenticato ma in attesa di verifica
            return NextResponse.redirect(new URL("/verify", req.url));
        }
        return NextResponse.next();
    }

    if (pathname.startsWith("/verify")) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
        if (!isPending2FA) {
            // Loggato e non in attesa di verifica
            return NextResponse.redirect(new URL("/home", req.url));
        }
        return NextResponse.next();
    }

    if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
        if (isLoggedIn) {
            return NextResponse.redirect(
                new URL(isPending2FA ? "/verify" : "/home", req.url)
            );
        }
        return NextResponse.next();
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/home/:path*", "/login", "/register"],
};
