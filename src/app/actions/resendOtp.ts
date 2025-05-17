'use server'

import { generateCustomId } from '@/lib/helpper'
import { prisma } from '@/lib/prisma'
import { sendOTPEmail } from '@/lib/sendmailerTransport'
import { addMinutes } from 'date-fns'

export const resendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: 'User not found' }

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  })
  const token = Math.floor(100000 + Math.random() * 900000).toString()
  const expired = addMinutes(new Date(), 5)

  await prisma.verificationToken.create({
    data: {
      id: generateCustomId('VFT'),
      identifier: email,
      token,
      expires: expired,
    },
  })
  console.log('resendOtp:', token)
  await sendOTPEmail(email, Number(token))

  return { success: true }
}
