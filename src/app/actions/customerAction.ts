'use server'

import { prisma } from '@/lib/prisma'
import { validateSession } from './session'
import { revalidatePath } from 'next/cache'

// Type untuk data pelanggan
interface CustomerData {
  name: string
  email: string
  phone: string
  address?: string
}

// Mendapatkan semua pelanggan
export async function getAllCustomers() {
  try {
    // Validasi session dan pastikan admin
    const session = await validateSession()

    if (!session || !session.user) {
      return { success: false, message: 'Unauthorized' }
    }

    // Ambil semua pelanggan dengan profile
    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER', // Hanya ambil user dengan role CUSTOMER
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            fullName: true,
            phoneNumber: true,
          },
        },
        address: {
          select: {
            address: true,
            city: true,
            province: true,
          },
          take: 1, // Ambil alamat pertama saja
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Format data pelanggan
    const formattedCustomers = customers.map((customer) => ({
      id: customer.id,
      name: customer.profile?.fullName || 'Tidak ada nama',
      email: customer.email,
      phone: customer.profile?.phoneNumber || 'Tidak ada nomor',
      address: customer.address[0]
        ? `${customer.address[0].address || ''}, ${
            customer.address[0].city || ''
          }, ${customer.address[0].province || ''}`
        : 'Tidak ada alamat',
      createdAt: customer.createdAt.toISOString(),
    }))

    return { success: true, customers: formattedCustomers }
  } catch (error) {
    console.error('Error getting customers:', error)
    return { success: false, message: 'Failed to fetch customers' }
  }
}

// Mendapatkan detail pelanggan berdasarkan ID
export async function getCustomerById(id: string) {
  try {
    // Validasi session dan pastikan admin
    const session = await validateSession()

    if (!session || !session.user) {
      return { success: false, message: 'Unauthorized' }
    }

    // Ambil data pelanggan
    const customer = await prisma.user.findUnique({
      where: {
        id,
        role: 'CUSTOMER', // Hanya ambil user dengan role CUSTOMER
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            fullName: true,
            phoneNumber: true,
          },
        },
        address: {
          select: {
            id: true,
            address: true,
            city: true,
            province: true,
          },
        },
        order: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Ambil 5 pesanan terakhir
        },
      },
    })

    if (!customer) {
      return { success: false, message: 'Customer not found' }
    }

    return { success: true, customer }
  } catch (error) {
    console.error('Error getting customer by id:', error)
    return { success: false, message: 'Failed to fetch customer details' }
  }
}

// Mencari pelanggan berdasarkan nama atau email
export async function searchCustomers(query: string) {
  try {
    // Validasi session dan pastikan admin
    const session = await validateSession()

    if (!session || !session.user) {
      return { success: false, message: 'Unauthorized' }
    }

    // Mencari pelanggan berdasarkan nama atau email
    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER', // Hanya ambil user dengan role CUSTOMER
        OR: [
          {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            profile: {
              fullName: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            fullName: true,
            phoneNumber: true,
          },
        },
        address: {
          select: {
            address: true,
            city: true,
            province: true,
          },
          take: 1,
        },
      },
    })

    // Format data pelanggan
    const formattedCustomers = customers.map((customer) => ({
      id: customer.id,
      name: customer.profile?.fullName || 'Tidak ada nama',
      email: customer.email,
      phone: customer.profile?.phoneNumber || 'Tidak ada nomor',
      address: customer.address[0]
        ? `${customer.address[0].address || ''}, ${
            customer.address[0].city || ''
          }, ${customer.address[0].province || ''}`
        : 'Tidak ada alamat',
      createdAt: customer.createdAt.toISOString(),
    }))

    return { success: true, customers: formattedCustomers }
  } catch (error) {
    console.error('Error searching customers:', error)
    return { success: false, message: 'Failed to search customers' }
  }
}

// Menghapus pelanggan berdasarkan ID
export async function deleteCustomer(id: string) {
  try {
    // Validasi session dan pastikan admin
    const session = await validateSession()

    if (!session || !session.user) {
      return { success: false, message: 'Unauthorized' }
    }

    // Periksa apakah ID yang diberikan adalah user dengan role CUSTOMER
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { role: true, _count: { select: { order: true } } },
    })

    if (!userToDelete) {
      return { success: false, message: 'Pelanggan tidak ditemukan' }
    }

    if (userToDelete.role !== 'CUSTOMER') {
      return {
        success: false,
        message: 'Hanya akun pelanggan yang dapat dihapus melalui menu ini',
      }
    }

    // Periksa apakah pelanggan memiliki pesanan
    if (userToDelete._count.order > 0) {
      return {
        success: false,
        message:
          'Tidak dapat menghapus pelanggan yang memiliki pesanan. Nonaktifkan akun sebagai gantinya.',
      }
    }

    // Hapus semua data terkait: profil, alamat, dll
    await prisma.$transaction([
      // Hapus profil
      prisma.profile.deleteMany({
        where: { userId: id },
      }),
      // Hapus alamat
      prisma.address.deleteMany({
        where: { userId: id },
      }),
      // Hapus user
      prisma.user.delete({
        where: { id },
      }),
    ])

    revalidatePath('/dashboard/pelanggan')
    return { success: true, message: 'Pelanggan berhasil dihapus' }
  } catch (error) {
    console.error('Error deleting customer:', error)
    return { success: false, message: 'Failed to delete customer' }
  }
}
