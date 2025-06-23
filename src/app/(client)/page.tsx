import React, { Suspense } from 'react'
import { cn } from '@/lib/utils'

// Server components (no dynamic needed)
import Category from './components/Category'
import FeaturedProducts from './components/FeaturedProducts'

// Skeletons for Suspense fallback
import {
  CategorySkeleton,
  FeaturedProductsSkeleton,
} from './components/Skeletons'

// Client-only bundle untuk komponen besar non-kritis
import { validateSession } from '../actions/session'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

// Wrapper client component untuk memuat bundel besar hanya di client
import ClientComponentsWrapper from './components/ClientSideComponentsWrapper'

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

      {/* Category Section - High Priority (wrapped in Suspense) */}
      <Suspense fallback={<CategorySkeleton />}>
        <Category />
      </Suspense>

      {/* Featured Products Section - High Priority (wrapped in Suspense) */}
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>

      {/* Client-side components - All Products, Brand, Benefit, FAQ */}
      <ClientComponentsWrapper />

      {/* Optional sections - commented out for performance */}
      {/* <MaterialsOffer /> */}
      {/* <FooterMobile /> */}
    </div>
  )
}

export default Home
