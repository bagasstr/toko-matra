import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Category section skeleton
export const CategorySkeleton = memo(() => (
  <div className='mb-8'>
    <div className='container mx-auto px-4'>
      <Skeleton className='h-8 w-48 mb-6' />
      <div className='grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='flex flex-col items-center'>
            <Skeleton className='w-16 h-16 rounded-full mb-2' />
            <Skeleton className='h-3 w-12' />
          </div>
        ))}
      </div>
    </div>
  </div>
))

CategorySkeleton.displayName = 'CategorySkeleton'

// Featured products section skeleton
export const FeaturedProductsSkeleton = memo(() => (
  <div className='mb-8'>
    <div className='container mx-auto px-4'>
      <div className='flex items-center justify-between mb-6'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-6 w-24' />
      </div>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='bg-white rounded-lg shadow overflow-hidden'>
            <Skeleton className='w-full aspect-square' />
            <div className='p-4 space-y-2'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
              <Skeleton className='h-5 w-full' />
              <Skeleton className='h-3 w-2/3' />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
))

FeaturedProductsSkeleton.displayName = 'FeaturedProductsSkeleton'

// All products list skeleton
export const AllProductsSkeleton = memo(() => (
  <div className='mb-8'>
    <div className='container mx-auto px-4'>
      <div className='flex items-center justify-between mb-6'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-6 w-24' />
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className='bg-white rounded-md shadow-sm overflow-hidden border border-gray-100'>
            <Skeleton className='w-full aspect-square' />
            <div className='p-2 space-y-1'>
              <Skeleton className='h-3 w-1/2' />
              <Skeleton className='h-3 w-3/4' />
              <Skeleton className='h-3 w-full' />
              <Skeleton className='h-4 w-2/3' />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
))

AllProductsSkeleton.displayName = 'AllProductsSkeleton'

// Brand section skeleton
export const BrandSkeleton = memo(() => (
  <div className='mb-8'>
    <div className='container mx-auto px-4'>
      <Skeleton className='h-8 w-32 mb-6' />
      {/* Mobile skeleton */}
      <div className='lg:hidden overflow-x-auto scrollbar-hide'>
        <div className='flex gap-3 py-2 w-full'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='w-[120px] flex-shrink-0'>
              <div className='flex flex-col items-center gap-2'>
                <Skeleton className='w-20 h-20 rounded-full' />
                <Skeleton className='h-4 w-16' />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Desktop skeleton */}
      <div className='hidden lg:grid grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className='flex flex-col items-center gap-2'>
              <Skeleton className='w-24 h-24 rounded-full' />
              <Skeleton className='h-3 w-16' />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
))

BrandSkeleton.displayName = 'BrandSkeleton'

// Generic content skeleton (used for Benefit, FAQ, etc.)
export const ContentSkeleton = memo(() => (
  <div className='mb-8'>
    <div className='container mx-auto px-4'>
      <Skeleton className='h-8 w-32 mb-6' />
      <div className='space-y-4'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-4 w-1/2' />
      </div>
    </div>
  </div>
))

ContentSkeleton.displayName = 'ContentSkeleton'
