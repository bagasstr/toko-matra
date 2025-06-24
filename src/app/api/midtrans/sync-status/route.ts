import { NextResponse } from 'next/server'
import { checkMidtransTransaction } from '@/app/actions/midtransAction'
import { validateSession } from '@/app/actions/session'

export async function POST(request: Request) {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'User tidak terautentikasi' },
        { status: 401 }
      )
    }

    const { transactionId } = await request.json()

    if (!transactionId) {
      return NextResponse.json(
        { success: false, message: 'Transaction ID diperlukan' },
        { status: 400 }
      )
    }

    console.log('Manual sync status for transaction:', transactionId)

    // Force check status with Midtrans
    const result = await checkMidtransTransaction(transactionId)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Gagal sync status',
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Status berhasil disync',
      data: result.data,
    })
  } catch (error) {
    console.error('Error syncing status:', error)
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
