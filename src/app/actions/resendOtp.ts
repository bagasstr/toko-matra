'use server'

import { generateCustomId } from '@/lib/helpper'
import { prisma } from '@/lib/prisma'
import { sendOTPEmail } from '@/lib/sendmailerTransport'
import { addMinutes, differenceInMinutes } from 'date-fns'

// Define OTP configuration
const OTP_EXPIRATION_MINUTES = 5
const OTP_RESEND_COOLDOWN_MINUTES = 2

export const resendOtp = async (email: string) => {
  // Validate email
  if (!email) {
    return { error: 'Email is required' }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { error: 'User not found' }
  }

  // Check for recent OTP requests to prevent spam
  const recentToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
      createdAt: {
        gte: new Date(Date.now() - OTP_RESEND_COOLDOWN_MINUTES * 60 * 1000),
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (recentToken) {
    const minutesLeft =
      OTP_RESEND_COOLDOWN_MINUTES -
      Math.abs(differenceInMinutes(new Date(), recentToken.createdAt))

    return {
      error: `Silakan tunggu ${minutesLeft} menit sebelum meminta OTP baru`,
      cooldownRemaining: minutesLeft,
    }
  }

  // Delete existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  })

  // Generate new OTP
  const token = Math.floor(100000 + Math.random() * 900000).toString()
  const expired = addMinutes(new Date(), OTP_EXPIRATION_MINUTES)

  // Create new verification token
  await prisma.verificationToken.create({
    data: {
      id: generateCustomId('vft'),
      identifier: email,
      token,
      expires: expired,
    },
  })

  // Send OTP via email
  try {
    await sendOTPEmail(email, Number(token))
    console.log('resendOtp:', token)

    return {
      success: true,
      message: 'Kode OTP baru telah dikirim',
      expiresAt: expired,
    }
  } catch (error) {
    console.error('Failed to send OTP email:', error)
    return {
      error: 'Gagal mengirim kode OTP. Silakan coba lagi.',
      details: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
