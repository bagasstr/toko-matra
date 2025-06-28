'use server'

import { randomUUID } from 'crypto'
import { prisma } from '../../lib/prisma'
import { cookies } from 'next/headers'
import { generateCustomId } from '@/lib/helpper'
import { cache } from 'react'

export const createSession = async (id: string) => {
  const expires = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
  const sessionToken = randomUUID()

  const exists = await prisma.account.findFirst({
    where: { userId: id },
  })
  // console.log('exists', exists);

  if (exists?.provider === 'credentials') {
    const session = await prisma.session.create({
      data: {
        id: generateCustomId('ses'),
        sessionToken,
        userId: id,
        expires,
      },
    })
    ;(await cookies()).set('sessionToken', sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      expires,
    })

    // console.log('session', session);

    return session
  }
}

export const validateSession = cache(async () => {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('sessionToken')?.value
  if (!sessionToken) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: {
      user: {
        select: {
          id: true,
          role: true,
          email: true,
          emailVerified: true,
          typeUser: true,
          profile: {
            select: {
              id: true,
              fullName: true,
              userName: true,
              imageUrl: true,
              phoneNumber: true,
              gender: true,
              dateOfBirth: true,
              bio: true,
              companyName: true,
            },
          },
          address: {
            select: {
              id: true,
              labelAddress: true,
              address: true,
              city: true,
              province: true,
              district: true,
              village: true,
              postalCode: true,
              isPrimary: true,
              isActive: true,
              recipientName: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          _count: {
            select: {
              order: true,
            },
          },
        },
      },
    },
  })

  // Convert any Decimal objects to plain JavaScript numbers/strings
  return session ? JSON.parse(JSON.stringify(session)) : null
})

export const destroySession = async () => {
  const getSession = (await cookies()).get('sessionToken')?.value
  if (!getSession) return
  await prisma.session.deleteMany({ where: { sessionToken: getSession } })
  ;(await cookies()).delete('sessionToken')
}

export const logout = async () => {
  const sessionToken = (await cookies()).get('sessionToken')?.value
  if (!sessionToken) {
    return
  }

  // Temukan userId dari sessionToken
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: { userId: true },
  })

  await prisma.session.delete({
    where: { sessionToken },
  })
  ;(await cookies()).delete('sessionToken')

  // Hapus notifikasi login user
  if (session?.userId) {
    await prisma.notification.deleteMany({
      where: {
        userId: session.userId,
        title: 'Login Berhasil',
      },
    })
  }
}
