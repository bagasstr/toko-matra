'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Client-side dynamic imports with ssr: false
const AllProducts = dynamic(() => import('./AllProducts'), {
  ssr: false,
  loading: () => <AllProductsSkeleton />,
})

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

// Loading skeletons
const AllProductsSkeleton = () => (
  <div className='mb-8'>
    <div className='container mx-auto px-4'>
      <div className='flex items-center justify-between mb-6'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-6 w-24' />
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'>
        {Array.from({ length: 24 }).map((_, i) => (
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
)

const BrandSkeleton = () => (
  <div className='mb-8'>
    <div className='container mx-auto px-4'>
      <Skeleton className='h-8 w-32 mb-6' />
      <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-20 w-full rounded-lg' />
        ))}
      </div>
    </div>
  </div>
)

const ContentSkeleton = () => (
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
)

const ClientSideComponents = () => {
  return (
    <>
      {/* All Products Section - Medium Priority */}
      <AllProducts />

      {/* Brand Section - Lower Priority */}
      <Brand />

      {/* Benefit Section - Lower Priority */}
      <Benefit />

      {/* FAQ Section - Lower Priority */}
      <Faq />
    </>
  )
}

export default ClientSideComponents
