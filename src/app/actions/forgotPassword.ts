'use server'

import { prisma } from '@/lib/prisma'
import { sendOTPEmail } from '@/lib/sendmailerTransport'
import { generateCustomId } from '@/lib/helpper'
import { addMinutes } from 'date-fns'
import bcrypt from 'bcryptjs'

// Define OTP configuration
const OTP_EXPIRATION_MINUTES = 5
const OTP_RESEND_COOLDOWN_MINUTES = 2

export const requestPasswordReset = async (email: string) => {
  try {
    // Validate email
    if (!email) {
      return { error: 'Email is required' }
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
        role: 'CUSTOMER', // Hanya user dengan role CUSTOMER yang bisa reset password
      },
    })

    if (!user) {
      return {
        error:
          'Email tidak terdaftar atau tidak memiliki akses untuk reset password',
      }
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
      const minutesLeft = Math.ceil(
        (OTP_RESEND_COOLDOWN_MINUTES * 60 * 1000 -
          (Date.now() - recentToken.createdAt.getTime())) /
          60000
      )

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
      return {
        success: true,
        message: 'Kode OTP telah dikirim ke email Anda',
        expiresAt: expired,
      }
    } catch (error) {
      console.error('Failed to send OTP email:', error)
      return {
        error: 'Gagal mengirim kode OTP. Silakan coba lagi.',
      }
    }
  } catch (error) {
    console.error('Password reset request error:', error)
    return {
      error: 'Terjadi kesalahan saat memproses permintaan',
    }
  }
}

export const verifyAndResetPassword = async (
  email: string,
  otp: string,
  newPassword: string
) => {
  try {
    // Validate inputs
    if (!email || !otp || !newPassword) {
      return { error: 'Semua field harus diisi' }
    }

    // Validate password
    if (newPassword.length < 8) {
      return { error: 'Password harus minimal 8 karakter' }
    }

    // Find the verification token
    const token = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token: otp,
        },
      },
    })

    if (!token) {
      return { error: 'Kode OTP tidak valid atau sudah kedaluwarsa' }
    }

    // Verify user is not an admin
    const user = await prisma.user.findUnique({
      where: {
        email,
        role: 'CUSTOMER',
      },
    })

    if (!user) {
      return { error: 'Akses ditolak' }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password and delete token in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
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

    return {
      success: true,
      message: 'Password berhasil diubah',
    }
  } catch (error) {
    console.error('Password reset verification error:', error)
    return {
      error: 'Terjadi kesalahan saat memverifikasi dan mengubah password',
    }
  }
}
