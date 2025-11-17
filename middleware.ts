import { auth } from "@/app/auth";
import {NextRequest, NextResponse} from "next/server";
import type { NextAuthRequest } from "next-auth";
import { getToken } from "next-auth/jwt";

//export default auth((req: NextAuthRequest) => {
export async function middleware(req : NextRequest) {
    const {pathname} = req.nextUrl;
    const token = await getToken({req, secret: process.env.AUTH_SECRET});
    const isLoggedIn = !!token;
    const isPending2FA = token?.pending2FA === true;


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
}

export const config = {
    matcher: ["/home/:path*", "/login", "/register", "/verify"],
};
