'use server'

import { prisma } from '@/lib/prisma'

export const getUser = async (id: string) => {
  const users = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      email: true,
      emailVerified: true,
      profile: true,
      address: true,
      review: true,
      cart: true,
      order: true,
      typeUser: true,
    },
  })
  return users
}

export const updateUser = async (id: string, data: any) => {
  const users = await prisma.user.update({ where: { id }, data })
  return users
}
