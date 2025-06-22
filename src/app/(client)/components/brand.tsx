'use client'

import React, { useState, useEffect, memo } from 'react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

interface Brand {
  id: string
  name: string
  logo: string
}

const BrandItem = memo(({ brand }: { brand: Brand }) => (
  <div className='group'>
    <div className='flex flex-col items-center gap-2'>
      <Avatar className='w-20 h-20 lg:w-24 lg:h-24 transition-transform duration-300 group-hover:scale-105'>
        <AvatarImage src={brand.logo} alt={brand.name} loading='lazy' />
        <AvatarFallback className='text-xs lg:text-sm'>
          {brand.name.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <p className='text-sm lg:text-xs xl:text-sm text-center font-medium text-foreground/80 group-hover:text-primary transition-colors line-clamp-2'>
        {brand.name}
      </p>
    </div>
  </div>
))

BrandItem.displayName = 'BrandItem'

const Brand = memo(() => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands', {
          // Add cache headers for better performance
          headers: {
            'Cache-Control': 'public, max-age=300', // 5 minutes cache
          },
        })
        if (response.ok) {
          const data = await response.json()
          setBrands(data.brands || [])
        }
      } catch (error) {
        console.error('Error fetching brands:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  if (loading) {
    return (
      <section className=''>
        <div className='container mx-auto px-4'>
          <div className='my-6 flex items-center justify-between'>
            <Skeleton className='h-8 w-32' />
          </div>

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
      </section>
    )
  }

  if (!brands.length) {
    return null
  }

  return (
    <section className=''>
      <div className='container mx-auto px-4'>
        <div className='my-6 flex items-center justify-between'>
          <h2 className='text-lg sm:text-xl lg:text-2xl text-foreground/85 font-bold'>
            Brand Populer
          </h2>
        </div>

        {/* Mobile Carousel */}
        <div className='lg:hidden overflow-x-auto scrollbar-hide'>
          <div className='flex gap-3 py-2 w-full'>
            {brands.map((brand) => (
              <div key={brand.id} className='w-[120px] flex-shrink-0'>
                <BrandItem brand={brand} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className='hidden lg:grid grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4'>
          {brands.map((brand) => (
            <BrandItem key={brand.id} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  )
})

Brand.displayName = 'Brand'

export default Brand
