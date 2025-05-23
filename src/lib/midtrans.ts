import midtransClient from 'midtrans-client'

// Create Core API instance
export const core = new midtransClient.CoreApi({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
})

// Helper function to create transaction parameters
export const createTransactionParams = (
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
) => {
  const baseParams = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: customerDetails.firstName,
      last_name: customerDetails.lastName || '',
      email: customerDetails.email,
      phone: customerDetails.phone,
    },
    item_details: itemDetails,
  }

  // Add payment method specific parameters
  switch (paymentMethod) {
    case 'bank_transfer':
      return {
        ...baseParams,
        bank_transfer: {
          bank: 'bca', // Default to BCA, can be made dynamic
        },
      }
    case 'e_wallet':
      return {
        ...baseParams,
        e_wallet: {
          provider: 'gopay', // Default to GoPay, can be made dynamic
        },
      }
    case 'virtual_account':
      return {
        ...baseParams,
        bank_transfer: {
          bank: 'bca', // Default to BCA VA, can be made dynamic
          va_number: '', // Will be filled by Midtrans
        },
      }
    default:
      return baseParams
  }
}

// Helper function to handle payment notification
export const handlePaymentNotification = async (notification: any) => {
  try {
    const statusResponse = await core.transaction.notification(notification)
    const orderId = statusResponse.order_id
    const transactionStatus = statusResponse.transaction_status
    const fraudStatus = statusResponse.fraud_status
    const paymentType = statusResponse.payment_type
    const vaNumber = statusResponse.va_numbers?.[0]?.va_number
    const bank = statusResponse.va_numbers?.[0]?.bank
    const eWalletType = statusResponse.payment_type

    let paymentStatus = 'PENDING'

    if (transactionStatus == 'capture') {
      if (fraudStatus == 'challenge') {
        paymentStatus = 'CHALLENGE'
      } else if (fraudStatus == 'accept') {
        paymentStatus = 'PAID'
      }
    } else if (transactionStatus == 'settlement') {
      paymentStatus = 'PAID'
    } else if (
      transactionStatus == 'cancel' ||
      transactionStatus == 'deny' ||
      transactionStatus == 'expire'
    ) {
      paymentStatus = 'FAILED'
    } else if (transactionStatus == 'pending') {
      paymentStatus = 'PENDING'
    }

    return {
      orderId,
      paymentStatus,
      transactionStatus,
      fraudStatus,
      paymentType,
      vaNumber,
      bank,
      eWalletType,
    }
  } catch (error) {
    console.error('Error handling payment notification:', error)
    throw error
  }
}

// Helper function to get transaction status
export const getTransactionStatus = async (orderId: string) => {
  try {
    const response = await core.transaction.status(orderId)
    return response
  } catch (error) {
    console.error('Error getting transaction status:', error)
    throw error
  }
}
