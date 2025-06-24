'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
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

export async function getCartItems() {
  try {
    const session = await validateSession()
    if (!session?.user?.id) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get user's cart first
    let cart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                stock: true,
                unit: true,
                minOrder: true,
                multiOrder: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    })

    // If cart doesn't exist, return empty array
    if (!cart) {
      return { success: true, data: [] }
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: {
        cartId: cart.id,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stock: true,
            unit: true,
            minOrder: true,
            multiOrder: true,
            weight: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { success: true, data: cartItems }
  } catch (error) {
    console.error('Error fetching cart items:', error)
    return { success: false, error: 'Failed to fetch cart items' }
  }
}

export async function addToCart(
  productIdOrItem: string | ServerCartItem,
  quantity?: number
) {
  try {
    const session = await validateSession()
    if (!session?.user?.id) {
      return { success: false, error: 'User not authenticated' }
    }

    // Handle both object and separate parameters
    let productId: string
    let itemQuantity: number

    if (typeof productIdOrItem === 'string') {
      // Called with separate parameters: addToCart(productId, quantity)
      productId = productIdOrItem
      itemQuantity = quantity || 1
    } else {
      // Called with object: addToCart({ userId, productId, quantity })
      productId = productIdOrItem.productId
      itemQuantity = productIdOrItem.quantity
    }

    // Check if product exists and has sufficient stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    if (product.stock < itemQuantity) {
      return { success: false, error: 'Insufficient stock' }
    }

    // Get or create user's cart
    let cart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
      },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          id: generateCartId(),
          userId: session.user.id,
        },
      })
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    })

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + itemQuantity
      if (product.stock < newQuantity) {
        return {
          success: false,
          error: 'Insufficient stock for updated quantity',
        }
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              stock: true,
              unit: true,
              weight: true,
            },
          },
        },
      })

      revalidateTag('cart')
      revalidatePath('/keranjang')
      return { success: true, data: updatedItem }
    } else {
      // Create new item
      const newItem = await prisma.cartItem.create({
        data: {
          id: generateCartItemId(),
          cartId: cart.id,
          productId: productId,
          quantity: itemQuantity,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              stock: true,
              unit: true,
              weight: true,
            },
          },
        },
      })

      revalidateTag('cart')
      revalidatePath('/keranjang')
      return { success: true, data: newItem }
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return { success: false, error: 'Failed to add item to cart' }
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  try {
    const session = await validateSession()
    if (!session?.user?.id) {
      return { success: false, error: 'User not authenticated' }
    }

    // Validate quantity parameter
    if (typeof quantity !== 'number' || isNaN(quantity)) {
      console.error('Invalid quantity parameter:', quantity)
      return { success: false, error: 'Invalid quantity parameter' }
    }

    // Get user's cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
      },
    })

    if (!cart) {
      return { success: false, error: 'Cart not found' }
    }

    // Get the cart item and product
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
      include: {
        product: true,
      },
    })

    if (!cartItem) {
      return { success: false, error: 'Cart item not found' }
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await prisma.cartItem.delete({
        where: { id: itemId },
      })
    } else {
      // Check stock availability
      if (cartItem.product.stock < quantity) {
        return { success: false, error: 'Insufficient stock' }
      }

      // Update quantity
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: quantity },
      })
    }

    revalidateTag('cart')
    revalidatePath('/keranjang')
    return { success: true }
  } catch (error) {
    console.error('Error updating cart item quantity:', error)
    return { success: false, error: 'Failed to update cart item' }
  }
}

export async function removeFromCart(itemId: string) {
  try {
    const session = await validateSession()
    if (!session?.user?.id) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get user's cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
      },
    })

    if (!cart) {
      return { success: false, error: 'Cart not found' }
    }

    await prisma.cartItem.deleteMany({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    })

    revalidateTag('cart')
    revalidatePath('/keranjang')
    return { success: true }
  } catch (error) {
    console.error('Error removing from cart:', error)
    return { success: false, error: 'Failed to remove item from cart' }
  }
}

export async function clearCart() {
  try {
    const session = await validateSession()
    if (!session?.user?.id) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get user's cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
      },
    })

    if (!cart) {
      return { success: true } // Cart doesn't exist, nothing to clear
    }

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    })

    revalidateTag('cart')
    revalidatePath('/keranjang')
    return { success: true }
  } catch (error) {
    console.error('Error clearing cart:', error)
    return { success: false, error: 'Failed to clear cart' }
  }
}

// Clear cart after successful order
export async function clearCartAfterOrder(orderId: string) {
  try {
    const session = await validateSession()
    if (!session?.user?.id) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get order items to know which products to remove from cart
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // Check if user owns this order
    if (order.userId !== session.user.id) {
      return {
        success: false,
        error: 'Unauthorized to clear cart for this order',
      }
    }

    // Get user's cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
      },
    })

    if (!cart) {
      return { success: true } // Cart doesn't exist, nothing to clear
    }

    // Remove items from cart that were in the order
    const orderProductIds = order.items.map((item) => item.productId)

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: {
          in: orderProductIds,
        },
      },
    })

    revalidateTag('cart')
    revalidatePath('/keranjang')
    return { success: true }
  } catch (error) {
    console.error('Error clearing cart after order:', error)
    return { success: false, error: 'Failed to clear cart after order' }
  }
}
