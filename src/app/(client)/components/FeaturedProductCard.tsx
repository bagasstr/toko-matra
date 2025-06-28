'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  images: string[]
  price: number
  isActive: boolean
  label: string
  isFeatured: boolean
  category: {
    id: string
    name: string
    parentId: string
    slug: string
    parent?: {
      id: string
      name: string
      slug: string
    }
  }
  brand: {
    name: string
    id: string
    slug: string
    logo: string
  } | null
  stock: number
  description?: string
  slug: string
}

interface FeaturedProductCardProps {
  product: Product
  index?: number
  priority?: boolean
}

export const FeaturedProductCard = memo(
  ({ product, index = 0, priority = false }: FeaturedProductCardProps) => {
    const formattedPrice = useMemo(
      () =>
        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(product.price),
      [product.price]
    )

    const categoryPath = useMemo(() => {
      if (product.category.parent) {
        return `kategori/${product.category.parent.slug}/${product.category.slug}/${product.slug}`
      }
      return `kategori/${product.category.slug}/${product.slug}`
    }, [product.category, product.slug])

    return (
      <Link
        href={`/${categoryPath}`}
        className='group bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 hover:border-primary/20  h-full flex flex-col'>
        <div className='relative w-full aspect-square bg-gray-50'>
          <Image
            src={product.images[0] || '/assets/products/placeholder.png'}
            alt={product.name}
            width={100}
            height={100}
            priority={priority || index < 6}
            quality={75}
            className='w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200'
            sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16.67vw'
          />

          {/* Status overlay for out of stock */}
          {product.stock === 0 && (
            <div className='absolute inset-0 bg-black/50 flex items-center justify-center z-10'>
              <Badge variant='destructive' className='px-2 py-1'>
                Stok Habis
              </Badge>
            </div>
          )}

          {/* Top badges row */}
          <div className='absolute top-2 left-2 right-2 flex justify-between items-start z-20'>
            {/* Left side badge */}
            <div>
              {product.label && (
                <Badge variant='destructive' className='text-xs px-2 py-0.5'>
                  {product.label.replace('_', ' ')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className='p-2 flex flex-col h-full'>
          {/* Brand with consistent height */}
          <div className='h-4 mb-1'>
            {product.brand ? (
              <p className='text-xs text-gray-500 truncate'>
                {product.brand.name}
              </p>
            ) : (
              <p className='text-xs text-gray-400'>No Brand</p>
            )}
          </div>

          {/* Product name with consistent height */}
          <h3 className='text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-2 flex-1 min-h-[2rem]'>
            {product.name}
          </h3>

          {/* Price and stock - always at bottom */}
          <div className='mt-auto space-y-1'>
            <p className='text-sm font-semibold text-primary truncate'>
              {formattedPrice}
            </p>
          </div>
        </div>
      </Link>
    )
  }
)

FeaturedProductCard.displayName = 'FeaturedProductCard'
