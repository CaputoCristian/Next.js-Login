import { PrismaClient } from '@/app/generated/prisma'
import {compare, genSaltSync, hashSync} from 'bcrypt-ts'

// Prisma è un ORM (Object-Relational Mapping).
// Prisma gestisce automaticamente la creazione delle tabelle usando:
// npx prisma db push

const prisma = new PrismaClient()

export async function getUser(email: string) {
    return prisma.user.findUnique({
        where: {
            email: email
        }
    });
}

export async function createUser(email: string, password: string) {
    const salt = genSaltSync(10)
    const hash = hashSync(password, salt)


    const existing_user = await prisma.user.findUnique({
        where: { email },
    });

    //Se non esiste un utente con quella email, crea uno nuovo.
    if (!existing_user) {
        return prisma.user.create({
            data: {
                email: email,
                provider: "credentials",
                password: hash,
                providerAccountId: null,
                verified: false
            }
        });
    }

    //Se esiste un utente con quella mail, ma non l'ha mai confermata, lo sovrascrive.
    if (existing_user && !existing_user.verified) {
        return prisma.user.update({
            where: { email },
            data: {
                email: email,
                provider: "credentials",
                password: hash,
                providerAccountId: null,
                verified: false,
            },
        });
    }

    //Esiste un utente, ed è verificato.
    return null;
}

export async function createUserOAuth(email: string, provider: string, providerAccountId: string) {
    const salt = genSaltSync(10)
    const hash = hashSync(providerAccountId, salt)

    const existing_user = await prisma.user.findUnique({
        where: { email },
    });

    if (!existing_user) {
        return prisma.user.create({
            data: {
                email: email,
                provider: provider,
                providerAccountId: hash,
                verified: false
            }
        });
    }

    if (existing_user && !existing_user.verified) {
        await prisma.user.update({
            where: { email },
            data: {
                email: email,
                provider: provider,
                password: null,
                providerAccountId: hash,
                verified: false,
            },
        });
    }
    return null;
}

//Se esiste un account che non è mai stato verificato, lo elimina (non sovrascrive email e password per evitare problemi con i provider) e ne crea uno nuovo.
//Se l'account non è mai stato verificato -> Non si è mai autenticato -> Non vengono persi dati.
export async function updateUser(email: string, password: string) {
    await prisma.user.delete({
        where: { email },
    });
    return await createUser(email, password)
}


export async function verifyUser(email: string) {
    return prisma.user.update({
        where: { email },
        data: {
            verified: true
        }
    });
}

export async function createToken(email: string) {
    const salt = genSaltSync(10)
    const token = Math.floor(100000 + Math.random() * 900000).toString() //6 Cifre
    const hash = hashSync(token, salt)

    const date = new Date();

    const existing_token = await prisma.token.findUnique({
        where: { email },
    });

    if (existing_token) {
        await prisma.token.update({
        where: { email },
        data: {
            token: hash,
            creation_time: date,
        },
    });
    } else {
            await prisma.token.create({
                data: {
                    email: email,
                    token: hash,
                    creation_time: date,
                },
            });
        }
    return token;

}

export async function getToken(email: string) {
    return prisma.token.findUnique({
        where: {
            email: email
        }
    });
}


//Non utilizzato, controllo avviene nella chiamata POST, migliore gestione degli errori.
export async function verifyOtp(email: string, otp: string) {
    const record = await getToken(email);

    if (!record) return false;

    // Controllo validità, il token scade dopo 5 minuti. Postgress e Prisma non permettono di farlo scadere in automatico
    const ageMs = Date.now() - record.creation_time.getTime();
    const maxAge = 5 * 60 * 1000;
    if (ageMs > maxAge) throw new Error('OTP expired');

    const tokenMatch = await compare(otp as string, record.token);
    if (!tokenMatch) throw new Error('Invalid OTP') ;

    return true;
}

//Il token va eliminato dopo un login riuscito
export async function deleteOtp(email: string) {
    await prisma.token.delete({
        where: { email },
    }).catch(() => {});
}
