'use client'

import { memo, useMemo } from 'react'
import {
  getBestSellingProducts,
  getFeaturedProductsBySales,
} from '@/app/actions/productAction'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import { FeaturedProductCard } from './FeaturedProductCard'
import { Badge } from '@/components/ui/badge'
import OptimizedImage from '@/components/OptimizedImage'

// Skeleton component yang dioptimalkan
const FeaturedProductsSkeleton = memo(() => (
  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 auto-rows-fr'>
    {Array.from({ length: 18 }).map((_, index) => (
      <div
        key={index}
        className='bg-white rounded-md shadow-sm overflow-hidden border border-gray-100 h-full flex flex-col'>
        <div className='w-full aspect-square bg-gray-200 animate-pulse' />
        <div className='p-2 flex flex-col h-32'>
          <div className='h-3 w-1/2 bg-gray-200 rounded animate-pulse mb-1' />
          <div className='h-3 w-3/4 bg-gray-200 rounded animate-pulse mb-1' />
          <div className='h-3 w-full bg-gray-200 rounded animate-pulse mb-2' />
          <div className='mt-auto space-y-1'>
            <div className='h-4 w-2/3 bg-gray-200 rounded animate-pulse' />
            <div className='h-3 w-1/2 bg-gray-200 rounded animate-pulse' />
          </div>
        </div>
      </div>
    ))}
  </div>
))

FeaturedProductsSkeleton.displayName = 'FeaturedProductsSkeleton'

// Enhanced ProductCard untuk menampilkan badge "Terlaris" dan jumlah terjual
const BestSellingProductCard = memo(
  ({ product, index = 0, priority = false }: any) => {
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
          <OptimizedImage
            src={product.images[0] || '/assets/products/placeholder.png'}
            alt={product.name}
            width={100}
            height={100}
            priority={priority || index < 6}
            quality={75}
            className='w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200'
            sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16.67vw'
            fallback='/assets/products/placeholder.png'
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
            {/* Left side badges */}
            <div className='flex flex-col gap-1'>
              {/* Best Seller Badge */}

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

BestSellingProductCard.displayName = 'BestSellingProductCard'

const FeaturedProducts = memo(() => {
  // Use optimized query for featured products - PURELY based on sales data
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.products.bestSelling(18),
    queryFn: async () => {
      const { products, error } = await getBestSellingProducts(18) // Limit to 18 products
      if (error) throw new Error(error)
      return products
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache (lebih lama untuk data sales)
    gcTime: 20 * 60 * 1000, // 20 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data exists
  })

  // Memoize filtered products (no need to filter by isFeatured since it's already handled by sales logic)
  const displayProducts = useMemo(() => {
    return products.filter((product) => product.isActive).slice(0, 18) // Limit display to 18 products untuk grid yang lebih rapi
  }, [products])

  // Hide the entire section if there are no products or if loading failed
  if (error || (!isLoading && displayProducts.length === 0)) {
    return null
  }

  return (
    <section className='mb-8'>
      <div className='container mx-auto px-4'>
        <div className='my-6 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h2 className='text-lg sm:text-xl lg:text-2xl text-foreground/85 font-bold'>
              Produk Unggulan
            </h2>
          </div>
          {!isLoading && displayProducts.length > 0 && (
            <Link
              href='/kategori'
              className='text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors'>
              Lihat Semua
            </Link>
          )}
        </div>

        {isLoading ? (
          <FeaturedProductsSkeleton />
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 auto-rows-fr'>
            {displayProducts.map((product, index) => (
              <BestSellingProductCard
                key={product.id}
                product={product}
                index={index}
                priority={index < 6}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
})

FeaturedProducts.displayName = 'FeaturedProducts'

export default FeaturedProducts
