import React from 'react'
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

import { validateSession } from '../actions/session'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import {
  AllProductsSkeleton,
  BrandSkeleton,
  CategorySkeleton,
  ContentSkeleton,
  FeaturedProductsSkeleton,
} from './components/Skeletons'

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
