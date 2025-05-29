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
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    const categorie = await prisma.category.findMany({
      where: {
        parentId: null,
      },
      include: {
        children: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    const treeCategories = await prisma.category.findMany({
      include: {
        parent: true,
        children: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Transform ke format tree
    const buildTree = (items: any[], parentId: string | null = null): any[] => {
      return items
        .filter((item) => item.parentId === parentId)
        .map((item) => ({
          id: item.id,
          name: item.name,
          children: buildTree(items, item.id),
        }))
    }

    const treeCategory = buildTree(treeCategories)
    return { success: true, treeCategory, categories, categorie }
  } catch (error) {
    console.error('Failed to get categories:', error)
    return { success: false, error: 'Gagal mengambil data kategori.' }
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
