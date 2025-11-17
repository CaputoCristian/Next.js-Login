import {createToken} from "@/app/db";

export const runtime = 'nodejs'; // forza Node runtime
import { sendOtpEmail } from '@/app/util/sendOtpEmail';
import {NextResponse} from "next/server";
import {auth} from "@/app/auth";

export async function POST(req: Request) {

    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const email = session.user.email;
    //Genera un nuovo OTP e fa scadere quello vecchio
    const otp = await createToken(email);

    await sendOtpEmail(email, otp);

    console.log("Codice inviato con successo:", otp);

    return new Response(null, { status: 200 });
}