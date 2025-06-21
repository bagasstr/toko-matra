'use server'

import { checkTransaction } from '@/lib/midtransClient'
import { prisma } from '@/lib/prisma'
import {
  sendPaymentWaitingEmail,
  sendPaymentSuccessEmail,
} from '@/lib/sendmailerTransport'
import { addHours } from 'date-fns'

export const sendPaymentWaitingNotification = async (
  orderId: string,
  va_numbers: any
) => {
  try {
    // Get order details with user email
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        payment: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order || !order.user) {
      return { error: 'Order atau user tidak ditemukan' }
    }

    // Set payment deadline to 24 hours from now
    const paymentDeadline = addHours(new Date(), 24)

    // Update order with payment deadline
    await prisma.order.update({
      where: { id: orderId },
      data: {
        updatedAt: new Date(), // Update the timestamp
      },
    })

    // Prepare order data for email
    const orderData = {
      id: order.id,
      total: order.totalAmount,
      paymentMethod: order.payment[0]?.paymentMethod || 'Belum dipilih',
      paymentDeadline,
      vaNumber: va_numbers[0].va_number,
      orderItems: order.items.map((item) => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
    }

    // Send email notification
    await sendPaymentWaitingEmail(order.user.email, orderData)

    return { success: true }
  } catch (error) {
    console.error('Payment waiting notification error:', error)
    return { error: 'Gagal mengirim notifikasi pembayaran' }
  }
}

export const sendPaymentSuccessNotification = async (orderId: string) => {
  try {
    console.log('Sending payment success notification for order:', orderId)
    // Get order details with user email
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        payment: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order || !order.user) {
      return { error: 'Order atau user tidak ditemukan' }
    }

    // Prepare order data for email
    const orderData = {
      id: order.id,
      total: order.totalAmount,
      paymentMethod: order.payment[0]?.paymentMethod || 'Tidak diketahui',
      paymentDate: order.payment[0]?.createdAt || new Date(),
      orderItems: order.items.map((item) => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
    }

    // Send email notification
    await sendPaymentSuccessEmail(order.user.email, orderData)

    return { success: true }
  } catch (error) {
    console.error('Payment success notification error:', error)
    return { error: 'Gagal mengirim notifikasi pembayaran berhasil' }
  }
}
