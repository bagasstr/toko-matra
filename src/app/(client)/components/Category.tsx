'use client'

import { memo, useMemo } from 'react'
import { getParentCategories } from '@/app/actions/categoryAction'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import { CategoryCard } from './CategoryCard'

interface IDataCategories {
  id: string
  name: string
  imageUrl: string | null
  slug: string
}

// Skeleton component yang dioptimalkan
const CategorySkeleton = memo(() => (
  <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3'>
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className='bg-white rounded-md shadow-sm overflow-hidden border border-gray-100'>
        <div className='w-full aspect-square bg-gray-200 animate-pulse' />
        <div className='p-2'>
          <div className='h-3 w-full bg-gray-200 rounded animate-pulse' />
        </div>
      </div>
    ))}
  </div>
))

CategorySkeleton.displayName = 'CategorySkeleton'

const Category = memo(() => {
  // Use optimized query with proper caching
  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categories', 'parent-only'], // Key yang sangat spesifik untuk parent categories
    queryFn: async () => {
      const { categorie, success, error } = await getParentCategories()
      if (!success) {
        throw new Error(error || 'Gagal memuat kategori')
      }
      return categorie || []
    },
    staleTime: 30 * 60 * 1000, // 30 minutes cache - optimal untuk production
    gcTime: 60 * 60 * 1000, // 1 hour cache
    refetchOnWindowFocus: false, // Disable untuk performance
    refetchOnMount: false, // Disable untuk performance
    retry: 1, // Minimal retry untuk faster failures
    retryDelay: 1000, // Quick retry
    refetchInterval: false, // Disable auto refetch
    enabled: true, // Query enabled
  })

  // Memoize filtered categories dengan validasi yang lebih ketat
  const displayCategories = useMemo(() => {
    if (!Array.isArray(categories)) {
      return []
    }

    return categories
      .filter((category) => {
        // Pastikan ini adalah parent category (tidak punya parentId)
        return (
          category &&
          category.name &&
          category.slug &&
          category.id &&
          category.parentId === null && // Eksplisit filter hanya parent categories
          category.isActive !== false // Pastikan kategori aktif
        )
      })
      .slice(0, 16) // Limit to 16 categories
  }, [categories])

  if (error) {
    return (
      <section className='mb-8'>
        <div className='container mx-auto px-4'>
          <div className='my-6 flex items-center justify-between'>
            <h2 className='text-lg sm:text-xl lg:text-2xl text-foreground/85 font-bold'>
              Kategori Produk
            </h2>
          </div>
          <div className='text-center py-8 text-gray-500'>
            <p>Gagal memuat kategori. Silakan coba lagi nanti.</p>
            <p className='text-xs mt-2 text-red-500'>
              Error: {error?.message || 'Unknown error'}
            </p>
          </div>
        </div>
      </section>
    )
  }

  // Performance monitoring disabled in production

  return (
    <section className='mb-8'>
      <div className='container mx-auto px-4'>
        <div className='my-6 flex items-center justify-between'>
          <h2 className='text-lg sm:text-xl lg:text-2xl text-foreground/85 font-bold'>
            Kategori Produk
          </h2>
          {!isLoading && displayCategories.length > 0 && (
            <Link
              href='/kategori'
              className='text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors'>
              Lihat Semua
            </Link>
          )}
        </div>

        {isLoading ? (
          <>
            <CategorySkeleton />
          </>
        ) : displayCategories.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <p>Belum ada kategori tersedia.</p>
            <p className='text-xs mt-2'>
              Raw categories count: {categories.length} | Filtered:{' '}
              {displayCategories.length}
            </p>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3'>
              {displayCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                />
              ))}
            </div>
            <div className='text-center mt-2 text-xs text-gray-400'></div>
          </>
        )}
      </div>
    </section>
  )
})

Category.displayName = 'Category'

export default Category
