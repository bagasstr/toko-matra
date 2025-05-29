'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import {
  generateCartId,
  generateCartItemId,
  generateCustomId,
} from '@/lib/helpper'
import { cookies } from 'next/headers'
import { validateSession } from '@/app/actions/session'

interface ServerCartItem {
  userId: string
  productId: string
  quantity: number
}

export interface CartItemResponse {
  success: boolean
  message: string
  data?: any[]
  error?: string
  subtotal?: number
  ppn?: number
  totalAmount?: number
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
          id: generateCustomId('crt'),
          userId: item.userId,
        },
      })
      await prisma.cartItem.create({
        data: {
          id: generateCustomId('crt-itm'),
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
            id: generateCustomId('crt-itm'),
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
      data: item,
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
      data: itemId,
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
      data: { itemId, quantity },
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

export async function getCartItems(): Promise<CartItemResponse> {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User not authenticated',
      }
    }

    const cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!cart) {
      return {
        success: false,
        message: 'Cart not found',
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    )
    const ppn = Math.round(subtotal * 0.11)
    const totalAmount = subtotal + ppn

    return {
      success: true,
      message: 'Cart retrieved successfully',
      data: cart.items,
      subtotal,
      ppn,
      totalAmount,
    }
  } catch (error) {
    console.error('Error getting cart items:', error)
    return {
      success: false,
      message: 'Failed to retrieve cart items',
      error: error instanceof Error ? error.message : 'Unknown error',
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
      data: validatedItems,
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

export async function clearCartAfterOrder(orderId: string) {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User not authenticated',
      }
    }

    // Find the order to get the items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return {
        success: false,
        message: 'Order not found',
      }
    }

    // Find the user's cart
    const cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: { items: true },
    })

    if (!cart) {
      return {
        success: false,
        message: 'Cart not found',
      }
    }

    // Remove cart items that match the order items
    const orderItemProductIds = order.items.map((item) => item.productId)

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: {
          in: orderItemProductIds,
        },
      },
    })

    revalidatePath('/cart')
    revalidatePath('/keranjang')

    return {
      success: true,
      message: 'Cart items cleared successfully after order',
    }
  } catch (error) {
    console.error('Error clearing cart after order:', error)
    return {
      success: false,
      message: 'Failed to clear cart after order',
      error,
    }
  }
}
