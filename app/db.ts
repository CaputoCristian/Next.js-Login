import { PrismaClient } from '@/app/generated/prisma'
import { genSaltSync, hashSync } from 'bcrypt-ts'

// Prisma è un ORM (Object-Relational Mapping).
// Prisma gestisce automaticamente la creazione delle tabelle usando:
// npx prisma db push

const prisma = new PrismaClient()

export async function getUser(email: string) {
    return await prisma.user.findUnique({
        where: {
            email: email
        }
    })
}

export async function createUser(email: string, password: string) {
    const salt = genSaltSync(10)
    const hash = hashSync(password, salt)

    return await prisma.user.create({
        data: {
            email,
            password: hash
        }
    })
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
            token: token,
            creation_time: date,
        },
    });
    } else {
            await prisma.token.create({
                data: {
                    email,
                    token: token,
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

export async function verifyOtp(email: string, otp: string) {
    const record = await getToken(email);

    if (!record) return false;

    if (record.token !== otp) throw new Error('Invalid OTP') ;

    // Controllo validità, il token scade dopo 5 minuti. Postgress e Prisma non permettono di farlo scadere in automatico
    const ageMs = Date.now() - record.creation_time.getTime();
    const maxAge = 5 * 60 * 1000;

    if (ageMs > maxAge) throw new Error('OTP expired');

    return true;
}

//Il token va eliminato dopo un login riuscito
export async function deleteOtp(email: string) {
    await prisma.token.delete({
        where: { email },
    }).catch(() => {});
}
