import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

import { validateSession } from '@/app/actions/session'
import { OrderStatus } from '@prisma/client'
import { checkTransaction, createTransaction } from '@/lib/midtransClient'

// POST /api/payment/create
export async function POST(request: Request) {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId, amount, paymentType, bank, customerDetails, itemDetails } =
      body

    // Validate input
    if (!orderId || !amount || !customerDetails || !itemDetails) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        Payment: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if payment already exists
    if (order.Payment?.some((p) => p.status === 'SUCCESS')) {
      return NextResponse.json(
        { success: false, message: 'Order already paid' },
        { status: 400 }
      )
    }

    // Generate transaction ID
    const transactionId = `${orderId}-${Date.now()}`

    // Prepare transaction details
    const calculatedItemTotal = itemDetails.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
    const roundedAmount = Math.round(calculatedItemTotal * 100) / 100

    // Adjust the last item's price if needed to match the exact amount
    if (roundedAmount !== amount) {
      const lastItem = itemDetails[itemDetails.length - 1]
      const currentLastItemTotal = lastItem.price * lastItem.quantity
      const adjustedLastItemPrice =
        lastItem.price + (amount - roundedAmount) / lastItem.quantity

      itemDetails[itemDetails.length - 1] = {
        ...lastItem,
        price: Math.round(adjustedLastItemPrice * 100) / 100,
      }
    }

    const transactionDetails = {
      transaction_details: {
        order_id: transactionId,
        gross_amount: amount, // Use the original amount
      },
      payment_type: paymentType,
      bank_transfer: {
        bank: bank,
      },
      customer_details: customerDetails,
      item_details: itemDetails,
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        unfinish: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/error`,
      },
    }

    console.log(transactionDetails)

    // Create transaction in Midtrans
    const midtransResponse = await createTransaction(transactionDetails)

    if (!midtransResponse.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create payment transaction',
          error: midtransResponse.error,
        },
        { status: 500 }
      )
    }

    // Update payment record
    await prisma.payment.updateMany({
      where: {
        orderId: orderId,
        status: 'PENDING',
      },
      data: {
        transactionId: transactionId,
        paymentType: midtransResponse.data.payment_type,
        transactionStatus: midtransResponse.data.transaction_status,
        fraudStatus: midtransResponse.data.fraud_status,
        bank: midtransResponse.data.va_numbers?.[0]?.bank,
        vaNumber: midtransResponse.data.va_numbers?.[0]?.va_number,
        approvalCode: midtransResponse.data.approval_code,
        rawResponse: midtransResponse.data,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment transaction created successfully',
      data: {
        transaction_id: transactionId,
        payment_type: midtransResponse.data.payment_type,
        transaction_status: midtransResponse.data.transaction_status,
        va_numbers: midtransResponse.data.va_numbers,
        redirect_url: midtransResponse.data.redirect_url,
      },
    })
  } catch (error) {
    console.error('Payment creation error:', error)
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

// GET /api/payment/status/:transactionId
export async function GET(request: Request) {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transactionId')

    if (!transactionId) {
      return NextResponse.json(
        { success: false, message: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    // Check transaction status in Midtrans
    const statusResponse = await checkTransaction(transactionId)

    if (!statusResponse.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to check transaction status',
          error: statusResponse.error,
        },
        { status: 500 }
      )
    }

    const transactionStatus = statusResponse.data.transaction_status
    const fraudStatus = statusResponse.data.fraud_status

    // Update payment and order status
    let paymentStatus = 'PENDING'
    let orderStatus: OrderStatus = 'PENDING'

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        paymentStatus = 'CHALLENGE'
      } else if (fraudStatus === 'accept') {
        paymentStatus = 'SUCCESS'
        orderStatus = 'CONFIRMED'
      }
    } else if (transactionStatus === 'settlement') {
      paymentStatus = 'SUCCESS'
      orderStatus = 'CONFIRMED'
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      paymentStatus = 'FAILED'
      orderStatus = 'CANCELLED'
    }

    // Update payment and order
    const payment = await prisma.payment.findFirst({
      where: { transactionId },
      include: { order: true },
    })

    if (payment) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: paymentStatus,
            paidAt: paymentStatus === 'SUCCESS' ? new Date() : null,
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
      message: 'Transaction status updated successfully',
      data: {
        transaction_status: transactionStatus,
        fraud_status: fraudStatus,
        payment_status: paymentStatus,
        order_status: orderStatus,
      },
    })
  } catch (error) {
    console.error('Status check error:', error)
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
