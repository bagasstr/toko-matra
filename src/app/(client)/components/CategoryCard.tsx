'use client'

import { memo } from 'react'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'

interface CategoryCardProps {
  category: {
    id: string
    name: string
    imageUrl: string | null
    slug: string
  }
  index?: number
  priority?: boolean
}

export const CategoryCard = memo(
  ({ category, index = 0, priority = false }: CategoryCardProps) => (
    <Link
      href={`/kategori/${category.slug}`}
      className='group bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 hover:border-primary/20 block'>
      <div className='relative w-full aspect-square bg-gray-50'>
        {category.imageUrl ? (
          <OptimizedImage
            src={category.imageUrl}
            alt={category.name}
            width={100}
            height={100}
            priority={priority || index < 4}
            quality={70}
            className='w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200'
            sizes='(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 12.5vw'
            fallback='/assets/categories/default.png'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200'>
            <span className='text-lg font-bold text-gray-400'>
              {category.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className='p-2'>
        <h3 className='text-xs font-medium text-gray-900 text-center line-clamp-2 group-hover:text-primary transition-colors duration-200'>
          {category.name}
        </h3>
      </div>
    </Link>
  )
)

CategoryCard.displayName = 'CategoryCard'
