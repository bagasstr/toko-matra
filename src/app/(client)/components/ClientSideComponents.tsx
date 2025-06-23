'use client'

import dynamic from 'next/dynamic'
import { memo } from 'react'
import {
  AllProductsSkeleton,
  BrandSkeleton,
  ContentSkeleton,
} from './Skeletons'

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
