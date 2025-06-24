import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'
import {
  sendPaymentSuccessNotification,
  sendPaymentWaitingNotification,
} from '@/app/actions/paymentNotification'
import { sendOrderConfirmedNotification } from '@/app/actions/orderStatusNotification'

enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('=== MIDTRANS NOTIFICATION RECEIVED ===')
    console.log('Full body:', JSON.stringify(body, null, 2))

    if (!body || typeof body !== 'object') {
      console.log('ERROR: Invalid notification body')
      return NextResponse.json(
        { success: false, message: 'Invalid notification body' },
        { status: 400 }
      )
    }

    const {
      order_id,
      transaction_status,
      transaction_time,
      fraud_status,
      transaction_id,
      status_message,
      signature_key,
      settlement_time,
      payment_type,
      merchant_id,
      currency,
      status_code,
      va_numbers,
      gross_amount,
    } = body

    console.log(
      transaction_status,
      fraud_status,
      signature_key,
      status_code,
      gross_amount,
      transaction_time,
      settlement_time,
      payment_type,
      merchant_id,
      currency,
      status_message,
      order_id,
      transaction_id,
      va_numbers
    )

    if (!order_id || !transaction_status) {
      return NextResponse.json(
        { success: false, message: 'Missing required notification fields' },
        { status: 400 }
      )
    }

    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (serverKey && signature_key) {
      const expectedSignature = crypto
        .createHash('sha512')
        .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
        .digest('hex')

      if (signature_key !== expectedSignature) {
        return NextResponse.json(
          { success: false, message: 'Invalid signature' },
          { status: 400 }
        )
      }
    }

    // Update status based on notification
    let paymentStatus = 'PENDING'
    let orderStatus: OrderStatus = OrderStatus.PENDING

    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        paymentStatus = 'CHALLENGE'
      } else if (fraud_status === 'accept') {
        paymentStatus = 'SUCCESS'
        orderStatus = OrderStatus.CONFIRMED
      }
    } else if (transaction_status === 'settlement') {
      paymentStatus = 'SUCCESS'
      orderStatus = OrderStatus.CONFIRMED
    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    ) {
      paymentStatus = 'FAILED'
      orderStatus = OrderStatus.CANCELLED
    } else if (transaction_status === 'pending') {
      paymentStatus = 'PENDING'
    }

    // Update payment and order
    console.log('Looking for payment with transactionId:', order_id)
    const payment = await prisma.payment.findFirst({
      where: { transactionId: order_id },
      include: { order: true },
    })

    console.log('Found payment:', payment ? 'Yes' : 'No')

    if (payment) {
      console.log(
        'Updating payment status from',
        payment.status,
        'to',
        paymentStatus
      )
      console.log(
        'Updating order status from',
        payment.order.status,
        'to',
        orderStatus
      )

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: paymentStatus,
            paidAt: paymentStatus === 'SUCCESS' ? new Date() : null,
            transactionStatus: transaction_status,
            fraudStatus: fraud_status,
            rawResponse: body,
          },
        })

        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: orderStatus },
        })
      })

      console.log('Payment and order status updated successfully')

      // Revalidate cache untuk halaman yang terkait
      revalidatePath(`/orders/${payment.orderId}`)
      revalidatePath('/orders')
      revalidatePath('/dashboard/pesanan')
      revalidatePath(`/dashboard/pesanan/detail-pesanan/${payment.orderId}`)

      // Send payment success notification if payment is successful
      if (paymentStatus === 'SUCCESS') {
        await sendPaymentSuccessNotification(payment.orderId)
        await sendOrderConfirmedNotification(payment.orderId)
      } else if (paymentStatus === 'PENDING') {
        await sendPaymentWaitingNotification(payment.orderId, va_numbers)
      }
    } else {
      console.log('Payment not found for transactionId:', order_id)
      return NextResponse.json(
        {
          success: false,
          message: 'Payment not found for transaction ID',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification processed successfully',
      data: {
        order_id,
        payment_status: paymentStatus,
        order_status: orderStatus,
      },
    })
  } catch (error) {
    console.error('Notification processing error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
