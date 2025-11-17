import {NextResponse} from 'next/server';
import {createUser, getUser} from '@/app/db';
import {signIn} from "next-auth/react";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email e password sono obbligatorie' },
                { status: 400 }
            );
        }

        const existingUser = await getUser(email);
        if (existingUser) {
            return NextResponse.json(
                { error: 'Utente già registrato' },
                { status: 409 }
            );
        }

        const newUser = await createUser(email, password);

        return NextResponse.json(
            { message: 'Registrazione completata', user: { email: newUser.email } },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Errore nella registrazione:', error);
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        );
    }
}
