'use server'

import { cookies } from 'next/headers'
import { validateSession } from './session'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { writeFile } from 'fs/promises'
import path from 'path'
import { generateCustomId } from '@/lib/helpper'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

interface ProfileData {
  fullName: string
  userName: string
  phoneNumber: string
  gender: 'male' | 'female' | 'other'
  dateOfBirth: string
  bio?: string
  companyName?: string
  taxId?: string
  imageUrl?: string
}

async function saveImage(base64Image: string, userId: string): Promise<string> {
  try {
    // Remove data:image/jpeg;base64, from the string
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Create directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'assets', 'avatar')
    await writeFile(path.join(uploadDir, `${userId}.jpg`), buffer)

    // Return the API route URL
    return `/api/images/assets/avatar/${userId}.jpg`
  } catch (error) {
    console.error('Error saving image:', error)
    throw new Error('Failed to save image')
  }
}

export async function updateProfile(userId: string, data: ProfileData) {
  try {
    const session = await validateSession()
    if (!session) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: {
        id: userId,
      },
    })

    // Check if phone number is already taken by another user
    if (data.phoneNumber) {
      const existingUser = await prisma.profile.findFirst({
        where: {
          phoneNumber: data.phoneNumber,
          id: {
            not: userId,
          },
        },
      })

      if (existingUser) {
        return {
          success: false,
          error: 'Nomor telepon sudah digunakan',
        }
      }
    }

    let imageUrl = data.imageUrl

    // If there's a new image (base64), save it
    if (data.imageUrl && data.imageUrl.startsWith('data:image')) {
      imageUrl = await saveImage(data.imageUrl, userId)
    }

    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: {
        id: userId,
      },
      update: {
        fullName: data.fullName,
        userName: data.userName,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        bio: data.bio,
        companyName: data.companyName,
        taxId: data.taxId,
        imageUrl: imageUrl,
      },
      create: {
        id: userId,
        userId: session.user.id, // Use the authenticated user's ID
        fullName: data.fullName,
        userName: data.userName,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        bio: data.bio,
        companyName: data.companyName,
        taxId: data.taxId,
        imageUrl: imageUrl,
      },
    })

    return {
      success: true,
      data: profile,
    }
  } catch (error) {
    console.error('Update profile error:', error)
    return {
      success: false,
      error: 'Failed to update profile',
    }
  }
}

export async function getProfile(userId: string) {
  try {
    const session = await validateSession()
    if (!session) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    const profile = await prisma.profile.findUnique({
      where: {
        userId: userId,
      },
    })

    if (!profile) {
      return {
        success: false,
        error: 'Profile not found',
      }
    }

    return {
      success: true,
      data: profile,
    }
  } catch (error) {
    console.error('Get profile error:', error)
    return {
      success: false,
      error: 'Failed to get profile',
    }
  }
}

export async function uploadProfileImage(formData: FormData) {
  try {
    const file = formData.get('file') as File
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const uniqueId = uuidv4()
    const extension = file.name.split('.').pop()
    const filename = `${uniqueId}.${extension}`

    // Ensure directory exists
    const uploadDir = join(process.cwd(), 'public', 'assets', 'avatar')
    const fs = require('fs')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Save to public/assets/avatar directory
    const path = join(uploadDir, filename)
    await writeFile(path, buffer)

    // Return API route URL
    return { success: true, url: `/api/images/assets/avatar/${filename}` }
  } catch (error) {
    console.error('Error uploading profile image:', error)
    return { success: false, error: 'Gagal mengupload gambar profile' }
  }
}
