import { NextRequest, NextResponse } from 'next/server'
import { getPaymentByOrderId } from '@/app/actions/midtransAction'
import { validateSession } from '@/app/actions/session'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const orderId = params.id
    const paymentData = await getPaymentByOrderId(orderId)

    if (!paymentData.success) {
      return NextResponse.json(
        { success: false, message: paymentData.message },
        { status: 404 }
      )
    }

    // Add cache headers
    return NextResponse.json(
      { success: true, data: paymentData.data },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          'CDN-Cache-Control': 'public, s-maxage=30',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching order details:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
