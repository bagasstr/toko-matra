'use server'

import { prisma } from '@/lib/prisma'
import {
  sendOrderConfirmedEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
} from '@/lib/sendmailerTransport'
import { OrderStatus } from '@/types/order'

export const sendOrderStatusNotification = async (
  orderId: string,
  status: OrderStatus,
  additionalData?: {
    trackingNumber?: string
    carrier?: string
    cancellationReason?: string
    customMessage?: string
  }
) => {
  try {
    // Get order details with user email and items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        address: true,
        items: {
          include: {
            product: true,
          },
        },
        shipment: true,
      },
    })

    if (!order || !order.user) {
      console.error('Order or user not found for notification:', orderId)
      return { error: 'Order atau user tidak ditemukan' }
    }

    // Prepare order data for email
    const orderData = {
      id: order.id,
      total: order.totalAmount,
      address: order.address.address || 'Alamat tidak tersedia',
      orderItems: order.items.map((item) => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      trackingNumber:
        additionalData?.trackingNumber || order.shipment?.[0]?.deliveryNumber,
      carrier: additionalData?.carrier || 'Kurir',
      cancellationReason: additionalData?.cancellationReason,
    }

    const userEmail = order.user.profile?.email || order.user.email

    if (!userEmail) {
      console.error('User email not found for order:', orderId)
      return { error: 'Email user tidak ditemukan' }
    }

    // Send email based on status
    switch (status) {
      case OrderStatus.CONFIRMED:
        await sendOrderConfirmedEmail(
          userEmail,
          orderData,
          additionalData?.customMessage
        )
        console.log(`Order confirmed email sent for order: ${orderId}`)
        break

      case OrderStatus.SHIPPED:
        await sendOrderShippedEmail(userEmail, orderData)
        console.log(`Order shipped email sent for order: ${orderId}`)
        break

      case OrderStatus.DELIVERED:
        await sendOrderDeliveredEmail(userEmail, orderData)
        console.log(`Order delivered email sent for order: ${orderId}`)
        break

      case OrderStatus.CANCELLED:
        await sendOrderCancelledEmail(userEmail, orderData)
        console.log(`Order cancelled email sent for order: ${orderId}`)
        break

      default:
        console.log(`No email notification for status: ${status}`)
        break
    }

    return { success: true }
  } catch (error) {
    console.error('Order status notification error:', error)
    return { error: 'Gagal mengirim notifikasi status pesanan' }
  }
}

// Specific notification functions for different statuses
export const sendOrderConfirmedNotification = async (orderId: string) => {
  return await sendOrderStatusNotification(orderId, OrderStatus.CONFIRMED)
}

export const sendOrderShippedNotification = async (
  orderId: string,
  trackingNumber?: string,
  carrier?: string
) => {
  return await sendOrderStatusNotification(orderId, OrderStatus.SHIPPED, {
    trackingNumber,
    carrier,
  })
}

export const sendOrderDeliveredNotification = async (orderId: string) => {
  return await sendOrderStatusNotification(orderId, OrderStatus.DELIVERED)
}

export const sendOrderCancelledNotification = async (
  orderId: string,
  cancellationReason?: string
) => {
  return await sendOrderStatusNotification(orderId, OrderStatus.CANCELLED, {
    cancellationReason,
  })
}
