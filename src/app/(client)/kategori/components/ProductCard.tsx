'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Product } from '../types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from '@/app/actions/wishlist'
import { Heart } from 'lucide-react'

interface ProductCardProps {
  product: Product
  href: string
  showBrand?: boolean
  userId?: string
}

export function ProductCard({
  product,
  href,
  showBrand = true,
  userId,
}: ProductCardProps) {
  const queryClient = useQueryClient()
  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist', userId],
    queryFn: () => getWishlist(userId!),
    enabled: !!userId,
  })
  const isWishlisted = wishlist.some((w: any) => w.productId === product.id)
  const mutation = useMutation({
    mutationFn: () =>
      isWishlisted
        ? removeFromWishlist(userId!, product.id)
        : addToWishlist(userId!, product.id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['wishlist', userId] }),
  })
  return (
    <Link
      href={href}
      className='group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 hover:border-primary/20 relative'>
      <div className='relative w-full h-40 bg-gray-50'>
        <Image
          src={product.images[0] || '/placeholder.png'}
          alt={product.name}
          fill
          priority
          sizes='(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
          className='object-contain group-hover:scale-105 transition-transform duration-200'
        />
        {userId && (
          <button
            className='absolute top-2 right-2 z-10 p-1 rounded-full bg-white/80 hover:bg-white shadow'
            onClick={(e) => {
              e.preventDefault()
              mutation.mutate()
            }}
            aria-label={
              isWishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'
            }>
            <Heart
              className={
                isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'
              }
            />
          </button>
        )}
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
