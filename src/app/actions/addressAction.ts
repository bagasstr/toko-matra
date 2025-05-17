'use server'

import { prisma } from '@/lib/prisma'
import { AddressFormValues } from '@/types/address'
import { revalidatePath } from 'next/cache'
import { generateCustomId } from '@/lib/helpper'

// Fungsi untuk menambah alamat baru
export async function addAddress(userId: string, data: AddressFormValues) {
  try {
    console.log('addAddress', userId, data)

    // Validasi input
    if (!userId || !data || Object.values(data).some((val) => !val)) {
      return { success: false, error: 'Data tidak lengkap' }
    }

    console.log('addAddress', userId, data)

    // Cek apakah pengguna ada menggunakan transaction untuk konsistensi
    const existsAddr = await prisma.address.findMany({
      where: { userId: userId },
    })
    const countAddr = existsAddr.length
    console.log('existsAddr', countAddr)

    if (!existsAddr) {
      return { success: false, error: 'Pengguna tidak ditemukan' }
    }

    // Tambah alamat baru
    await prisma.address.create({
      data: {
        id: generateCustomId('ADR'),
        userId,
        labelAddress: data.labelAddress,
        recipientName: data.recipientName,
        address: data.address,
        city: data.city,
        district: data.district,
        village: data.villages,
        province: data.province,
        postalCode: data.postalCode,
        isPrimary: countAddr === 0, // Hanya true jika belum ada alamat sama sekali
        isActive: countAddr === 0,
      },
    })
    revalidatePath(`/profile`)
    return { success: true }
  } catch (error) {
    console.error('Error menambah alamat:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal menambah alamat',
    }
  }
}

// Fungsi untuk mengubah alamat
export async function updateAddress(
  addressId: string,
  data: Partial<AddressFormValues>
) {
  try {
    if (!addressId || !data) {
      return { success: false, error: 'Data tidak lengkap' }
    }

    // Cek dan update alamat dalam satu transaction
    const result = await prisma.$transaction(async (tx) => {
      const address = await tx.address.findUnique({
        where: { id: addressId },
      })

      if (!address) {
        throw new Error('Alamat tidak ditemukan')
      }

      await tx.address.update({
        where: { id: addressId },
        data: {
          labelAddress: data.labelAddress,
          recipientName: data.recipientName,
          address: data.address,
          city: data.city,
          district: data.district,
          village: data.villages,
          province: data.province,
          postalCode: data.postalCode,
        },
      })

      return address.userId
    })

    revalidatePath(`/profile`)
    return { success: true }
  } catch (error) {
    console.error('Error mengubah alamat:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal mengubah alamat',
    }
  }
}

// Fungsi untuk menghapus alamat
export async function deleteAddress(addressId: string) {
  try {
    if (!addressId) {
      return { success: false, error: 'ID alamat tidak valid' }
    }

    const result = await prisma.$transaction(async (tx) => {
      const address = await tx.address.findUnique({
        where: { id: addressId },
      })

      if (!address) {
        throw new Error('Alamat tidak ditemukan')
      }

      await tx.address.delete({
        where: { id: addressId },
      })

      return address.userId
    })

    revalidatePath(`/akun/${result}`)
    return { success: true }
  } catch (error) {
    console.error('Error menghapus alamat:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal menghapus alamat',
    }
  }
}

// Fungsi untuk mengambil detail alamat
export async function getAddress(addressId: string) {
  try {
    if (!addressId) {
      return { success: false, error: 'ID alamat tidak valid' }
    }

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    })

    if (!address) {
      return { success: false, error: 'Alamat tidak ditemukan' }
    }

    return { success: true, data: address }
  } catch (error) {
    console.error('Error mengambil alamat:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal mengambil alamat',
    }
  }
}

export async function activeAddress(userId: string, addressId: string) {
  try {
    if (!userId || !addressId) {
      return { success: false, error: 'Data tidak lengkap' }
    }

    await prisma.$transaction(async (tx) => {
      const address = await tx.address.findUnique({
        where: { id: addressId },
      })

      if (!address || address.userId !== userId) {
        throw new Error('Alamat tidak valid')
      }

      await tx.address.updateMany({
        where: { userId },
        data: { isActive: false },
      })

      await tx.address.update({
        where: { id: addressId },
        data: { isActive: true },
      })
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error mengaktifkan alamat:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal mengaktifkan alamat',
    }
  }
}

export async function setPrimaryAddress(addressId: string) {
  try {
    if (!addressId) {
      return { success: false, error: 'ID alamat tidak valid' }
    }

    const result = await prisma.$transaction(async (tx) => {
      const address = await tx.address.findUnique({
        where: { id: addressId },
      })

      if (!address) {
        throw new Error('Alamat tidak ditemukan')
      }

      await tx.address.updateMany({
        where: { userId: address.userId },
        data: { isPrimary: false },
      })

      await tx.address.update({
        where: { id: addressId },
        data: { isPrimary: true },
      })

      return address.userId
    })

    revalidatePath(`/akun/${result}`)
    return { success: true }
  } catch (error) {
    console.error('Error mengubah alamat utama:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal mengubah alamat utama',
    }
  }
}

export async function setActiveAddress(addressId: string) {
  try {
    if (!addressId) {
      return { success: false, error: 'ID alamat tidak valid' }
    }

    const result = await prisma.$transaction(async (tx) => {
      const address = await tx.address.findUnique({
        where: { id: addressId },
      })

      if (!address) {
        throw new Error('Alamat tidak ditemukan')
      }

      await tx.address.updateMany({
        where: { userId: address.userId },
        data: { isActive: false },
      })

      await tx.address.update({
        where: { id: addressId },
        data: { isActive: true },
      })

      return address.userId
    })

    revalidatePath(`/profile`)
    return { success: true }
  } catch (error) {
    console.error('Error mengaktifkan alamat:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal mengaktifkan alamat',
    }
  }
}
