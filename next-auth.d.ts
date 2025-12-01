import NextAuth, {DefaultSession} from "next-auth";
import {DefaultUser} from "@auth/core/types";

declare module "next-auth" {
    interface User extends DefaultUser{
        pending2FA?: boolean;
        remindMe: boolean;
    }

    interface Session extends DefaultSession {
        user: {
            id: string;
            email: string;
            pending2FA: boolean;
            remindMe: boolean;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        pending2FA: boolean;
        remindMe: boolean;
        loginTimestamp: number;
    }
}