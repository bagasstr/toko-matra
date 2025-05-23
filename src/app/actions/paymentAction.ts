'use server'

import {
  core,
  createTransactionParams,
  handlePaymentNotification,
  getTransactionStatus,
} from '@/lib/midtrans'
import { prisma } from '@/lib/prisma'

export async function createMidtransTransaction(
  orderId: string,
  amount: number,
  customerDetails: {
    firstName: string
    lastName?: string
    email: string
    phone: string
  },
  itemDetails: Array<{
    id: string
    price: number
    quantity: number
    name: string
  }>,
  paymentMethod: string
) {
  try {
    // Create transaction parameters
    const transactionParams = createTransactionParams(
      orderId,
      amount,
      customerDetails,
      itemDetails,
      paymentMethod
    )

    // Create transaction in Midtrans using Core API
    const transaction = await core.charge(transactionParams)

    // Get the payment record first
    const payment = await prisma.payment.findFirst({
      where: {
        orderId: orderId,
      },
    })

    if (!payment) {
      throw new Error('Payment record not found')
    }

    // Update payment record in database with payment details
    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: 'PENDING',
        midtransToken: transaction.token || '',
        midtransRedirectUrl: transaction.actions?.[0]?.url || '',
        // Store additional payment details
        paymentDetails: {
          paymentType: transaction.payment_type,
          vaNumber: transaction.va_numbers?.[0]?.va_number,
          bank: transaction.va_numbers?.[0]?.bank,
          eWalletType: transaction.payment_type,
          expiryTime: transaction.expiry_time,
        },
      },
    })

    return {
      success: true,
      data: {
        paymentType: transaction.payment_type,
        vaNumber: transaction.va_numbers?.[0]?.va_number,
        bank: transaction.va_numbers?.[0]?.bank,
        eWalletType: transaction.payment_type,
        expiryTime: transaction.expiry_time,
        actions: transaction.actions,
      },
    }
  } catch (error) {
    console.error('Error creating Midtrans transaction:', error)
    return {
      success: false,
      error: 'Failed to create payment transaction',
    }
  }
}

export async function handleMidtransCallback(notification: any) {
  try {
    const {
      orderId,
      paymentStatus,
      transactionStatus,
      fraudStatus,
      paymentType,
      vaNumber,
      bank,
      eWalletType,
    } = await handlePaymentNotification(notification)

    // Get the payment record first
    const payment = await prisma.payment.findFirst({
      where: {
        orderId: orderId,
      },
    })

    if (!payment) {
      throw new Error('Payment record not found')
    }

    // Update payment status in database
    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: paymentStatus,
        paymentDetails: {
          paymentType,
          vaNumber,
          bank,
          eWalletType,
          transactionStatus,
          fraudStatus,
        },
      },
    })

    // If payment is successful, update order status
    if (paymentStatus === 'PAID') {
      await prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: 'PROCESSING',
        },
      })
    }

    return {
      success: true,
      message: 'Payment status updated successfully',
    }
  } catch (error) {
    console.error('Error handling Midtrans callback:', error)
    return {
      success: false,
      error: 'Failed to process payment notification',
    }
  }
}

export async function checkTransactionStatus(orderId: string) {
  try {
    const transaction = await getTransactionStatus(orderId)
    return {
      success: true,
      data: transaction,
    }
  } catch (error) {
    console.error('Error checking transaction status:', error)
    return {
      success: false,
      error: 'Failed to check transaction status',
    }
  }
}
