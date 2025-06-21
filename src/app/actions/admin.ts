'use server'

// crud admin

import { prisma } from '@/lib/prisma'
import { generateCustomId } from '@/lib/helpper'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'

interface AdminData {
  email: string
  password?: string
  fullName: string
  phoneNumber?: string
  role: 'SUPER_ADMIN' | 'ADMIN'
}

interface AdminResponse<T> {
  data?: T
  error?: string
}

async function checkSuperAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized: Only Super Admins can perform this action')
  }
}

// Get all admins
export async function getAdmins(): Promise<AdminResponse<any[]>> {
  try {
    await checkSuperAdmin()

    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['SUPER_ADMIN', 'ADMIN'],
        },
      },
      include: {
        profile: true,
      },
    })
    return { data: admins }
  } catch (error) {
    console.error('Error fetching admins:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch admins',
    }
  }
}

// Get single admin
export async function getAdmin(id: string): Promise<AdminResponse<any>> {
  try {
    await checkSuperAdmin()

    const admin = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    })
    return { data: admin }
  } catch (error) {
    console.error('Error fetching admin:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch admin',
    }
  }
}

// Create admin
export async function createAdmin(
  data: AdminData
): Promise<AdminResponse<any>> {
  try {
    await checkSuperAdmin()

    const existingAdmin = await prisma.user.findFirst({
      where: { email: data.email },
    })

    if (existingAdmin) {
      return { error: 'Email already exists' }
    }

    if (!data.password) {
      return { error: 'Password is required' }
    }

    const admin = await prisma.$transaction(async (tx) => {
      const { id } = await tx.user.create({
        data: {
          id: generateCustomId('usr'),
          email: data.email,
          emailVerified: new Date(),
          password: await bcrypt.hash(data.password, 10),
          role: data.role,
          typeUser: 'admin',
          profile: {
            create: {
              id: generateCustomId('prf'),
              email: data.email,
              fullName: data.fullName,
              phoneNumber: data.phoneNumber,
            },
          },
        },
      })

      await tx.account.create({
        data: {
          id: generateCustomId('acc'),
          userId: id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: data.email,
        },
      })

      return { id }
    })

    revalidatePath('/dashboard/admin')
    return { data: admin }
  } catch (error) {
    console.error('Error creating admin:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to create admin',
    }
  }
}

// Update admin
export async function updateAdmin(
  id: string,
  data: Partial<AdminData>
): Promise<AdminResponse<any>> {
  try {
    await checkSuperAdmin()

    // Get the current user
    const currentUser = await getCurrentUser()

    // Check if trying to modify own role
    if (currentUser?.id === id && data.role && data.role !== currentUser.role) {
      return { error: 'You cannot change your own role' }
    }

    if (data.email) {
      const existingAdmin = await prisma.user.findFirst({
        where: {
          AND: [{ email: data.email }, { id: { not: id } }],
        },
      })

      if (existingAdmin) {
        return { error: 'Email already exists' }
      }
    }

    const updateData: any = {
      ...(data.email && { email: data.email }),
      ...(data.role && { role: data.role }),
      profile: {
        update: {
          ...(data.fullName && { fullName: data.fullName }),
          ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
          ...(data.email && { email: data.email }),
        },
      },
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    const admin = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        profile: true,
      },
    })

    revalidatePath('/dashboard/admin')
    return { data: admin }
  } catch (error) {
    console.error('Error updating admin:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to update admin',
    }
  }
}

// Delete admin
export async function deleteAdmin(id: string): Promise<AdminResponse<boolean>> {
  try {
    await checkSuperAdmin()

    // Get the current user
    const currentUser = await getCurrentUser()

    // Prevent self-deletion
    if (currentUser?.id === id) {
      return { error: 'You cannot delete your own account' }
    }

    await prisma.user.delete({
      where: { id },
    })
    revalidatePath('/dashboard/admin')
    return { data: true }
  } catch (error) {
    console.error('Error deleting admin:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to delete admin',
    }
  }
}
