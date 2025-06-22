import { NextRequest, NextResponse } from 'next/server'
import { getFeaturedProducts } from '@/app/actions/productAction'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const result = await getFeaturedProducts(limit)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    const response = NextResponse.json(result.products)

    // Add caching headers for better performance
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600' // 5 min cache, 10 min stale
    )

    return response
  } catch (error) {
    console.error('Error in featured products API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
