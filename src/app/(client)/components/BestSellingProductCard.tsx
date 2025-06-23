'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { Badge } from '@/components/ui/badge'

interface ProductCardProps {
  product: any // Replace with proper Product type if available
  index?: number
  priority?: boolean
}

/**
 * Kartu produk terlaris yang menampilkan badge label, nama brand, harga, dan stok.
 * Dibuat client component agar bisa memakai interaktivitas (hover, dll).
 */
const BestSellingProductCard = memo(
  ({ product, index = 0, priority = false }: ProductCardProps) => {
    // Format harga supaya tidak dihitung ulang tiap render
    const formattedPrice = useMemo(
      () =>
        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(product.price),
      [product.price]
    )

    // Buat path SEO URL kategori → slug produk
    const categoryPath = useMemo(() => {
      if (product.category?.parent) {
        return `kategori/${product.category.parent.slug}/${product.category.slug}/${product.slug}`
      }
      return `kategori/${product.category.slug}/${product.slug}`
    }, [product.category, product.slug])

    return (
      <Link
        href={`/${categoryPath}`}
        className='group bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 hover:border-primary/20  h-full flex flex-col'>
        <div className='relative w-full aspect-square bg-gray-50'>
          <OptimizedImage
            src={product.images?.[0] || '/assets/products/placeholder.png'}
            alt={product.name}
            width={100}
            height={100}
            priority={priority || index === 0}
            quality={60}
            className='w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200'
            sizes='(max-width:480px) 45vw, (max-width:768px) 30vw, (max-width:1024px) 22vw, 16vw'
            fallback='/assets/products/placeholder.png'
          />

          {/* Status overlay when out of stock */}
          {product.stock === 0 && (
            <div className='absolute inset-0 bg-black/50 flex items-center justify-center z-10'>
              <Badge variant='destructive' className='px-2 py-1'>
                Stok Habis
              </Badge>
            </div>
          )}

          {/* Badge label */}
          {product.label && (
            <div className='absolute top-2 left-2 z-20'>
              <Badge variant='destructive' className='text-xs px-2 py-0.5'>
                {product.label.replace('_', ' ')}
              </Badge>
            </div>
          )}
        </div>

        <div className='p-2 flex flex-col h-full'>
          {/* Brand */}
          <div className='h-4 mb-1'>
            {product.brand ? (
              <p className='text-xs text-gray-500 truncate'>
                {product.brand.name}
              </p>
            ) : (
              <p className='text-xs text-gray-400'>No Brand</p>
            )}
          </div>

          {/* Product name */}
          <h3 className='text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-2 flex-1 min-h-[2rem]'>
            {product.name}
          </h3>

          {/* Price */}
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

BestSellingProductCard.displayName = 'BestSellingProductCard'

export default BestSellingProductCard
