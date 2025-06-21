'use server'

import { randomUUID } from 'crypto'
import { prisma } from '../../lib/prisma'
import { cookies } from 'next/headers'
import { generateCustomId } from '@/lib/helpper'

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

export const validateSession = async () => {
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
          profile: true,
          address: true,
          cart: true,
          order: true,
          typeUser: true,
        },
      },
    },
  })

  // Convert any Decimal objects to plain JavaScript numbers/strings
  // by serializing and deserializing the session object
  return session ? JSON.parse(JSON.stringify(session)) : null
}

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

  await prisma.session.delete({
    where: { sessionToken },
  })
  ;(await cookies()).delete('sessionToken')
}
