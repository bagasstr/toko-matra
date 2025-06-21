import React, { Suspense } from 'react'
import { cn } from '@/lib/utils'
import Category from './components/Category'
import FeaturedProducts from './components/FeaturedProducts'
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

const Home = async () => {
  const session = await validateSession()
  let isProfileComplete

  if (session) {
    const profileRes = await getProfile(session.user.id)
    isProfileComplete = profileRes.data.phoneNumber
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

      <Suspense fallback={<div>Loading...</div>}>
        <Category />
        <FeaturedProducts />
      </Suspense>
      <Brand />
      <Benefit />
      <Faq />
      {/* <MaterialsOffer /> */}
      {/* <FooterMobile /> */}
    </div>
  )
}

export default Home
