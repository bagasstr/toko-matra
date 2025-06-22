import React, { Suspense } from 'react'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

// Dynamic imports untuk performance yang lebih baik
const Category = dynamic(() => import('./components/Category'), {
  ssr: true,
  loading: () => <CategorySkeleton />,
})

const FeaturedProducts = dynamic(
  () => import('./components/FeaturedProducts'),
  {
    ssr: true,
    loading: () => <FeaturedProductsSkeleton />,
  }
)

// Client-side components wrapper
const ClientSideComponents = dynamic(
  () => import('./components/ClientSideComponents'),
  {
    loading: () => (
      <div>
        <AllProductsSkeleton />
        <BrandSkeleton />
        <ContentSkeleton />
        <ContentSkeleton />
      </div>
    ),
  }
)

import { getOrderById } from '../actions/orderAction'
import { redirect } from 'next/navigation'
import { validateSession } from '../actions/session'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getUser } from '../actions/profileAction'
import { getProfile } from '../actions/profile'
import { Skeleton } from '@/components/ui/skeleton'

// Loading components for better UX
const CategorySkeleton = () => (
  <div className='mb-8'>
    <div className='container mx-auto px-4'>
      <Skeleton className='h-8 w-48 mb-6' />
      <div className='grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4'>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className='flex flex-col items-center'>
            <Skeleton className='w-16 h-16 rounded-full mb-2' />
            <Skeleton className='h-3 w-12' />
          </div>
        ))}
      </div>
    </div>
  </div>
)

const FeaturedProductsSkeleton = () => (
  <div className='mb-8'>
    <div className='container mx-auto px-4'>
      <div className='flex items-center justify-between mb-6'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-6 w-24' />
      </div>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
        {Array.from({ length: 10 }).map((_, i) => (
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
)

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

// Error Boundary component
const ErrorFallback = ({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback: React.ReactNode
}) => {
  return (
    <div className='min-h-[200px] flex items-center justify-center'>
      {fallback}
    </div>
  )
}

const Home = async () => {
  // Optimisasi: Paralel async calls dan graceful degradation
  let session = null
  let isProfileComplete = true

  try {
    session = await validateSession()

    // Skip profile check untuk performance - dapat dilakukan di client
    // if (session) {
    //   const profileRes = await getProfile(session.user.id)
    //   isProfileComplete = !!profileRes.data?.phoneNumber
    // }
  } catch (error) {
    // Graceful degradation jika ada error
    console.error('Error validating session:', error)
    session = null
  }

  return (
    <div className={cn('px-4')}>
      {session && !isProfileComplete && (
        <Alert variant='destructive' className='mb-4'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Lengkapi Profil Anda</AlertTitle>
          <AlertDescription>
            Silakan lengkapi data pribadi Anda untuk menggunakan semua fitur.{' '}
            <Link
              href={{
                pathname: '/profile',
                query: {
                  user: session.user.id,
                },
              }}
              className='underline'>
              Lengkapi Profil
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Category Section - High Priority */}
      <Category />

      {/* Featured Products Section - High Priority */}
      <FeaturedProducts />

      {/* Client-side components - All Products, Brand, Benefit, FAQ */}
      <ClientSideComponents />

      {/* Optional sections - commented out for performance */}
      {/* <MaterialsOffer /> */}
      {/* <FooterMobile /> */}
    </div>
  )
}

export default Home
