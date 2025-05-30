'use server'

import { generateCustomId } from '@/lib/helpper'
import { prisma } from '@/lib/prisma'
import { validateSession } from './session'
import { getCartItems } from './cartAction'
import { revalidatePath } from 'next/cache'

enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
export interface IOrder {
  id: string
  userId: string
  user: string
  addressId: string
  address: string
  status: OrderStatus
  totalAmount: number
  receiptNumber?: string | null
  items: {
    productId: string
    quantity: number
    price: number
  }[]
  createdAt: Date
  updatedAt: Date
  Payment: string[]
  Shipments?: string | null
  paymentMethod?: string
  bank?: string
  paymentType?: string
  transactionId?: string
  transactionTime?: string
  transactionStatus?: string
  fraudStatus?: string
  vaNumber?: string
  approvalCode?: string
  rawResponse?: string
  paidAt?: string
}

interface CheckoutFormData {
  addressId: string
  bank: string
  paymentMethod: string
  notes?: string
}

export async function processCheckoutAndCreateOrder(
  formData: CheckoutFormData
) {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User not authenticated',
      }
    }

    // Get cart items
    const cartResult = await getCartItems()
    if (
      !cartResult.success ||
      !cartResult.data ||
      cartResult.data.length === 0
    ) {
      return {
        success: false,
        message: 'Cart is empty or could not be retrieved',
      }
    }

    // Prepare order items
    const items = cartResult.data.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.product.price),
    }))

    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
    const totalAmount = subtotal + subtotal * 0.11

    // Create order
    const orderResult = await prisma.order.create({
      data: {
        id: generateCustomId('ord'),
        user: {
          connect: {
            id: session.user.id,
          },
        },
        address: {
          connect: {
            id: formData.addressId,
          },
        },
        status: OrderStatus.PENDING,
        totalAmount: totalAmount,
        subtotalAmount: subtotal,
        items: {
          create: items.map((item) => ({
            id: crypto.randomUUID(),
            product: {
              connect: {
                id: item.productId,
              },
            },
            quantity: item.quantity,
            price: item.price,
          })),
        },
        Payment: {
          create: [
            {
              id: crypto.randomUUID(),
              amount: totalAmount,
              paymentMethod: formData.paymentMethod,
              status: 'PENDING',
              bank: formData.bank,
            },
          ],
        },
        Shipment: {
          create: {
            id: crypto.randomUUID(),
            status: 'PENDING',
            deliveryDate: new Date(),
            deliveryNumber: generateCustomId('DEL'),
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        Payment: true,
        address: true,
        user: {
          select: {
            profile: true,
          },
        },
      },
    })

    // Return success with order data
    return {
      data: orderResult,
      success: true,
      message: 'Order created successfully',
    }
  } catch (error) {
    console.error('Error processing checkout and creating order:', error)
    return {
      success: false,
      message: 'Failed to process checkout and create order',
      error,
    }
  }
}

// // Get all orders for the current user
export async function getUserOrders() {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User not authenticated',
      }
    }

    const userId = session.user.id

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        Payment: true,
        Shipment: true,
        address: true,
        user: {
          select: {
            profile: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      success: true,
      message: 'Orders retrieved successfully',
      data: orders,
    }
  } catch (error) {
    console.error('Error getting orders:', error)
    return {
      success: false,
      message: 'Failed to retrieve orders',
      error,
    }
  }
}

// Get a specific order by ID
export async function getOrderById(orderId: string) {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User not authenticated',
      }
    }

    const userId = session.user.id

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId, // Ensure the order belongs to the current user
      },
      include: {
        user: {
          select: {
            profile: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        Payment: true,
        Shipment: true,
        address: true,
      },
    })

    if (!order) {
      return {
        success: false,
        message: 'Order not found',
      }
    }

    return {
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    }
  } catch (error) {
    console.error('Error getting order:', error)
    return {
      success: false,
      message: 'Failed to retrieve order',
      error,
    }
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User not authenticated',
      }
    }

    // Check if user is admin (only admins should update order status)
    if (session.user.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized to update order status',
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })
    await prisma.shipment.update({
      where: { orderId },
      data: { status },
    })

    revalidatePath('/admin/orders')
    revalidatePath(`/orders/${orderId}`)

    return {
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    }
  } catch (error) {
    console.error('Error updating order status:', error)
    return {
      success: false,
      message: 'Failed to update order status',
      error,
    }
  }
}

export async function updateOrderStatusShipped(orderId: string) {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User not authenticated',
      }
    }

    // Check if user is admin (only admins should update order status)
    if (session.user.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized to update order status',
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.SHIPPED },
    })
    await prisma.shipment.update({
      where: { orderId },
      data: { status: OrderStatus.SHIPPED },
    })

    revalidatePath('/admin/orders')
    revalidatePath(`/orders/${orderId}`)

    return {
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    }
  } catch (error) {
    console.error('Error updating order status:', error)
    return {
      success: false,
      message: 'Failed to update order status',
      error,
    }
  }
}

// Cancel an order
export async function cancelOrder(orderId: string) {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User not authenticated',
      }
    }

    const userId = session.user.id

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if the order exists and belongs to the user
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
        include: {
          items: true,
        },
      })

      if (!order) {
        throw new Error(
          'Order not found or does not belong to the current user'
        )
      }

      // 2. Check if the order can be cancelled (only PENDING or PROCESSING orders)
      if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
        throw new Error(`Cannot cancel order with status: ${order.status}`)
      }

      // 3. Update order status to CANCELLED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      })

      // 4. Update payment status to CANCELLED
      await tx.payment.updateMany({
        where: { orderId },
        data: { status: 'CANCELLED' },
      })

      // 5. Update shipment status to CANCELLED
      await tx.shipment.update({
        where: { orderId },
        data: { status: 'CANCELLED' },
      })

      // 6. Restore product stock
      await Promise.all(
        order.items.map(async (item) => {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          })

          if (product) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: product.stock + item.quantity },
            })
          }
        })
      )

      return updatedOrder
    })

    revalidatePath('/orders')
    revalidatePath(`/orders/${orderId}`)

    return {
      success: true,
      message: 'Order cancelled successfully',
      data: result,
    }
  } catch (error) {
    console.error('Error cancelling order:', error)
    return {
      success: false,
      message:
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as Error).message
          : 'Failed to cancel order',
      error,
    }
  }
}

// Get all orders (admin only)
export async function getAllOrders() {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User not authenticated',
      }
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized to access all orders',
      }
    }

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            profile: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        Payment: true,
        Shipment: true,
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      success: true,
      message: 'All orders retrieved successfully',
      data: orders,
    }
  } catch (error) {
    console.error('Error getting all orders:', error)
    return {
      success: false,
      message: 'Failed to retrieve all orders',
      error,
    }
  }
}

// Update payment status
export async function updatePaymentStatus(paymentId: string, status: string) {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User not authenticated',
      }
    }

    // Check if user is admin (only admins should update payment status)
    if (session.user.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized to update payment status',
      }
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status },
      include: { order: true },
    })

    // If payment is marked as PAID, update order status to PROCESSING
    if (status === 'PAID') {
      await prisma.order.update({
        where: { id: updatedPayment.orderId },
        data: { status: OrderStatus.CONFIRMED },
      })
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/orders/${updatedPayment.orderId}`)

    return {
      success: true,
      message: 'Payment status updated successfully',
      data: updatedPayment,
    }
  } catch (error) {
    console.error('Error updating payment status:', error)
    return {
      success: false,
      message: 'Failed to update payment status',
      error,
    }
  }
}

// Update shipment status and tracking information
export async function updateShipment(
  shipmentId: string,
  data: { status: string; trackingNumber?: string; carrier?: string }
) {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User not authenticated',
      }
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized to update shipment',
      }
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data,
      include: { order: true },
    })

    // If shipment is marked as SHIPPED, update order status
    if (data.status === 'SHIPPED') {
      await prisma.order.update({
        where: { id: updatedShipment.orderId },
        data: { status: OrderStatus.SHIPPED },
      })
    }

    // If shipment is marked as DELIVERED, update order status
    if (data.status === 'DELIVERED') {
      await prisma.order.update({
        where: { id: updatedShipment.orderId },
        data: { status: OrderStatus.DELIVERED },
      })
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/orders/${updatedShipment.orderId}`)

    return {
      success: true,
      message: 'Shipment updated successfully',
      data: updatedShipment,
    }
  } catch (error) {
    console.error('Error updating shipment:', error)
    return {
      success: false,
      message: 'Failed to update shipment',
      error,
    }
  }
}

export async function updateOrderResi(orderId: string, receiptNumber: string) {
  // ...implementasi seperti yang sudah dijelaskan sebelumnya...
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User not authenticated',
      }
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized to update order resi',
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.SHIPPED },
    })

    return {
      success: true,
      message: 'Order resi updated successfully',
      data: updatedOrder,
    }
  } catch (error) {
    console.error('Error updating order resi:', error)
    return {
      success: false,
      message: 'Failed to update order resi',
      error,
    }
  }
}
