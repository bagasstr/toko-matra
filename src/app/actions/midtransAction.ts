'use server'

import { prisma } from '@/lib/prisma'
import { validateSession } from './session'
import { revalidatePath } from 'next/cache'
import {
  createTransaction,
  checkTransaction,
  cancelTransaction,
  approveTransaction,
  expireTransaction,
} from '@/lib/midtransClient'
import { generateCustomId } from '@/lib/helpper'
import crypto from 'crypto'

// Define proper enum types for better type safety
type PaymentStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'CHALLENGE'
type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'

// Interface untuk parameter pembayaran Midtrans
interface MidtransPaymentParams {
  orderId: string
  customerDetails: {
    first_name: string
    last_name?: string
    email: string
    phone: string
  }
  itemDetails: Array<{
    id: string
    price: number
    quantity: number
    name: string
  }>
}

// Interface untuk response pembayaran
interface PaymentResponse {
  success: boolean
  message: string
  data?: any
  error?: string
}

// Validation helper functions
function validateMidtransParams(params: MidtransPaymentParams): string | null {
  if (!params.orderId?.trim()) return 'Order ID is required'
  if (!params.customerDetails?.first_name?.trim())
    return 'Customer first name is required'
  if (!params.customerDetails?.email?.trim())
    return 'Customer email is required'
  if (!params.customerDetails?.phone?.trim())
    return 'Customer phone is required'
  if (!params.itemDetails?.length) return 'Item details are required'

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(params.customerDetails.email))
    return 'Invalid email format'

  return null
}

function validateTransactionId(transactionId: string): string | null {
  if (!transactionId?.trim()) return 'Transaction ID is required'
  return null
}

// Membuat transaksi pembayaran Midtrans
export async function createMidtransPayment(
  params: MidtransPaymentParams
): Promise<PaymentResponse> {
  try {
    // Validate input parameters
    const validationError = validateMidtransParams(params)
    if (validationError) {
      return {
        success: false,
        message: validationError,
      }
    }

    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User tidak terautentikasi',
      }
    }

    // Validasi order exists dan milik user
    const order = await prisma.order.findFirst({
      where: {
        id: params.orderId,
        userId: session.user.id,
      },
      include: {
        payment: true,
        address: true,
      },
    })

    if (!order) {
      return {
        success: false,
        message: 'Order tidak ditemukan',
      }
    }

    // Cek apakah sudah ada payment yang berhasil
    if (order.payment?.some((p) => p.status === 'SUCCESS')) {
      return {
        success: false,
        message: 'Order sudah dibayar',
      }
    }

    // Generate transaction ID untuk Midtrans
    const transactionId = `ord-${Date.now()}`

    // Calculate total amount from item details
    const itemDetailsSum = params.itemDetails.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
    const ppn = Math.round(itemDetailsSum * 0.11)
    const totalAmount = itemDetailsSum + ppn

    // Ensure item details have exact prices to match total
    const adjustedItemDetails = params.itemDetails.map((item, index) => {
      // For the last item, adjust the price to make the total exact
      if (index === params.itemDetails.length - 1) {
        const currentItemTotal = item.price * item.quantity
        const remainingAmount =
          totalAmount -
          params.itemDetails
            .slice(0, -1)
            .reduce((total, it) => total + it.price * it.quantity, 0) -
          ppn

        // Adjust the price of the last item to make the total exact
        const adjustedPrice =
          Math.round((remainingAmount / item.quantity) * 100) / 100

        return {
          ...item,
          price: adjustedPrice,
        }
      }
      return item
    })

    // Update order with calculated amounts
    await prisma.order.update({
      where: { id: params.orderId },
      data: {
        subtotalAmount: itemDetailsSum,
        totalAmount: totalAmount,
      },
    })

    // Update payment record with calculated amounts
    await prisma.payment.updateMany({
      where: {
        orderId: params.orderId,
        status: 'CONFIRMED',
      },
      data: {
        amount: totalAmount,
      },
    })

    // Prepare transaction details untuk Midtrans
    const transactionDetails = {
      transaction_details: {
        order_id: transactionId,
        gross_amount: totalAmount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: params.customerDetails,
      item_details: adjustedItemDetails,
      callbacks: {
        finish: `http://localhost:3000/payment/success`,
        unfinish: `http://localhost:3000/payment/pending`,
        error: `http://localhost:3000/payment/error`,
      },
    }

    // Buat transaksi di Midtrans menggunakan Core API
    const midtransResponse = await createTransaction(transactionDetails)

    if (!midtransResponse.success) {
      return {
        success: false,
        message: 'Gagal membuat transaksi pembayaran',
        error: midtransResponse.error,
      }
    }

    // Update payment record dengan transaction ID Midtrans
    await prisma.payment.updateMany({
      where: {
        orderId: params.orderId,
        status: 'CONFIRMED',
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

    return {
      success: true,
      message: 'Transaksi pembayaran berhasil dibuat',
      data: {
        transaction_id: transactionId,
        payment_type: midtransResponse.data.payment_type,
        transaction_status: midtransResponse.data.transaction_status,
        va_numbers: midtransResponse.data.va_numbers,
        redirect_url: midtransResponse.data.redirect_url,
      },
    }
  } catch (error) {
    console.error('Error creating Midtrans payment:', error)
    return {
      success: false,
      message: 'Gagal membuat transaksi pembayaran',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Mengecek status transaksi Midtrans
export async function checkMidtransTransaction(
  transactionId: string
): Promise<PaymentResponse> {
  try {
    // Validate input
    const validationError = validateTransactionId(transactionId)
    if (validationError) {
      return {
        success: false,
        message: validationError,
      }
    }

    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User tidak terautentikasi',
      }
    }

    // Cek status di Midtrans
    const statusResponse = await checkTransaction(transactionId)

    if (!statusResponse.success) {
      return {
        success: false,
        message: 'Gagal mengecek status transaksi',
        error: statusResponse.error,
      }
    }

    const transactionStatus = statusResponse.data.transaction_status
    const fraudStatus = statusResponse.data.fraud_status

    // Update status payment berdasarkan response Midtrans
    let paymentStatus: PaymentStatus = 'PENDING'
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
    } else if (transactionStatus === 'pending') {
      paymentStatus = 'PENDING'
    }

    // Update payment dan order status
    const payment = await prisma.payment.findFirst({
      where: { transactionId },
      include: { order: true },
    })

    if (payment) {
      try {
        await prisma.$transaction(async (tx) => {
          // Update payment status
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: paymentStatus,
              transactionStatus: transactionStatus,
              paidAt: paymentStatus === 'SUCCESS' ? new Date() : null,
            },
          })

          // Update order status
          await tx.order.update({
            where: { id: payment.orderId },
            data: { status: orderStatus },
          })
        })
      } catch (dbError) {
        console.error('Database transaction error:', dbError)
        return {
          success: false,
          message: 'Gagal memperbarui status di database',
          error: dbError instanceof Error ? dbError.message : 'Database error',
        }
      }
    }

    return {
      success: true,
      message: 'Status transaksi berhasil diperbarui',
      data: {
        transaction_status: transactionStatus,
        fraud_status: fraudStatus,
        payment_status: paymentStatus,
        order_status: orderStatus,
        transactionId: transactionId,
        statusResponse,
      },
    }
  } catch (error) {
    console.error('Error checking Midtrans transaction:', error)
    return {
      success: false,
      message: 'Gagal mengecek status transaksi',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Membatalkan transaksi Midtrans
export async function cancelMidtransTransaction(
  transactionId: string
): Promise<PaymentResponse> {
  try {
    // Validate input
    const validationError = validateTransactionId(transactionId)
    if (validationError) {
      return {
        success: false,
        message: validationError,
      }
    }

    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User tidak terautentikasi',
      }
    }

    // Validasi payment exists dan milik user
    const payment = await prisma.payment.findFirst({
      where: {
        transactionId,
        order: {
          userId: session.user.id,
        },
      },
      include: { order: true },
    })

    if (!payment) {
      return {
        success: false,
        message: 'Transaksi tidak ditemukan',
      }
    }

    // Check if payment can be cancelled
    if (payment.status === 'SUCCESS') {
      return {
        success: false,
        message: 'Transaksi yang sudah berhasil tidak dapat dibatalkan',
      }
    }

    if (payment.status === 'CANCELLED') {
      return {
        success: false,
        message: 'Transaksi sudah dibatalkan sebelumnya',
      }
    }

    // Cancel di Midtrans
    const cancelResponse = await cancelTransaction(transactionId)

    if (!cancelResponse.success) {
      return {
        success: false,
        message: 'Gagal membatalkan transaksi',
        error: cancelResponse.error,
      }
    }

    // Update status payment dan order
    try {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'CANCELLED' },
        })

        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'CANCELLED' },
        })
      })

      revalidatePath('/orders')
      revalidatePath('/dashboard/orders')
    } catch (dbError) {
      console.error('Database transaction error:', dbError)
      return {
        success: false,
        message: 'Gagal memperbarui status pembatalan di database',
        error: dbError instanceof Error ? dbError.message : 'Database error',
      }
    }

    return {
      success: true,
      message: 'Transaksi berhasil dibatalkan',
      data: cancelResponse.data,
    }
  } catch (error) {
    console.error('Error canceling Midtrans transaction:', error)
    return {
      success: false,
      message: 'Gagal membatalkan transaksi',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Handle webhook notification dari Midtrans
export async function handleMidtransNotification(
  notificationBody: any
): Promise<PaymentResponse> {
  try {
    if (!notificationBody || typeof notificationBody !== 'object') {
      return {
        success: false,
        message: 'Invalid notification body',
      }
    }

    const transactionId = notificationBody.order_id
    const transactionStatus = notificationBody.transaction_status
    const fraudStatus = notificationBody.fraud_status
    const signatureKey = notificationBody.signature_key
    const statusCode = notificationBody.status_code
    const grossAmount = notificationBody.gross_amount

    if (!transactionId || !transactionStatus) {
      return {
        success: false,
        message: 'Missing required notification fields',
      }
    }

    // Verifikasi signature untuk keamanan
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (serverKey && signatureKey) {
      const expectedSignature = crypto
        .createHash('sha512')
        .update(`${transactionId}${statusCode}${grossAmount}${serverKey}`)
        .digest('hex')

      if (signatureKey !== expectedSignature) {
        return {
          success: false,
          message: 'Invalid signature',
        }
      }
    }

    // Update status berdasarkan notification
    let paymentStatus: PaymentStatus = 'PENDING'
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
    } else if (transactionStatus === 'pending') {
      paymentStatus = 'PENDING'
    }

    // Update payment dan order
    const payment = await prisma.payment.findFirst({
      where: { transactionId },
      include: { order: true },
    })

    if (payment) {
      try {
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

        revalidatePath('/orders')
        revalidatePath('/dashboard/orders')
      } catch (dbError) {
        console.error('Database transaction error:', dbError)
        return {
          success: false,
          message: 'Gagal memperbarui status dari notifikasi',
          error: dbError instanceof Error ? dbError.message : 'Database error',
        }
      }
    }

    return {
      success: true,
      message: 'Notification processed successfully',
      data: {
        transaction_id: transactionId,
        payment_status: paymentStatus,
        order_status: orderStatus,
      },
    }
  } catch (error) {
    console.error('Error handling Midtrans notification:', error)
    return {
      success: false,
      message: 'Gagal memproses notifikasi',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Mendapatkan detail pembayaran berdasarkan order ID
export async function getPaymentByOrderId(
  orderId: string
): Promise<PaymentResponse> {
  try {
    const validationError = validateTransactionId(orderId)
    if (validationError) {
      return {
        success: false,
        message: validationError,
      }
    }

    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User tidak terautentikasi',
      }
    }

    // Optimized query with selected fields only
    const payment = await prisma.payment.findFirst({
      where: {
        orderId: orderId,
        order: {
          userId: session.user.id,
        },
      },
      select: {
        id: true,
        status: true,
        amount: true,
        paymentMethod: true,
        bank: true,
        vaNumber: true,
        transactionId: true,
        order: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
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
          },
        },
      },
    })

    if (!payment) {
      return {
        success: false,
        message: 'Payment tidak ditemukan untuk order ini',
      }
    }

    return {
      success: true,
      message: 'Payment berhasil diambil',
      data: payment,
    }
  } catch (error) {
    console.error('Error getting payment by order ID:', error)
    return {
      success: false,
      message: 'Gagal mengambil data payment',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Fungsi untuk testing - approve transaction (sandbox only)
export async function approveMidtransTransaction(
  transactionId: string
): Promise<PaymentResponse> {
  try {
    // Validate input
    const validationError = validateTransactionId(transactionId)
    if (validationError) {
      return {
        success: false,
        message: validationError,
      }
    }

    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User tidak terautentikasi',
      }
    }

    // Hanya untuk sandbox/testing
    if (process.env.NODE_ENV === 'production') {
      return {
        success: false,
        message: 'Fungsi ini hanya tersedia untuk testing',
      }
    }

    const approveResponse = await approveTransaction(transactionId)

    if (!approveResponse.success) {
      return {
        success: false,
        message: 'Gagal menyetujui transaksi',
        error: approveResponse.error,
      }
    }

    // Update status payment
    const payment = await prisma.payment.findFirst({
      where: { transactionId },
    })

    if (payment) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: 'SUCCESS',
              paidAt: new Date(),
            },
          })

          await tx.order.update({
            where: { id: payment.orderId },
            data: { status: 'CONFIRMED' },
          })
        })

        revalidatePath('/orders')
        revalidatePath('/dashboard/orders')
      } catch (dbError) {
        console.error('Database transaction error:', dbError)
        return {
          success: false,
          message: 'Gagal memperbarui status persetujuan',
          error: dbError instanceof Error ? dbError.message : 'Database error',
        }
      }
    }

    return {
      success: true,
      message: 'Transaksi berhasil disetujui',
      data: approveResponse,
    }
  } catch (error) {
    console.error('Error approving Midtrans transaction:', error)
    return {
      success: false,
      message: 'Gagal menyetujui transaksi',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
