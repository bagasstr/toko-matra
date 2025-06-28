import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [] })
    }

    // Search dengan Prisma filter yang lebih efisien
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                category: {
                  name: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              },
              {
                brand: {
                  name: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true, // String[] array - tidak perlu nested select
        category: {
          select: {
            name: true,
            slug: true,
            parent: {
              select: {
                slug: true,
              },
            },
          },
        },
        brand: {
          select: {
            name: true,
          },
        },
      },
      take: limit,
      orderBy: {
        name: 'asc',
      },
    })

    // Transform images array to match expected format
    const transformedProducts = products.map((product) => ({
      ...product,
      images: product.images.map((url) => ({ url })), // Convert string[] to {url: string}[]
    }))

    return NextResponse.json({ products: transformedProducts })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error', products: [] },
      { status: 500 }
    )
  }
}
