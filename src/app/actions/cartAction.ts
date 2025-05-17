'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import {
  convertDecimalToNumber,
  generateCartId,
  generateCartItemId,
  generateCustomId,
} from '@/lib/helpper'
import { cookies } from 'next/headers'

interface ServerCartItem {
  userId: string
  productId: string
  quantity: number
}

export async function addToCart(item: ServerCartItem) {
  try {
    // Get or create cart for the user
    const cart = await prisma.cart.findFirst({
      where: {
        userId: item.userId,
      },
    })

    if (!cart) {
      const newCart = await prisma.cart.create({
        data: {
          id: generateCustomId('CRT'),
          userId: item.userId,
        },
      })
      await prisma.cartItem.create({
        data: {
          id: generateCustomId('CRT-ITM'),
          cartId: newCart.id,
          productId: item.productId,
          quantity: item.quantity,
        },
      })
    } else {
      // Check if item already exists in cart
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: item.productId,
        },
      })

      if (existingItem) {
        // Update quantity if item exists
        await prisma.cartItem.update({
          where: {
            id: existingItem.id,
          },
          data: {
            quantity: existingItem.quantity + item.quantity,
          },
        })
      } else {
        // Add new item if it doesn't exist
        await prisma.cartItem.create({
          data: {
            id: generateCustomId('CRT-ITM'),
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity,
          },
        })
      }
    }

    revalidatePath('/cart')
    return {
      success: true,
      message: 'Item added to cart successfully',
      data: convertDecimalToNumber(item),
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return {
      success: false,
      message: 'Failed to add item to cart',
      error,
    }
  }
}

export async function removeFromCart(itemId: string) {
  try {
    await prisma.cartItem.delete({
      where: {
        id: itemId,
      },
    })

    revalidatePath('/cart')
    return {
      success: true,
      message: 'Item removed from cart successfully',
      data: convertDecimalToNumber(itemId),
    }
  } catch (error) {
    console.error('Error removing from cart:', error)
    return {
      success: false,
      message: 'Failed to remove item from cart',
      error,
    }
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  try {
    await prisma.cartItem.update({
      where: {
        id: itemId,
      },
      data: {
        quantity,
      },
    })

    revalidatePath('/cart')
    return {
      success: true,
      message: 'Cart item quantity updated successfully',
      data: convertDecimalToNumber({ itemId, quantity }),
    }
  } catch (error) {
    console.error('Error updating cart quantity:', error)
    return {
      success: false,
      message: 'Failed to update cart item quantity',
      error,
    }
  }
}

export async function clearCart(userId: string) {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
      },
    })

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      })
    }

    revalidatePath('/cart')
    return {
      success: true,
      message: 'Cart cleared successfully',
    }
  } catch (error) {
    console.error('Error clearing cart:', error)
    return {
      success: false,
      message: 'Failed to clear cart',
      error,
    }
  }
}

export async function getCartItems() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sessionToken')?.value
    if (!token) {
      return {
        success: false,
        message: 'No token found',
      }
    }
    console.log('token 175', token)

    const session = await prisma.session.findUnique({
      where: {
        sessionToken: token,
      },
      select: {
        user: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!session) {
      return {
        success: false,
        message: 'Invalid session',
      }
    }
    console.log('session 185', session)
    const cart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })
    console.log('cart 190', cart)

    return {
      success: true,
      message: 'Cart items retrieved successfully',
      data: convertDecimalToNumber(cart?.items) || [],
    }
  } catch (error) {
    console.error('Error getting cart items:', error)
    return {
      success: false,
      message: 'Failed to retrieve cart items',
      error,
    }
  }
}

export async function validateCartItems(items: ServerCartItem[]) {
  try {
    const validatedItems = await Promise.all(
      items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: {
            id: item.productId,
          },
        })

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`)
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`)
        }

        return {
          ...item,
          price: product.price,
          name: product.name,
        }
      })
    )

    return {
      success: true,
      message: 'Cart items validated successfully',
      data: convertDecimalToNumber(validatedItems),
    }
  } catch (error) {
    console.error('Error validating cart items:', error)
    return {
      success: false,
      message: 'Failed to validate cart items',
      error,
    }
  }
}
