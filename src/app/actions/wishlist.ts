'use server'

import { prisma } from '@/lib/prisma'
import { validateSession } from './session'
import { generateCustomId } from '@/lib/helpper'

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

export const addToWishlist = async (productId: string) => {
  try {
    const session = await validateSession()
    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    console.log('productId', productId)
    const wishlist = await prisma.wishlist.findUnique({
      where: {
        productId,
      },
    })
    if (wishlist) {
      throw new Error('Produk sudah ada di wishlist')
    }
    await prisma.wishlist.create({
      data: {
        id: generateCustomId('wis'),
        user: {
          connect: {
            id: session.user.id,
          },
        },
        product: {
          connect: {
            id: productId,
          },
        },
      },
    })
    return {
      success: true,
      message: 'Produk berhasil ditambahkan ke wishlist',
    }
  } catch (error) {
    console.log('error', error)
    return {
      success: false,
      message: 'gagal menambahkan ke wishlist',
    }
  }
}

export const removeFromWishlist = async (productId: string) => {
  const session = await validateSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  await prisma.wishlist.delete({
    where: {
      id: productId,
    },
  })
  return {
    success: true,
    message: 'Produk berhasil dihapus dari wishlist',
  }
}

export const getWishlist = async () => {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return [] // Return empty array instead of throwing error
    }

    const wishlist = await prisma.wishlist.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        productId: true,
        id: true,

        product: {
          select: {
            id: true,
            name: true,
            price: true,
            slug: true,
            images: true,
            category: true,
          },
        },
      },
    })

    return wishlist
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return [] // Return empty array on any error
  }
}
