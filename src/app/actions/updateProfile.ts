'use server'

import { generateCustomId } from '@/lib/helpper'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

type ProfileData = {
  fullName?: string
  userName?: string
  phoneNumber?: string
  gender?: string
  dateOfBirth?: string
}

export async function updateProfile(userId: string, data: ProfileData) {
  try {
    // Cek apakah pengguna ada
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })

    if (!user) {
      return { success: false, error: 'Pengguna tidak ditemukan' }
    }

    // Update atau buat profil jika belum ada
    if (user.profile) {
      // Update profil yang sudah ada
      await prisma.profile.update({
        where: { id: user.profile.id },
        data: {
          fullName: data.fullName,
          userName: data.userName,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
        },
      })
    } else {
      // Buat profil baru jika belum ada
      await prisma.profile.create({
        data: {
          id: generateCustomId('PRF'),
          userId: userId,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
        },
      })
    }

    // Revalidasi path untuk memperbarui tampilan
    revalidatePath(`/akun/${userId}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'Gagal memperbarui profil' }
  }
}
