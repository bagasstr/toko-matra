import { handleMidtransCallback } from '@/app/actions/paymentAction'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const notification = await request.json()
    const result = await handleMidtransCallback(notification)

    if (result.success) {
      return NextResponse.json({ status: 'OK' })
    } else {
      return NextResponse.json(
        { status: 'ERROR', message: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error processing Midtrans callback:', error)
    return NextResponse.json(
      { status: 'ERROR', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
