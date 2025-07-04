import midtransClient from 'midtrans-client'

// Validasi environment variables
if (!process.env.MIDTRANS_SERVER_KEY) {
  throw new Error('MIDTRANS_SERVER_KEY is required')
}

if (!process.env.MIDTRANS_CLIENT_KEY) {
  throw new Error('MIDTRANS_CLIENT_KEY is required')
}

// Initialize Midtrans Core API client configuration for sandbox
const coreApi = new midtransClient.CoreApi({
  isProduction: false, // Set to false for sandbox mode
  serverKey: process.env.MIDTRANS_SERVER_KEY, // Sandbox server key (SB-Mid-server-xxx)
  clientKey: process.env.MIDTRANS_CLIENT_KEY, // Sandbox client key (SB-Mid-client-xxx)
})

// Export the configured client
export default coreApi

// Helper function to create transaction using Core API
export const createTransaction = async (transactionDetails: any) => {
  try {
    const response = await coreApi.charge(transactionDetails)
    return {
      success: true,
      data: response,
    }
  } catch (error: any) {
    console.error('Midtrans Core API Error:', error)
    return {
      success: false,
      error: error.message || 'Failed to create transaction',
      details: error,
    }
  }
}

// Helper function to check transaction status with retry logic
export const checkTransaction = async (
  transactionId: string,
  retryCount = 0
) => {
  const maxRetries = 3
  const retryDelay = 1000 * (retryCount + 1) // 1s, 2s, 3s

  try {
    const response = await coreApi.transaction.status(transactionId)
    return {
      success: true,
      data: response,
    }
  } catch (error: any) {
    console.error(
      `Midtrans Status Check Error (attempt ${retryCount + 1}):`,
      error
    )

    // Check if it's a temporary server error (500) and we haven't exceeded max retries
    const isServerError =
      error?.httpStatusCode === '500' ||
      error?.ApiResponse?.status_code === '500'
    const shouldRetry = isServerError && retryCount < maxRetries

    if (shouldRetry) {
      console.log(`Retrying in ${retryDelay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, retryDelay))
      return checkTransaction(transactionId, retryCount + 1)
    }

    // Determine error type for better user messaging
    let userMessage = 'Failed to check transaction status'
    if (isServerError) {
      userMessage =
        'Midtrans server is temporarily unavailable. Please try again later.'
    } else if (error?.httpStatusCode === '404') {
      userMessage = 'Transaction not found. Please check your transaction ID.'
    } else if (error?.httpStatusCode === '401') {
      userMessage = 'Authentication failed. Please contact support.'
    }

    return {
      success: false,
      error: userMessage,
      details: error,
      isTemporary: isServerError,
    }
  }
}

// Helper function to cancel transaction
export const cancelTransaction = async (transactionId: string) => {
  try {
    const response = await coreApi.transaction.cancel(transactionId)
    return {
      success: true,
      data: response,
    }
  } catch (error: any) {
    console.error('Midtrans Cancel Error:', error)
    return {
      success: false,
      error: error.message || 'Failed to cancel transaction',
      details: error,
    }
  }
}

// Helper function to approve transaction (for testing in sandbox)
export const approveTransaction = async (transactionId: string) => {
  try {
    const response = await coreApi.transaction.approve(transactionId)
    return {
      success: true,
      data: response,
    }
  } catch (error: any) {
    console.error('Midtrans Approve Error:', error)
    return {
      success: false,
      error: error.message || 'Failed to approve transaction',
      details: error,
    }
  }
}

// Helper function to expire transaction
export const expireTransaction = async (transactionId: string) => {
  try {
    const response = await coreApi.transaction.expire(transactionId)
    return {
      success: true,
      data: response,
    }
  } catch (error: any) {
    console.error('Midtrans Expire Error:', error)
    return {
      success: false,
      error: error.message || 'Failed to expire transaction',
      details: error,
    }
  }
}

// Sandbox configuration constants
export const SANDBOX_CONFIG = {
  BASE_URL: 'https://api.sandbox.midtrans.com',
  NOTIFICATION_URL:
    process.env.MIDTRANS_NOTIFICATION_URL ||
    'http://localhost:3000/api/midtrans/notification',
  FINISH_URL:
    process.env.MIDTRANS_FINISH_URL || 'http://localhost:3000/payment/success',
  UNFINISH_URL:
    process.env.MIDTRANS_UNFINISH_URL ||
    'http://localhost:3000/payment/pending',
  ERROR_URL:
    process.env.MIDTRANS_ERROR_URL || 'http://localhost:3000/payment/error',
}

// Test credit card numbers for sandbox
export const SANDBOX_TEST_CARDS = {
  SUCCESS: {
    number: '4811111111111114',
    cvv: '123',
    expiry: '12/25',
  },
  FAILURE: {
    number: '4911111111111113',
    cvv: '123',
    expiry: '12/25',
  },
  CHALLENGE: {
    number: '4411111111111118',
    cvv: '123',
    expiry: '12/25',
  },
}
