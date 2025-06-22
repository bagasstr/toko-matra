'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { generateBrandId, generateCustomId } from '@/lib/helpper'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import {
  uploadBase64ToSupabase,
  uploadToSupabase,
  deleteFromSupabase,
  generateFileName,
  extractSupabasePath,
} from '@/lib/supabase'

type CreateBrandInput = {
  name: string
  logo: string
  slug: string
}

export async function getAllBrands() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    return { success: true, brands }
  } catch (error) {
    console.error('Failed to fetch brands:', error)
    return { success: false, error: 'Failed to fetch brands' }
  }
}

export async function createBrand(data: CreateBrandInput) {
  try {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

    // Handle logo upload
    let logoPath = ''
    if (data.logo) {

      const filename = generateFileName('logo.png', `brand-${slug}-`)
      const path = `brands/${filename}`

      // Upload to Supabase Storage
      const { url, error } = await uploadBase64ToSupabase(
        data.logo,
        'images',
        path,
        'image/png'
      )

      if (error) {
        console.error('Failed to upload brand logo:', error)
        return { success: false, error: 'Failed to upload brand logo' }
      }

      logoPath = url || ''

    }

    const brand = await prisma.brand.create({
      data: {
        id: generateCustomId('brd'),
        name: data.name,
        logo: logoPath,
        slug,
      },
    })

    revalidatePath('/dashboard/produk')
    return { success: true, brand }
  } catch (error) {
    console.error('Failed to create brand:', error)
    return { success: false, error: 'Failed to create brand' }
  }
}

export async function updateBrand(
  id: string,
  data: { name: string; logo?: string }
) {
  try {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

    // Handle logo upload if provided
    let logoPath = undefined
    if (data.logo) {
      const filename = generateFileName('logo.png', `brand-${slug}-`)
      const path = `brands/${filename}`

      // Upload to Supabase Storage
      const { url, error } = await uploadBase64ToSupabase(
        data.logo,
        'images',
        path,
        'image/png'
      )

      if (error) {
        console.error('Failed to upload brand logo:', error)
        return { success: false, error: 'Failed to upload brand logo' }
      }

      logoPath = url || ''

    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        ...(logoPath && { logo: logoPath }),
      },
    })

    revalidatePath('/dashboard/produk')
    return { success: true, brand }
  } catch (error) {
    console.error('Failed to update brand:', error)
    return { success: false, error: 'Failed to update brand' }
  }
}
export async function deleteBrand(id: string) {
  try {
    // Check if brand exists and has associated products
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: { products: true },
    })

    if (!brand) {
      return { success: false, error: 'Brand not found' }
    }

    if (brand.products.length > 0) {
      return {
        success: false,
        error: 'Cannot delete brand that has associated products',
      }
    }

    // Delete logo file from storage (Supabase or local) if exists
    if (brand.logo) {
      try {
        if (brand.logo.includes('supabase')) {
          // Delete from Supabase Storage
          const path = extractSupabasePath(brand.logo)
          if (path) {
            await deleteFromSupabase('images', path)
          }
        } else {
          // Legacy local file deletion
          const fs = require('fs')
          const path = require('path')
          const logoPath = path.join(
            process.cwd(),
            'public',
            brand.logo.replace(/^\//, '')
          )
          if (fs.existsSync(logoPath)) {
            fs.unlinkSync(logoPath)
          }
        }
      } catch (fsError) {
        console.warn('Failed to delete logo file:', fsError)
        // Lanjutkan proses meskipun gagal hapus file
      }
    }

    // Delete the brand
    await prisma.brand.delete({
      where: { id },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to delete brand:', error)
    return { success: false, error: 'Failed to delete brand' }
  }
}

export async function uploadBrandImage(formData: FormData) {
  try {
    const file = formData.get('file') as File
    if (!file) {
      return { success: false, error: 'No file provided' }
    }


    // Generate unique filename for Supabase
    const filename = generateFileName(file.name, 'brand-')
    const path = `brands/${filename}`

    // Upload to Supabase Storage
    const { url, error } = await uploadToSupabase(file, 'images', path)

    if (error) {
      console.error('Error uploading brand image:', error)
      return { success: false, error: 'Gagal mengupload gambar brand' }
    }

    return { success: true, url }

  } catch (error) {
    console.error('Error uploading brand image:', error)
    return { success: false, error: 'Gagal mengupload gambar brand' }
  }
}
