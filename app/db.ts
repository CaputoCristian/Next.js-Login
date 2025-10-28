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