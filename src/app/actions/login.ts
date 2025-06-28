'use server'

import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/zod'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { ZodError, type z } from 'zod'
import { createSession, validateSession } from './session'
import { revalidatePath } from 'next/cache'
import { createNotification, existingNotification } from './notificationAction'

export const login = async (formData: FormData) => {
  try {
    const data = Object.fromEntries(formData)
    const parseData = loginSchema.safeParse(data)

    if (!parseData.success) {
      return { error: 'Silakan masukkan email dan password yang valid' }
    }

    const { email, password } = parseData.data

    const existsUser = await prisma.user.findUnique({
      where: { email },
    })

    if (!existsUser) {
      return { error: 'Email tidak terdaftar' }
    }

    const hashPswd = await bcrypt.compare(password, existsUser.password || '')
    if (!hashPswd) {
      return { error: 'Password salah' }
    }

    await createSession(existsUser.id)
    // Create login notification
    try {
      const existingLoginNotification = await existingNotification(
        existsUser.id
      )
      if (!existingLoginNotification) {
        await createNotification(
          existsUser.id,
          'Login Berhasil',
          'Anda telah berhasil masuk ke akun Anda.',
          false
        )
      }
    } catch (notificationError) {
      console.warn('Failed to create login notification:', notificationError)
      // Don't fail login if notification fails
    }

    // Invalidate cart data to ensure it's refreshed after login
    revalidatePath('/keranjang')
    revalidatePath('/')

    return { success: true }
  } catch (error: any) {
    console.error('Login error:', error)
    return {
      error: error.message || 'Terjadi kesalahan saat login',
    }
  }
}

// Fungsi untuk mendapatkan data user yang aman (tanpa data sensitif)
export const getSafeUserData = async (userId: string) => {
  if (!userId) return null

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        typeUser: true,
        emailVerified: true,
        profile: {
          select: {
            id: true,
            fullName: true,
            userName: true,
            imageUrl: true,
            phoneNumber: true,
            companyName: true,
          },
        },
      },
    })

    return user
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}
