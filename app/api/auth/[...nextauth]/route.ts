import NextAuth from "next-auth";
import { authOptions } from "@/app/auth";

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

export const { GET, POST } = handlers;