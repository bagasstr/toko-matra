'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { generateCategoryId, generateCustomId } from '@/lib/helpper'

export type CreateCategoryInput = {
  name: string
  parentId?: string
}

// Fungsi untuk membuat slug dari nama
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function createCategory(data: CreateCategoryInput) {
  try {
    const category = await prisma.category.create({
      data: {
        id: generateCustomId('sub-cat'),
        name: data.name,
        slug: createSlug(data.name),
        ...(data.parentId && {
          parent: {
            connect: { id: data.parentId },
          },
        }),
      },
      include: {
        parent: true,
        children: true,
      },
    })

    revalidatePath('/dashboard/produk/tambah-produk')
    return { success: true, category }
  } catch (error) {
    console.error('Failed to create category:', error)
    return { success: false, error: 'Gagal membuat kategori.' }
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    if (!slug) {
      return { success: false, error: 'Slug is required' }
    }

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
      },
    })

    if (!category) {
      return { success: false, error: 'Category not found' }
    }

    return { success: true, category }
  } catch (error) {
    console.error('Failed to get category by slug:', error)
    return { success: false, error: 'Failed to get category' }
  }
}

export async function getAllCategories() {
  try {
    const categorie = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        isActive: true,
        imageUrl: true,
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            parentId: true,
            isActive: true,
            imageUrl: true,
            children: {
              select: {
                id: true,
                name: true,
                slug: true,
                parentId: true,
                isActive: true,
                imageUrl: true,
              },
              where: {
                isActive: true,
              },
            },
          },
          where: {
            isActive: true,
          },
        },
      },
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    return { success: true, categorie }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { success: false, error: 'Gagal mengambil data kategori' }
  }
}

// Function specifically for homepage - only parent categories
export async function getParentCategories() {
  try {
    const categorie = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        isActive: true,
        imageUrl: true,
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      where: {
        isActive: true,
        parentId: null, // Only show parent categories, not subcategories
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Validasi data sebelum return
    const validCategories = categorie.filter(
      (cat) => cat.id && cat.name && cat.slug && cat.parentId === null
    )

    return { success: true, categorie: validCategories }
  } catch (error) {
    console.error('Error fetching parent categories:', error)
    return {
      success: false,
      error: 'Gagal mengambil data kategori',
      categorie: [],
    }
  }
}

export async function getTreeCategories() {
  try {
    // Optimize for tree structure by selecting only necessary fields
    const treeCategories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        isActive: true,
        imageUrl: true,
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            parentId: true,
            isActive: true,
            imageUrl: true,
          },
          where: {
            isActive: true,
          },
        },
      },
      where: {
        parentId: null, // Only root categories
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    return { success: true, treeCategories }
  } catch (error) {
    console.error('Error fetching tree categories:', error)
    return { success: false, error: 'Gagal mengambil data kategori' }
  }
}

export async function updateCategory(id: string, data: { name: string }) {
  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: createSlug(data.name),
      },
      include: {
        parent: true,
        children: true,
      },
    })

    revalidatePath('/dashboard/produk/tambah-produk')
    return { success: true, category }
  } catch (error) {
    console.error('Failed to update category:', error)
    return { success: false, error: 'Gagal mengupdate kategori.' }
  }
}

export async function deleteCategory(id: string) {
  try {
    // Check if category has children
    const category = await prisma.category.findUnique({
      where: { id },
      include: { children: true },
    })

    if (!category) {
      return { success: false, error: 'Kategori tidak ditemukan.' }
    }

    if (category.children && category.children.length > 0) {
      return {
        success: false,
        error: 'Tidak dapat menghapus kategori yang memiliki sub-kategori.',
      }
    }

    // Delete the category
    await prisma.category.delete({
      where: { id },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to delete category:', error)
    return { success: false, error: 'Gagal menghapus kategori.' }
  }
}
