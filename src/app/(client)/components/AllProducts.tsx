'use client'

import { memo, useMemo } from 'react'
import { getAllProducts } from '@/app/actions/productAction'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import { FeaturedProductCard } from './FeaturedProductCard'

// Skeleton component untuk loading state
const AllProductsSkeleton = memo(() => (
  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 auto-rows-fr'>
    {Array.from({ length: 24 }).map((_, index) => (
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

AllProductsSkeleton.displayName = 'AllProductsSkeleton'

const AllProducts = memo(() => {
  // Query untuk mengambil semua produk
  const {
    data: allProductsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.products.all(),
    queryFn: async () => {
      const result = await getAllProducts({
        limit: 24, // Limit 24 produk untuk tampilan yang optimal
        isActive: true,
      })
      if (!result.success || result.error) {
        throw new Error(result.error || 'Gagal mengambil data produk')
      }
      return result.products
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Memoize filtered products
  const displayProducts = useMemo(() => {
    if (!allProductsData) return []
    return allProductsData.filter((product) => product.isActive).slice(0, 24)
  }, [allProductsData])

  if (error) {
    return (
      <section className='mb-8'>
        <div className='container mx-auto px-4'>
          <div className='my-6 flex items-center justify-between'>
            <h2 className='text-lg sm:text-xl lg:text-2xl text-foreground/85 font-bold'>
              Semua Produk
            </h2>
          </div>
          <div className='text-center py-8 text-gray-500'>
            Gagal memuat produk. Silakan coba lagi nanti.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className='mb-8'>
      <div className='container mx-auto px-4'>
        <div className='my-6 flex items-center justify-between'>
          <h2 className='text-lg sm:text-xl lg:text-2xl text-foreground/85 font-bold'>
            Semua Produk
          </h2>
          {!isLoading && displayProducts.length > 0 && (
            <Link
              href='/kategori'
              className='text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors'>
              Lihat Semua
            </Link>
          )}
        </div>

        {isLoading ? (
          <AllProductsSkeleton />
        ) : displayProducts.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            Belum ada produk tersedia.
          </div>
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 auto-rows-fr'>
            {displayProducts.map((product, index) => (
              <FeaturedProductCard
                key={product.id}
                product={product}
                index={index}
                priority={false} // Tidak prioritas karena di bawah featured products
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
})

AllProducts.displayName = 'AllProducts'

export default AllProducts
