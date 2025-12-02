import {NextResponse} from 'next/server';
import {createUser, getUser} from '@/app/db';
import {signIn} from "next-auth/react";
import {updateUser} from "rc9";

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

        const newUser = await createUser(email, password);

        if(!newUser) {
            return NextResponse.json(
                { error: 'Utente già registrato' },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { message: 'Registrazione completata', user: { email: newUser.email } },
            { status: 201 }
        );

    } catch (error) {
        console.error('Errore nella registrazione:', error);
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        );
    }
}
