import { prisma } from './src/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateCustomId } from './src/lib/helpper'
async function seedAdmin() {
  const existingAdmin = await prisma.user.findFirst({
    where: { profile: { email: 'admin@gmail.com' } },
  })

  if (!existingAdmin) {
    await prisma.$transaction(async (tx) => {
      const { id } = await tx.user.create({
        data: {
          id: generateCustomId('usr'),
          email: 'admin@gmail.com',
          emailVerified: new Date(),
          password: await bcrypt.hash('admin123', 10),
          typeUser: '',
          role: 'ADMIN',
          profile: {
            create: {
              id: generateCustomId('prf'),
              email: 'admin@gmail.com',
              fullName: 'Admin',
              phoneNumber: null,
            },
          },
        },
      })
      await tx.account.create({
        data: {
          id: generateCustomId('acc'),
          userId: id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: 'admin@gmail.com',
        },
      })
      return { id }
    })
    console.log('Admin seeded successfully')
  }
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
