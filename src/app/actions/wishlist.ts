'use server'

import { prisma } from '@/lib/prisma'
import { validateSession } from './session'

export const toggleWishlist = async (productId: string) => {
  const session = await validateSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  const wishlist = await prisma.wishlist.findUnique({
    where: {
      productId,
    },
  })
  if (wishlist) {
    await prisma.wishlist.delete({
      where: {
        id: wishlist.id,
      },
    })
    return {
      success: true,
    }
  } else {
    await prisma.wishlist.create({
      data: {
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
  }
  return {
    success: true,
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
  const session = await validateSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  const wishlist = await prisma.wishlist.findMany({
    where: {
      user: {
        id: session.user.id,
      },
    },
  })
  return wishlist
}
