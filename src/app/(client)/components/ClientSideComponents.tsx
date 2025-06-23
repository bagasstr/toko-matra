'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Lazy load non-critical components untuk mengurangi initial bundle
const AllProducts = dynamic(() => import('./AllProducts'), {
  ssr: false,
  loading: () => (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4'>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className='animate-pulse bg-gray-200 h-48 rounded-md' />
      ))}
    </div>
  ),
})

const Brand = dynamic(() => import('./brand'), {
  ssr: false,
  loading: () => (
    <div className='flex gap-4 p-4'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className='animate-pulse bg-gray-200 w-16 h-16 rounded-full'
        />
      ))}
    </div>
  ),
})

const Benefit = dynamic(() => import('./benefit'), {
  ssr: false,
  loading: () => (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-4'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className='animate-pulse bg-gray-200 h-32 rounded-md' />
      ))}
    </div>
  ),
})

const FAQ = dynamic(() => import('./faq'), {
  ssr: false,
  loading: () => (
    <div className='space-y-4 p-4'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='animate-pulse bg-gray-200 h-16 rounded-md' />
      ))}
    </div>
  ),
})

export default function ClientSideComponents() {
  return (
    <>
      {/* All Products Section - Load immediately as it's likely what users want */}
      <Suspense
        fallback={
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4'>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className='animate-pulse bg-gray-200 h-48 rounded-md'
              />
            ))}
          </div>
        }>
        <AllProducts />
      </Suspense>

      {/* Brand Section - Load with higher priority as it's visual */}
      <Suspense
        fallback={
          <div className='flex gap-4 p-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className='animate-pulse bg-gray-200 w-16 h-16 rounded-full'
              />
            ))}
          </div>
        }>
        <Brand />
      </Suspense>

      {/* Benefit Section - Lower priority */}
      <Suspense
        fallback={
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='animate-pulse bg-gray-200 h-32 rounded-md'
              />
            ))}
          </div>
        }>
        <Benefit />
      </Suspense>

      {/* FAQ Section - Lowest priority */}
      <Suspense
        fallback={
          <div className='space-y-4 p-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='animate-pulse bg-gray-200 h-16 rounded-md'
              />
            ))}
          </div>
        }>
        <FAQ />
      </Suspense>
    </>
  )
}
