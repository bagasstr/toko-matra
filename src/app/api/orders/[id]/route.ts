import { NextRequest, NextResponse } from 'next/server'
import { getPaymentByOrderId } from '@/app/actions/midtransAction'
import { validateSession } from '@/app/actions/session'

// Cache control for different environments
const CACHE_CONFIG = {
  production: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    'CDN-Cache-Control': 'public, s-maxage=60',
  },
  development: {
    'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
    'CDN-Cache-Control': 'public, s-maxage=5',
  },
}

const getCacheHeaders = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  return isProduction ? CACHE_CONFIG.production : CACHE_CONFIG.development
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let orderId: string

  try {
    // Validate session first for faster rejection
    const session = await validateSession()
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        { status: 401 }
      )
    }

    // Get and validate order ID
    const resolvedParams = await params
    orderId = resolvedParams.id

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_ID',
          message: 'Invalid order ID provided',
        },
        { status: 400 }
      )
    }

    // Get payment data
    const paymentData = await getPaymentByOrderId(orderId)

    if (!paymentData.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'ORDER_NOT_FOUND',
          message: paymentData.message || 'Order not found',
        },
        { status: 404 }
      )
    }

    // Return successful response with appropriate caching
    return NextResponse.json(
      {
        success: true,
        data: paymentData.data,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          ...getCacheHeaders(),
          'X-Request-ID': crypto.randomUUID(),
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error(
      `Error fetching order details for ID: ${orderId || 'unknown'}`,
      {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        orderId,
        timestamp: new Date().toISOString(),
      }
    )

    // Return structured error response
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while fetching order details',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
