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
    {Array.from({ length: 16 }).map((_, index) => (
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
    queryKey: queryKeys.categories.all,
    queryFn: async () => {
      const { categorie, success, error } = await getParentCategories()
      if (!success) {
        throw new Error(error || 'Gagal memuat kategori')
      }
      return categorie
    },
    staleTime: 30 * 60 * 1000, // 30 minutes cache
    gcTime: 60 * 60 * 1000, // 1 hour cache
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data exists
  })

  // Memoize filtered categories (hanya yang aktif dan memiliki nama)
  const displayCategories = useMemo(() => {
    return categories
      .filter((category) => category.name && category.slug)
      .slice(0, 16) // Limit to 16 categories dengan card yang lebih kecil
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
            Gagal memuat kategori. Silakan coba lagi nanti.
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
          <CategorySkeleton />
        ) : displayCategories.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            Belum ada kategori tersedia.
          </div>
        ) : (
          <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3'>
            {displayCategories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
})

Category.displayName = 'Category'

export default Category
