'use server'

import { generateCustomId, generateFakturNumber } from '@/lib/helpper'
import { prisma } from '@/lib/prisma'
import { validateSession } from './session'
import { getCartItems } from './cartAction'
import { revalidatePath } from 'next/cache'
import { OrderStatus, IOrder } from '@/types/order'
import {
  sendOrderConfirmedNotification,
  sendOrderShippedNotification,
  sendOrderDeliveredNotification,
  sendOrderCancelledNotification,
} from '@/app/actions/orderStatusNotification'
import { createNotification } from '@/app/actions/notificationAction'

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
        notes: formData.notes,
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
            id: generateCustomId('ord-itm'),
            product: {
              connect: {
                id: item.productId,
              },
            },
            quantity: item.quantity,
            price: item.price,
          })),
        },
        payment: {
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
        shipment: {
          create: {
            id: crypto.randomUUID(),
            status: 'PENDING',
            deliveryDate: new Date(),
            notes: formData.notes,
            deliveryNumber: generateCustomId('DEL'),
            items: {
              create: items.map((item, index) => ({
                id: generateCustomId('shp-itm'),
                productId: item.productId,
                quantity: item.quantity,
                notes: formData.notes,
                unit: cartResult.data[index]?.product?.unit || 'pcs', // Get unit from cart data
              })),
            },
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
        payment: true,
        address: true,
        shipment: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
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

// Get all orders for the current user
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
        payment: true,
        shipment: true,
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
        // Ensure the order belongs to the current user
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
        payment: true,
        shipment: true,
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
    // Get order details first to get userId
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true },
    })

    if (!order) {
      return {
        success: false,
        message: 'Order not found',
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    // Send email notification based on status
    try {
      switch (status) {
        case OrderStatus.CONFIRMED:
          await sendOrderConfirmedNotification(orderId)
          console.log(`Order confirmed email sent for order: ${orderId}`)
          break

        case OrderStatus.SHIPPED:
          await sendOrderShippedNotification(orderId)
          console.log(`Order shipped email sent for order: ${orderId}`)
          break

        case OrderStatus.DELIVERED:
          await sendOrderDeliveredNotification(orderId)
          console.log(`Order delivered email sent for order: ${orderId}`)
          break

        case OrderStatus.CANCELLED:
          await sendOrderCancelledNotification(orderId)
          console.log(`Order cancelled email sent for order: ${orderId}`)
          break

        default:
          console.log(`No email notification for status: ${status}`)
          break
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Don't fail the entire operation if email fails
    }

    revalidatePath('/dashboard/pesanan')
    revalidatePath(`/orders/${orderId}`)

    return {
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
      userId: order.userId, // Return userId for query invalidation
    }
  } catch (error) {
    console.error(`Error updating order status for ${orderId}:`, error)
    return {
      success: false,
      message: 'Failed to update order status',
      error,
    }
  }
}

// // Get all orders for the current user
// export async function getUserOrders() {
//   try {
//     const session = await validateSession()
//     if (!session?.user) {
//       return {
//         success: false,
//         message: 'User not authenticated',
//       }
//     }

//     const userId = session.user.id

//     const orders = await prisma.order.findMany({
//       where: { userId },
//       include: {
//         items: {
//           include: {
//             product: true,
//           },
//         },
//         payment: true,
//         shipment: true,
//         address: true,
//         user: {
//           select: {
//             profile: {
//               select: {
//                 fullName: true,
//               },
//             },
//           },
//         },
//       },
//       orderBy: { createdAt: 'desc' },
//     })

//     return {
//       success: true,
//       message: 'Orders retrieved successfully',
//       data: orders,
//     }
//   } catch (error) {
//     console.error('Error getting orders:', error)
//     return {
//       success: false,
//       message: 'Failed to retrieve orders',
//       error,
//     }
//   }
// }

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
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
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
        payment: true,
        shipment: true,
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
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
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
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
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

    // If shipment is marked as SHIPPED, update order status and send email
    if (data.status === 'SHIPPED') {
      await prisma.order.update({
        where: { id: updatedShipment.orderId },
        data: { status: OrderStatus.SHIPPED },
      })

      // Send email notification
      try {
        await sendOrderShippedNotification(
          updatedShipment.orderId,
          data.trackingNumber,
          data.carrier
        )
        console.log(
          `Order shipped email sent for order: ${updatedShipment.orderId}`
        )
      } catch (emailError) {
        console.error('Failed to send order shipped email:', emailError)
      }
    }

    // If shipment is marked as DELIVERED, update order status and send email
    if (data.status === 'DELIVERED') {
      await prisma.order.update({
        where: { id: updatedShipment.orderId },
        data: { status: OrderStatus.DELIVERED },
      })

      // Send email notification
      try {
        await sendOrderDeliveredNotification(updatedShipment.orderId)
        console.log(
          `Order delivered email sent for order: ${updatedShipment.orderId}`
        )
      } catch (emailError) {
        console.error('Failed to send order delivered email:', emailError)
      }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/orders/${updatedShipment.orderId}`)

    return {
      success: true,
      message: 'Shipment updated successfully',
      data: updatedShipment,
      userId: updatedShipment.order.userId, // Return userId for query invalidation
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
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User not authenticated',
      }
    }

    // Get order details first to get userId
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true },
    })

    if (!order) {
      return {
        success: false,
        message: 'Order not found',
      }
    }

    // Update shipment status
    await prisma.shipment.updateMany({
      where: { orderId },
      data: {
        status: 'SHIPPED',
        deliveryNumber: receiptNumber,
      },
    })

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.SHIPPED,
      },
      include: {
        shipment: true,
      },
    })

    // Send email notification
    try {
      await sendOrderShippedNotification(orderId, receiptNumber, 'Kurir')
      console.log(`Order shipped email sent for order: ${orderId}`)
    } catch (emailError) {
      console.error('Failed to send order shipped email:', emailError)
    }

    return {
      success: true,
      message: 'Order resi updated successfully',
      data: updatedOrder,
      userId: order.userId, // Return userId for query invalidation
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

// Admin cancel order function
export async function adminCancelOrder(
  orderId: string,
  cancellationReason?: string
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
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        message: 'Unauthorized to cancel orders',
      }
    }

    // Get order with items to restore stock
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
    })

    if (!order) {
      return {
        success: false,
        message: 'Order not found',
      }
    }

    // Check if order can be cancelled (not already delivered)
    if (order.status === OrderStatus.DELIVERED) {
      return {
        success: false,
        message: 'Order cannot be cancelled after delivery',
      }
    }

    // Update order status to CANCELLED
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        updatedAt: new Date(),
      },
    })

    // Update payment status to CANCELLED if exists
    if (order.payment && order.payment.length > 0) {
      await prisma.payment.updateMany({
        where: { orderId },
        data: {
          status: 'CANCELLED',
        },
      })
    }

    // Restore product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      })
    }

    // Send email notification
    try {
      await sendOrderCancelledNotification(
        orderId,
        cancellationReason || 'Dibatalkan oleh admin'
      )
      console.log(`Order cancelled email sent for order: ${orderId}`)
    } catch (emailError) {
      console.error('Failed to send order cancelled email:', emailError)
    }

    revalidatePath('/dashboard/pesanan')
    revalidatePath(`/orders/${orderId}`)

    return {
      success: true,
      message: 'Order cancelled successfully',
      userId: order.userId, // Return userId for query invalidation
    }
  } catch (error) {
    console.error('Error cancelling order:', error)
    return {
      success: false,
      message: 'Failed to cancel order',
      error,
    }
  }
}

// Optimized function to get order details for client pages
export async function getOrderDetails(orderId: string) {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User not authenticated',
      }
    }

    // Optimized query with specific select fields
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        subtotalAmount: true,
        createdAt: true,
        userId: true,
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: {
              select: {
                name: true,
                images: true,
              },
            },
          },
        },
        address: {
          select: {
            recipientName: true,
            labelAddress: true,
            address: true,
            city: true,
            postalCode: true,
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
            paymentMethod: true,
            bank: true,
            vaNumber: true,
            transactionId: true,
          },
        },
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
      message: 'Order details retrieved successfully',
      data: order,
    }
  } catch (error) {
    console.error('Error getting order details:', error)
    return {
      success: false,
      message: 'Failed to retrieve order details',
      error,
    }
  }
}
