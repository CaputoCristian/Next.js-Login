import {NextResponse} from "next/server";

export const runtime = 'nodejs'; // forza Node runtime
import { auth } from "@/app/auth";
import {getToken} from '@/app/db';

export async function POST(req: Request) {

    const session = await auth();
    if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const email = session.user.email;
    const {otp} = await req.json();

    const record = await getToken(email);

    console.log('Trovati:',email, record);

    if (!record)
        return NextResponse.json(
        { error: "L'utente non possiede un OTP" },
        { status: 401 }
        );

    if (record.token !== otp)
        return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 409 }
    );

    // Controllo validità, il token scade dopo 5 minuti. Postgress e Prisma non permettono di farlo scadere in automatico
    const ageMs = Date.now() - record.creation_time.getTime();
    const maxAge = 5 * 60 * 1000;

    if (ageMs > maxAge) return NextResponse.json(
        { error: "OTP Expired" },
        { status: 408 }
    )

    console.log('Verifica effettuata con successo');

    return NextResponse.json({ ok: true });
}
