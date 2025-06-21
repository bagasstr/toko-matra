import { prisma } from './src/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateCustomId } from './src/lib/helpper'
async function seedAdmin() {
  const existingAdmin = await prisma.user.findFirst({
    where: { profile: { email: 'matra@gmail.com' } },
  })

  if (!existingAdmin) {
    await prisma.$transaction(async (tx) => {
      const { id } = await tx.user.create({
        data: {
          id: generateCustomId('usr'),
          email: 'matra@gmail.com',
          emailVerified: new Date(),
          password: await bcrypt.hash('matrakosala123', 10),
          typeUser: 'perusahaan',
          role: 'SUPER_ADMIN',
          profile: {
            create: {
              id: generateCustomId('prf'),
              email: 'matra@gmail.com',
              fullName: 'Matra',
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
          providerAccountId: 'matra@gmail.com',
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
