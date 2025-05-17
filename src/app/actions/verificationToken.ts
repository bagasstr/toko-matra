'use server'

// import { auth, signIn } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/app/actions/session'
import { redirect } from 'next/navigation'

export const verificationOtp = async (FormData: FormData) => {
  try {
    const data = Object.fromEntries(FormData.entries())
    const { email, otp } = data as { email: string; otp: string }
    const token = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token: otp,
        },
      },
    })

    if (!token) return { error: 'OTP tidak valid atau kadarluarsa' }
    await prisma.$transaction([
      prisma.user.update({
        where: {
          email,
        },
        data: {
          emailVerified: new Date(),
        },
      }),
      prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token: otp,
          },
        },
      }),
    ])

    const existsUser = await prisma.user.findUnique({
      where: { email },
    })
    if (existsUser?.emailVerified) {
      await createSession(existsUser?.id)
    }
    return { success: true }
  } catch (error) {
    console.log(error)
  }
}
