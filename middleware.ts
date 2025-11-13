import { auth } from "@/app/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

export default auth((req: NextAuthRequest) => {    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const isOnHome = nextUrl.pathname.startsWith("/home");
    const isOnAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

    if (isOnHome && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (isLoggedIn && isOnAuthPage) {
        return NextResponse.redirect(new URL("/home", req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/home/:path*", "/login", "/register"],
};
