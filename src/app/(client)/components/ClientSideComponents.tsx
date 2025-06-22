'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { memo } from 'react'

// Client-side dynamic imports with optimized loading strategy
const AllProducts = dynamic(() => import('./AllProducts'), {
  ssr: false,
  loading: () => <AllProductsSkeleton />,
})

// Load Brand with higher priority since user complained about slow loading
const Brand = dynamic(() => import('./brand'), {
  ssr: false,
  loading: () => <BrandSkeleton />,
})

const Benefit = dynamic(() => import('./benefit'), {
  ssr: false,
  loading: () => <ContentSkeleton />,
})

const Faq = dynamic(() => import('./faq'), {
  ssr: false,
  loading: () => <ContentSkeleton />,
})

// Optimized loading skeletons with memo
const AllProductsSkeleton = memo(() => (
  <div className='mb-8'>
    <div className='container mx-auto px-4'>
      <div className='flex items-center justify-between mb-6'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-6 w-24' />
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'>
        {Array.from({ length: 12 }).map((_, i) => (
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

const BrandSkeleton = memo(() => (
  <div className='mb-8'>
    <div className='container mx-auto px-4'>
      <Skeleton className='h-8 w-32 mb-6' />
      {/* Mobile Skeleton */}
      <div className='lg:hidden overflow-x-auto scrollbar-hide'>
        <div className='flex gap-3 py-2 w-full'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='w-[120px] flex-shrink-0'>
              <div className='flex flex-col items-center gap-2'>
                <Skeleton className='w-20 h-20 rounded-full' />
                <Skeleton className='h-4 w-16' />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Desktop Skeleton */}
      <div className='hidden lg:grid grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4'>
        {Array.from({ length: 8 }).map((_, i) => (
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

const ContentSkeleton = memo(() => (
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

// Add display names for better debugging
AllProductsSkeleton.displayName = 'AllProductsSkeleton'
BrandSkeleton.displayName = 'BrandSkeleton'
ContentSkeleton.displayName = 'ContentSkeleton'

const ClientSideComponents = memo(() => {
  return (
    <>
      {/* All Products Section - Medium Priority */}
      <AllProducts />

      {/* Brand Section - Now optimized for faster loading */}
      <Brand />

      {/* Benefit Section - Lower Priority */}
      <Benefit />

      {/* FAQ Section - Lower Priority */}
      <Faq />
    </>
  )
})

ClientSideComponents.displayName = 'ClientSideComponents'

export default ClientSideComponents
