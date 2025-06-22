'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Product } from '../types'

interface ProductCardProps {
  product: Product
  href: string
  showBrand?: boolean
}

export function ProductCard({
  product,
  href,
  showBrand = true,
}: ProductCardProps) {
  return (
    <Link
      href={href}
      className='group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 hover:border-primary/20'>
      <div className='relative w-full h-40 bg-gray-50'>
        <Image
          src={product.images[0] || '/placeholder.png'}
          alt={product.name}
          fill
          priority
          sizes='(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
          className='object-contain group-hover:scale-105 transition-transform duration-200'
        />
        {product.label && (
          <div className='absolute top-2 left-2'>
            <Badge
              variant={
                product.label === 'ready stock' ? 'default' : 'secondary'
              }
              className='text-xs'>
              {product.label}
            </Badge>
          </div>
        )}
      </div>

      <div className='p-3'>
        {showBrand && (
          <Badge variant='outline' className='mb-2 text-xs'>
            {product.brand?.name || 'No Brand'}
          </Badge>
        )}

        <h3 className='font-medium text-gray-900 line-clamp-2 text-sm mb-2 group-hover:text-primary transition-colors'>
          {product.name}
        </h3>

        <div className='flex items-center justify-between mt-auto'>
          <p className='text-primary font-semibold text-sm'>
            Rp {product.price?.toLocaleString('id-ID')}
          </p>
          {product.unit && (
            <span className='text-xs text-gray-500'>/{product.unit}</span>
          )}
        </div>

        {product.minOrder && product.minOrder > 1 && (
          <p className='text-xs text-gray-500 mt-1'>
            Min. order: {product.minOrder} {product.unit}
          </p>
        )}
      </div>
    </Link>
  )
}
