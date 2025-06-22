import { NextRequest, NextResponse } from 'next/server'
import { getParentCategories } from '@/app/actions/categoryAction'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'parent'

    let result

    if (type === 'parent') {
      result = await getParentCategories()
    } else {
      // Future: add other category types
      result = await getParentCategories()
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    const response = NextResponse.json({
      success: true,
      categories: result.categorie,
      count: result.categorie?.length || 0,
    })

    // Add aggressive caching for categories (they don't change often)
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
