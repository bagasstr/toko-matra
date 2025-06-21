'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { generateBrandId, generateCustomId } from '@/lib/helpper'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

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
      const logoBuffer = Buffer.from(data.logo.split(',')[1], 'base64')
      const logoFileName = `${slug}-${Date.now()}.png`
      const logoFilePath = `public/merek/${logoFileName}`

      // Ensure directory exists
      const fs = require('fs')
      const path = require('path')
      const dir = path.join(process.cwd(), 'public/merek')
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      // Write file
      fs.writeFileSync(path.join(process.cwd(), logoFilePath), logoBuffer)
      logoPath = `/api/images/merek/${logoFileName}`
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
      const logoBuffer = Buffer.from(data.logo.split(',')[1], 'base64')
      const logoFileName = `${slug}-${Date.now()}.png`
      const logoFilePath = `public/merek/${logoFileName}`

      // Ensure directory exists
      const fs = require('fs')
      const path = require('path')
      const dir = path.join(process.cwd(), 'public/merek')
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      // Write file
      fs.writeFileSync(path.join(process.cwd(), logoFilePath), logoBuffer)
      logoPath = `/api/images/merek/${logoFileName}`
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

    // Delete logo file from filesystem if exists
    if (brand.logo) {
      try {
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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const uniqueId = uuidv4()
    const extension = file.name.split('.').pop()
    const filename = `${uniqueId}.${extension}`

    // Ensure directory exists
    const uploadDir = join(process.cwd(), 'public', 'merek')
    const fs = require('fs')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Save to public/merek directory
    const path = join(uploadDir, filename)
    await writeFile(path, buffer)

    // Return API route URL
    return { success: true, url: `/api/images/merek/${filename}` }
  } catch (error) {
    console.error('Error uploading brand image:', error)
    return { success: false, error: 'Gagal mengupload gambar brand' }
  }
}
