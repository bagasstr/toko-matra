'use server'

import { prisma } from '@/lib/prisma'
import { regisSchema } from '@/lib/zod'
import bcrypt from 'bcryptjs'
import { addMinutes } from 'date-fns'
import { sendOTPEmail } from '@/lib/sendmailerTransport'
import { generateCustomId } from '@/lib/helpper'

// Tipe respons yang konsisten
type RegistrationResponse = {
  success: boolean
  error?: string
  data?: {
    email: string
    id: string
  }
}

export const registrasi = async (
  formData: FormData
): Promise<RegistrationResponse> => {
  try {
    // Validasi data form
    const data = Object.fromEntries(formData.entries())
    const parseResult = regisSchema.safeParse(data)

    // Jika validasi gagal, kembalikan error
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues
          .map((issue) => issue.message)
          .join(', '),
      }
    }

    const { name, email, password, typeUser } = parseResult.data

    // Periksa apakah email sudah terdaftar
    const userExists = await prisma.user.findUnique({
      where: { email },
    })

    if (userExists) {
      return { success: false, error: 'Email sudah terdaftar' }
    }

    // Hash password dan buat token OTP
    const passwordHash = await bcrypt.hash(password, 10)
    const token = Math.floor(100000 + Math.random() * 900000).toString()
    const expired = addMinutes(new Date(), 5)

    // Jalankan transaksi database
    const result = await prisma.$transaction(async (tx) => {
      try {
        // Buat user baru
        const user = await tx.user.create({
          data: {
            id: generateCustomId('usr'),
            email,
            password: passwordHash,
            typeUser,
            profile: {
              create: {
                id: generateCustomId('prf'),
                fullName: name,
                email,
                userName: `@${email.split('@')[0]}`,
                imageUrl: '/default-profile.png',
              },
            },
          },
        })

        // Buat akun credentials
        await tx.account.create({
          data: {
            id: generateCustomId('acc'),
            userId: user.id,
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: email,
          },
        })

        // Buat token verifikasi
        await tx.verificationToken.create({
          data: {
            id: generateCustomId('vft'),
            identifier: email,
            token,
            expires: expired,
          },
        })

        // Kirim email OTP
        await sendOTPEmail(email, Number(token))

        return { id: user.id, email }
      } catch (txError) {
        // Log error transaksi untuk debugging
        console.error('Transaction error:', txError)
        throw txError // Re-throw untuk ditangkap oleh catch di luar
      }
    })

    return {
      success: true,
      data: result,
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat registrasi',
    }
  }
}
