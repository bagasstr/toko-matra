import { NextRequest, NextResponse } from 'next/server'
import { getAllBrands } from '@/app/actions/brandAction'

export async function GET(request: NextRequest) {
  try {
    const { brands } = await getAllBrands()

    return NextResponse.json({
      success: true,
      brands,
    })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch brands',
      },
      { status: 500 }
    )
  }
}
