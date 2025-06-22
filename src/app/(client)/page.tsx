import React, { Suspense } from 'react'
import { cn } from '@/lib/utils'
import Category from './components/Category'
import FeaturedProducts from './components/FeaturedProducts'
import AllProducts from './components/AllProducts'
import Brand from './components/brand'
import Benefit from './components/benefit'
import Faq from './components/faq'
import MaterialsOffer from './components/materialsOffer'
import FooterMobile from './components/footerMobile'
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
  const session = await validateSession()
  let isProfileComplete = true

  if (session) {
    try {
      const profileRes = await getProfile(session.user.id)
      isProfileComplete = !!profileRes.data?.phoneNumber
    } catch (error) {
      console.error('Error fetching profile:', error)
      isProfileComplete = false
    }
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
      <Suspense fallback={<CategorySkeleton />}>
        <Category />
      </Suspense>

      {/* Featured Products Section - High Priority */}
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>

      {/* All Products Section - Medium Priority */}
      <Suspense fallback={<AllProductsSkeleton />}>
        <AllProducts />
      </Suspense>

      {/* Brand Section - Lower Priority */}
      <Suspense fallback={<BrandSkeleton />}>
        <Brand />
      </Suspense>

      {/* Benefit Section - Lower Priority */}
      <Suspense fallback={<ContentSkeleton />}>
        <Benefit />
      </Suspense>

      {/* FAQ Section - Lower Priority */}
      <Suspense fallback={<ContentSkeleton />}>
        <Faq />
      </Suspense>

      {/* Optional sections - commented out for performance */}
      {/* <MaterialsOffer /> */}
      {/* <FooterMobile /> */}
    </div>
  )
}

export default Home
