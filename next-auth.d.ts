import NextAuth from "next-auth";

declare module "next-auth" {
    interface User {
        pending2FA?: boolean;
    }

    interface Session {
        user: {
            pending2FA?: boolean;
        } & DefaultSession["user"];
    }

    interface JWT {
        pending2FA?: boolean;
    }
}