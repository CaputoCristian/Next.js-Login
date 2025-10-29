import { PrismaClient } from '@/app/generated/prisma'
import { hashSync, genSaltSync } from 'bcrypt-ts'

const prisma = new PrismaClient()

async function main() {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: 'admin@example.com'
        }
    })

    if (!existingUser) {
        const salt = genSaltSync(10)
        const hashedPassword = hashSync('password', salt)

        const user = await prisma.user.create({
            data: {
                email: 'admin@example.com',
                password: hashedPassword,
            }
        })
        console.log('Utente di default creato:', user.email)
    } else {
        console.log('Utente di default già esistente')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })