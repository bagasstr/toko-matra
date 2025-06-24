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
    console.log(
      'Request headers:',
      Object.fromEntries(request.headers.entries())
    )

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

    console.log('=== EXTRACTED FIELDS ===')
    console.log({
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      payment_type,
      merchant_id,
    })

    if (!order_id || !transaction_status) {
      console.log(
        'ERROR: Missing required fields - order_id or transaction_status'
      )
      return NextResponse.json(
        { success: false, message: 'Missing required notification fields' },
        { status: 400 }
      )
    }

    // Handle test notifications
    if (order_id.includes('payment_notif_test') || order_id.includes('test')) {
      console.log('=== TEST NOTIFICATION DETECTED ===')
      console.log('Test notification received, acknowledging...')
      return NextResponse.json({
        success: true,
        message: 'Test notification acknowledged',
        data: { order_id, test: true },
      })
    }

    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (serverKey && signature_key) {
      const expectedSignature = crypto
        .createHash('sha512')
        .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
        .digest('hex')

      console.log('=== SIGNATURE VERIFICATION ===')
      console.log('Expected signature:', expectedSignature)
      console.log('Received signature:', signature_key)
      console.log('Signature match:', signature_key === expectedSignature)

      if (signature_key !== expectedSignature) {
        console.log('ERROR: Invalid signature')
        return NextResponse.json(
          { success: false, message: 'Invalid signature' },
          { status: 400 }
        )
      }
    } else {
      console.log(
        'WARNING: Signature verification skipped (missing server key or signature)'
      )
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

    console.log('=== STATUS MAPPING ===')
    console.log('Transaction status:', transaction_status)
    console.log('Mapped payment status:', paymentStatus)
    console.log('Mapped order status:', orderStatus)

    // Search for payment with multiple strategies
    console.log('=== PAYMENT LOOKUP ===')
    console.log('Looking for payment with transactionId:', order_id)

    let payment = await prisma.payment.findFirst({
      where: { transactionId: order_id },
      include: { order: true },
    })

    console.log(
      'Payment found with exact transactionId match:',
      payment ? 'Yes' : 'No'
    )

    // Fallback: search by partial match (for custom transaction IDs)
    if (!payment) {
      console.log('Trying fallback search strategies...')

      // Try to find by order ID if it contains recognizable pattern
      if (order_id.startsWith('ord-')) {
        payment = await prisma.payment.findFirst({
          where: { transactionId: order_id },
          include: { order: true },
        })
        console.log(
          'Payment found with ord- prefix match:',
          payment ? 'Yes' : 'No'
        )
      }

      // Try to find recent pending payment (last resort)
      if (!payment) {
        console.log('Searching for recent pending payments...')
        const recentPayments = await prisma.payment.findMany({
          where: {
            status: 'PENDING',
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
          include: { order: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        })

        console.log('Recent pending payments found:', recentPayments.length)
        recentPayments.forEach((p, i) => {
          console.log(`Payment ${i + 1}:`, {
            id: p.id,
            transactionId: p.transactionId,
            amount: p.amount,
            orderId: p.orderId,
          })
        })
      }
    }

    if (payment) {
      console.log('=== UPDATING PAYMENT ===')
      console.log('Payment ID:', payment.id)
      console.log('Order ID:', payment.orderId)
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
      console.log('=== PAYMENT NOT FOUND ===')
      console.log('Transaction ID searched:', order_id)
      console.log('Available transaction IDs in database:')

      // Debug: show recent transaction IDs
      const recentTransactions = await prisma.payment.findMany({
        select: { transactionId: true, createdAt: true, status: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })

      recentTransactions.forEach((t, i) => {
        console.log(
          `${i + 1}. ${t.transactionId} (${t.status}) - ${t.createdAt}`
        )
      })

      return NextResponse.json(
        {
          success: false,
          message: 'Payment not found for transaction ID',
          debug: {
            searched_transaction_id: order_id,
            recent_transactions: recentTransactions.map((t) => t.transactionId),
          },
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
    console.error('=== NOTIFICATION PROCESSING ERROR ===')
    console.error('Error details:', error)
    console.error(
      'Stack trace:',
      error instanceof Error ? error.stack : 'No stack trace'
    )

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
