'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { writeFile, unlink, access } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { put } from '@vercel/blob'
import { generateCustomId, generateProductId } from '@/lib/helpper'
import {
  uploadToSupabase,
  deleteFromSupabase,
  generateFileName,
  extractSupabasePath,
} from '@/lib/supabase'
import { cookies } from 'next/headers'
import { validateSession } from './session'

export async function createProduct(data: {
  id?: string
  name: string
  slug: string
  sku: string
  description?: string
  images: string[]
  price: number
  unit: string
  weight?: number
  dimensions?: string
  isFeatured: boolean
  label: string
  isActive: boolean
  categoryId: string
  brandId?: string
  stock: number
  minOrder: number
  multiOrder: number
}) {
  try {
    const session = await validateSession()
    console.log(session)
    if (!session) {
      return { success: false, error: 'Silakan login terlebih dahulu' }
    }

    // Check if SKU already exists
    const existingSku = await prisma.product.findFirst({
      where: { sku: data.sku },
    })

    if (existingSku) {
      return { success: false, error: 'SKU sudah digunakan oleh produk lain' }
    }

    // Check if slug exists and make it unique if needed
    let uniqueSlug = data.slug
    const existingProduct = await prisma.product.findUnique({
      where: { slug: uniqueSlug },
    })

    if (existingProduct) {
      const timestamp = Date.now()
      uniqueSlug = `${data.slug}-${timestamp}`
    }

    const product = await prisma.product.create({
      data: {
        id: generateCustomId('PRD'),
        name: data.name,
        slug: uniqueSlug,
        sku: data.sku,
        description: data.description,
        label: data.label,
        images: data.images,
        price: data.price,
        category: {
          connect: {
            id: data.categoryId,
          },
        },
        unit: data.unit,
        weight: data.weight,
        dimensions: data.dimensions,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        brand: data.brandId ? { connect: { id: data.brandId } } : undefined,
        stock: data.stock,
        minOrder: data.minOrder,
        multiOrder: data.multiOrder,
        User: {
          connect: {
            id: session.user.id,
          },
        },
      },
      include: {
        category: true,
        brand: true,
      },
    })

    revalidatePath('/dashboard/produk')
    return { success: true, product }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, error: 'Gagal membuat produk' }
  }
}

export async function getAllProducts(options?: {
  limit?: number
  offset?: number
  isFeatured?: boolean
  isActive?: boolean
}) {
  try {
    const {
      limit = 50, // Default limit to prevent loading too much data
      offset = 0,
      isFeatured,
      isActive = true,
    } = options || {}

    const where = {
      ...(isActive !== undefined && { isActive }),
      ...(isFeatured !== undefined && { isFeatured }),
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parentId: true,
            parent: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        // Remove User include to reduce data transfer
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    return { success: true, products }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { success: false, error: 'Gagal mengambil data produk' }
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          include: {
            parent: true,
          },
        },
        brand: true,
      },
    })
    return { success: true, product }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { success: false, error: 'Gagal mengambil data produk' }
  }
}

export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
      },
    })
    return { success: true, product }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { success: false, error: 'Gagal mengambil data produk' }
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
      },
    })

    if (!existingProduct) {
      return { success: false, error: 'Produk tidak ditemukan' }
    }

    // Check if SKU is already used by another product
    if (data.sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          sku: data.sku,
          id: { not: id },
        },
      })

      if (existingSku) {
        return {
          success: false,
          error: 'SKU sudah digunakan oleh produk lain',
        }
      }
    }

    // Check if slug is already used by another product
    if (data.slug !== existingProduct.slug) {
      const existingSlug = await prisma.product.findFirst({
        where: {
          slug: data.slug,
          id: { not: id },
        },
      })

      if (existingSlug) {
        return {
          success: false,
          error: 'Slug sudah digunakan oleh produk lain',
        }
      }
    }

    // Delete removed images from storage (Supabase or local)
    if (data.deletedImages && data.deletedImages.length > 0) {
      const deleteImagePromises = data.deletedImages.map(
        async (imagePath: string) => {
          try {
            if (imagePath.includes('supabase')) {
              // Delete from Supabase Storage
              const path = extractSupabasePath(imagePath)
              if (path) {
                await deleteFromSupabase('images', path)
              }
            } else {
              // Legacy local file deletion
              const filename = imagePath
                .replace('/api/images/produk/', '')
                .replace('/produk/', '')
              const filePath = join(process.cwd(), 'public', 'produk', filename)

              // Check if file exists before trying to delete
              try {
                await access(filePath)
                await unlink(filePath)
              } catch (error) {
                // File doesn't exist or can't be accessed, skip deletion
                console.log(
                  `File ${filename} not found or not accessible, skipping deletion`
                )
              }
            }
          } catch (error) {
            console.error(`Error processing image ${imagePath}:`, error)
            // Continue with other deletions even if one fails
          }
        }
      )

      await Promise.all(deleteImagePromises)
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        description: data.description,
        label: data.label,
        images: data.images,
        price: data.price,
        unit: data.unit,
        weight: data.weight,
        dimensions: data.dimensions,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        category: {
          connect: {
            id: data.categoryId || existingProduct.categoryId,
          },
        },
        ...(data.brandId && {
          brand: {
            connect: {
              id: data.brandId,
            },
          },
        }),
        stock: data.stock,
        minOrder: data.minOrder,
        multiOrder: data.multiOrder,
      },
      include: {
        category: true,
        brand: true,
      },
    })

    revalidatePath('/dashboard/produk')
    return { success: true, product: updatedProduct }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: 'Gagal mengupdate produk' }
  }
}

export async function deleteProduct(id: string) {
  try {
    // Get product data first to access images
    const product = await prisma.product.findUnique({
      where: { id },
      select: { images: true },
    })

    if (!product) {
      return {
        success: false,
        error: 'Produk tidak ditemukan',
      }
    }

    // Delete images from storage (Supabase or local)
    const deleteImagePromises = product.images.map(async (imagePath) => {
      try {
        if (imagePath.includes('supabase')) {
          // Delete from Supabase Storage
          const path = extractSupabasePath(imagePath)
          if (path) {
            await deleteFromSupabase('images', path)
          }
        } else {
          // Legacy local file deletion
          const filename = imagePath
            .replace('/api/images/produk/', '')
            .replace('/produk/', '')
          const filePath = join(process.cwd(), 'public', 'produk', filename)

          // Check if file exists before trying to delete
          try {
            await access(filePath)
            await unlink(filePath)
          } catch (error) {
            // File doesn't exist or can't be accessed, skip deletion
            console.log(
              `File ${filename} not found or not accessible, skipping deletion`
            )
          }
        }
      } catch (error) {
        console.error(`Error processing image ${imagePath}:`, error)
        // Continue with other deletions even if one fails
      }
    })

    await Promise.all(deleteImagePromises)

    // Delete the product
    await prisma.product.delete({
      where: { id },
    })

    revalidatePath('/dashboard/produk')
    return {
      success: true,
      message: 'Produk berhasil dihapus',
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    return {
      success: false,
      error: 'Gagal menghapus produk',
    }
  }
}

export async function uploadProductImages(formData: FormData) {
  try {
    const files = formData.getAll('files') as File[]
    if (!files || files.length === 0) {
      return { success: false, error: 'No files provided' }
    }

    const uploadPromises = files.map(async (file) => {
      // Generate unique filename for Supabase
      const filename = generateFileName(file.name, 'product-')
      const path = `products/${filename}`

      // Upload to Supabase Storage
      const { url, error } = await uploadToSupabase(file, 'images', path)

      if (error) {
        throw new Error(`Failed to upload ${file.name}: ${error}`)
      }

      return url
    })

    const urls = await Promise.all(uploadPromises)
    return { success: true, urls }
  } catch (error) {
    console.error('Error uploading images:', error)
    return { success: false, error: 'Gagal mengupload gambar' }
  }
}

export async function deleteImage(imageUrl: string) {
  try {
    // Check if it's a Supabase URL or legacy local URL
    if (imageUrl.includes('supabase')) {
      // Extract path from Supabase URL
      const path = extractSupabasePath(imageUrl)
      if (!path) {
        return { success: false, error: 'Invalid Supabase URL' }
      }

      // Delete from Supabase Storage
      const { success, error } = await deleteFromSupabase('images', path)

      if (!success) {
        return {
          success: false,
          error: error || 'Failed to delete from Supabase',
        }
      }

      return {
        success: true,
        message: 'Image deleted successfully from Supabase',
      }
    } else {
      // Legacy local file deletion
      const filename = imageUrl.split('/').pop()
      if (!filename) {
        return { success: false, error: 'Invalid image URL' }
      }

      // Construct full path to file
      const filePath = join(process.cwd(), 'public', 'produk', filename)

      // Check if file exists before attempting to delete
      try {
        await access(filePath)
      } catch {
        return { success: false, error: 'File not found' }
      }

      // Delete the file
      await unlink(filePath)

      return {
        success: true,
        message: 'Image deleted successfully from local storage',
      }
    }
  } catch (error) {
    console.error('Error deleting image:', error)
    return { success: false, error: 'Failed to delete image' }
  }
}

// Add dedicated function for featured products only
export async function getFeaturedProducts(limit: number = 20) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parentId: true,
            parent: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return { success: true, products }
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return { success: false, error: 'Gagal mengambil produk unggulan' }
  }
}
