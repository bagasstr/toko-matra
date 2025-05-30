import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

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

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid notification body' },
        { status: 400 }
      )
    }

    const {
      order_id,
      transaction_status,
      fraud_status,
      signature_key,
      status_code,
      gross_amount,
    } = body

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
    const payment = await prisma.payment.findFirst({
      where: { transactionId: order_id },
      include: { order: true },
    })

    if (payment) {
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
