'use server'

import { prisma } from '@/lib/prisma'
import { validateSession } from './session'
import { generateCustomId } from '@/lib/helpper'
import { randomUUID } from 'crypto'

export const toggleWishlist = async (productId: string) => {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'Silakan login terlebih dahulu',
      }
    }

    const existingWishlist = await prisma.wishlist.findFirst({
      where: {
        userId: session.user.id,
        productId: productId,
      },
    })

    if (existingWishlist) {
      // Remove from wishlist
      await prisma.wishlist.delete({
        where: {
          id: existingWishlist.id,
        },
      })
      return {
        success: true,
        message: 'Produk dihapus dari wishlist',
      }
    } else {
      // Add to wishlist
      await prisma.wishlist.create({
        data: {
          id: generateCustomId('wis'),
          userId: session.user.id,
          productId: productId,
        },
      })
      return {
        success: true,
        message: 'Produk ditambahkan ke wishlist',
      }
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error)
    return {
      success: false,
      message: 'Gagal mengelola wishlist',
    }
  }
}

export async function addToWishlist(userId: string, productId: string) {
  return prisma.wishlist.create({
    data: {
      id: randomUUID(),
      user: { connect: { id: userId } },
      product: { connect: { id: productId } },
    },
  })
}

export async function removeFromWishlist(userId: string, productId: string) {
  return prisma.wishlist.deleteMany({
    where: { userId, productId },
  })
}

export async function getWishlist(userId: string) {
  return prisma.wishlist.findMany({
    where: { userId },
    include: { product: true },
  })
}
