import { NextRequest, NextResponse } from 'next/server'
import { getAllCategories } from '@/app/actions/categoryAction'

export async function GET(request: NextRequest) {
  try {
    const result = await getAllCategories()

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    const response = NextResponse.json(result.categorie)

    // Add caching headers - categories don't change often
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=1800, stale-while-revalidate=3600' // 30 min cache, 1 hour stale
    )

    return response
  } catch (error) {
    console.error('Error in categories API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
