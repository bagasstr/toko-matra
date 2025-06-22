'use client'

import { Suspense } from 'react'
import Link from 'next/link'

interface BreadcrumbProps {
  slugs: string[]
  isProductDetail: boolean
}

export function Breadcrumb({ slugs, isProductDetail }: BreadcrumbProps) {
  return (
    <nav
      className={`mb-16 ${
        slugs.length === 3 ? 'hidden' : ''
      } text-sm text-gray-500 flex gap-2 items-center`}
      aria-label='Breadcrumb'>
      <Link href='/' className='hover:underline text-primary'>
        home
      </Link>
      <span className='mx-1'>/</span>
      <Link href='/kategori' className='hover:underline text-primary'>
        kategori
      </Link>
      <span className='mx-1'>/</span>
      <Link
        href={`/kategori/${slugs[0]}`}
        className='hover:underline text-primary'>
        {slugs[0]}
      </Link>
      {slugs[1] && (
        <Suspense fallback={<div>Loading...</div>}>
          <span className='mx-1'>/</span>
          <Link
            href={`/kategori/${slugs[0]}/${slugs[1]}`}
            className='hover:underline text-primary'>
            {slugs[1]}
          </Link>
        </Suspense>
      )}
      {slugs[2] && (
        <Suspense fallback={<div>Loading...</div>}>
          <span className='mx-1'>/</span>
          <span className='text-gray-700 font-medium'>{slugs[2]}</span>
        </Suspense>
      )}
    </nav>
  )
}
