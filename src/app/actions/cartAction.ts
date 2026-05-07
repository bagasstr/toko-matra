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
    // Get user's cart first
    const userId = await validateSession()
    const cart = await prisma.cart.findFirst({
      where: {
        userId: userId?.user?.id,
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
            costPrice: true,
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

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if product exists and has sufficient stock
      const product = await tx.product.findUnique({
        where: { id: productId },
      })

      if (!product) {
        throw new Error('Product not found')
      }

      if (product.stock < itemQuantity) {
        throw new Error('Insufficient stock')
      }

      // Get or create user's cart
      let cart = await tx.cart.findFirst({
        where: {
          userId: session.user.id,
        },
      })

      if (!cart) {
        cart = await tx.cart.create({
          data: {
            id: generateCartId(),
            userId: session.user.id,
          },
        })
      }

      // Check if item already exists in cart
      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: productId,
        },
      })

      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + itemQuantity

        // Check if we have enough stock (considering what's already reserved)
        const availableStock = product.stock + existingItem.quantity // Add back what's already reserved
        if (availableStock < newQuantity) {
          throw new Error('Insufficient stock for updated quantity')
        }

        // Update cart item
        const updatedItem = await tx.cartItem.update({
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

        // Update product stock (reduce by the additional quantity)
        await tx.product.update({
          where: { id: productId },
          data: { stock: availableStock - newQuantity },
        })

        return updatedItem
      } else {
        // Create new item
        const newItem = await tx.cartItem.create({
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

        // Reduce product stock
        await tx.product.update({
          where: { id: productId },
          data: { stock: product.stock - itemQuantity },
        })

        return newItem
      }
    })

    revalidateTag('cart')
    revalidatePath('/keranjang')
    revalidatePath('/produk')
    return { success: true, data: result }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to add item to cart',
    }
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

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Get user's cart
      const cart = await tx.cart.findFirst({
        where: {
          userId: session.user.id,
        },
      })

      if (!cart) {
        throw new Error('Cart not found')
      }

      // Get the cart item and product
      const cartItem = await tx.cartItem.findFirst({
        where: {
          id: itemId,
          cartId: cart.id,
        },
        include: {
          product: true,
        },
      })

      if (!cartItem) {
        throw new Error('Cart item not found')
      }

      const currentQuantity = cartItem.quantity
      const quantityDifference = quantity - currentQuantity

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        await tx.cartItem.delete({
          where: { id: itemId },
        })

        // Return the stock that was reserved
        await tx.product.update({
          where: { id: cartItem.productId },
          data: { stock: cartItem.product.stock + currentQuantity },
        })
      } else {
        // Check if we need to reduce or increase stock
        if (quantityDifference > 0) {
          // Increasing quantity - check if we have enough stock
          // Add back what's already reserved to get available stock
          const availableStock = cartItem.product.stock + currentQuantity
          if (availableStock < quantity) {
            throw new Error('Insufficient stock')
          }

          // Update stock (reduce by the new total quantity)
          await tx.product.update({
            where: { id: cartItem.productId },
            data: { stock: availableStock - quantity },
          })
        } else if (quantityDifference < 0) {
          // Decreasing quantity - return stock
          // Add back what's already reserved to get available stock
          const availableStock = cartItem.product.stock + currentQuantity
          await tx.product.update({
            where: { id: cartItem.productId },
            data: { stock: availableStock - quantity },
          })
        }

        // Update cart item quantity
        await tx.cartItem.update({
          where: { id: itemId },
          data: { quantity: quantity },
        })
      }
    })

    revalidateTag('cart')
    revalidatePath('/keranjang')
    revalidatePath('/produk')
    return { success: true }
  } catch (error) {
    console.error('Error updating cart item quantity:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update cart item',
    }
  }
}

export async function removeFromCart(itemId: string) {
  try {
    const session = await validateSession()
    if (!session?.user?.id) {
      return { success: false, error: 'User not authenticated' }
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Get user's cart
      const cart = await tx.cart.findFirst({
        where: {
          userId: session.user.id,
        },
      })

      if (!cart) {
        throw new Error('Cart not found')
      }

      // Get the cart item and product to know the quantity
      const cartItem = await tx.cartItem.findFirst({
        where: {
          id: itemId,
          cartId: cart.id,
        },
        include: {
          product: true,
        },
      })

      if (!cartItem) {
        throw new Error('Cart item not found')
      }

      // Delete the cart item
      await tx.cartItem.delete({
        where: { id: itemId },
      })

      // Return the stock that was reserved
      await tx.product.update({
        where: { id: cartItem.productId },
        data: { stock: cartItem.product.stock + cartItem.quantity },
      })
    })

    revalidateTag('cart')
    revalidatePath('/keranjang')
    revalidatePath('/produk')
    return { success: true }
  } catch (error) {
    console.error('Error removing from cart:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to remove item from cart',
    }
  }
}

export async function clearCart() {
  try {
    const session = await validateSession()
    if (!session?.user?.id) {
      return { success: false, error: 'User not authenticated' }
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Get user's cart with all items
      const cart = await tx.cart.findFirst({
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

      if (!cart) {
        return // Cart doesn't exist, nothing to clear
      }

      // Return stock for all items in cart
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: item.product.stock + item.quantity },
        })
      }

      // Delete all cart items
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      })
    })

    revalidateTag('cart')
    revalidatePath('/keranjang')
    revalidatePath('/produk')
    return { success: true }
  } catch (error) {
    console.error('Error clearing cart:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear cart',
    }
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
