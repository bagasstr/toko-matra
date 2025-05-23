'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { getAllCategories } from '@/app/actions/categoryAction'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'

interface Category {
  id: string
  name: string
  slug: string
  label?: string
}

interface GroupedCategories {
  arsitektural?: Category[]
  struktural?: Category[]
  mep?: Category[]
  other?: Category[]
}

const categoryGroups = {
  arsitektural: ['Cat', 'Keramik', 'Pintu', 'Jendela', 'Lantai', 'Dinding'],
  struktural: ['Beton', 'Baja', 'Bata', 'Semen', 'Pasir', 'Batu'],
  mep: ['Pipa', 'Listrik', 'Sanitasi', 'AC', 'Ventilasi', 'Pompa'],
}

export function CategoryDropdown() {
  const [isOpen, setIsOpen] = useState(false)

  // Fetch categories using React Query
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { categorie, success, error } = await getAllCategories()
      if (!success) {
        console.log(error)
        return []
      }
      return categorie
    },
  })

  // Group categories based on predefined groups
  const groupedCategories = categories.reduce<GroupedCategories>(
    (acc, category) => {
      const group =
        Object.keys(categoryGroups).find((group) =>
          categoryGroups[group].some((name) =>
            category.name.toLowerCase().includes(name.toLowerCase())
          )
        ) || 'other'

      if (!acc[group]) {
        acc[group] = []
      }
      acc[group]?.push(category)
      return acc
    },
    {}
  )

  return (
    <div
      className='relative'
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}>
      <Link
        href='/kategori'
        className='flex items-center gap-1 text-foreground hover:text-primary transition-colors font-medium'>
        Kategori
        <ChevronDown className='w-4 h-4' />
      </Link>

      {isOpen && (
        <div className='absolute top-full left-0 w-[600px] bg-white shadow-lg rounded-lg p-4 z-50 mt-2'>
          <div className='grid grid-cols-3 gap-6'>
            {/* Arsitektural */}
            <div>
              <h3 className='font-semibold text-lg mb-3 text-primary'>
                Arsitektural
              </h3>
              <ul className='space-y-2'>
                {groupedCategories.arsitektural?.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/kategori/${category.slug}`}
                      className='text-sm text-gray-600 hover:text-primary transition-colors block py-1'>
                      <div className='flex items-center justify-between'>
                        <span>{category.name}</span>
                        {category.label && (
                          <Badge variant='secondary' className='ml-2 text-xs'>
                            {category.label}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Struktural */}
            <div>
              <h3 className='font-semibold text-lg mb-3 text-primary'>
                Struktural
              </h3>
              <ul className='space-y-2'>
                {groupedCategories.struktural?.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/kategori/${category.slug}`}
                      className='text-sm text-gray-600 hover:text-primary transition-colors block py-1'>
                      <div className='flex items-center justify-between'>
                        <span>{category.name}</span>
                        {category.label && (
                          <Badge variant='secondary' className='ml-2 text-xs'>
                            {category.label}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* MEP */}
            <div>
              <h3 className='font-semibold text-lg mb-3 text-primary'>MEP</h3>
              <ul className='space-y-2'>
                {groupedCategories.mep?.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/kategori/${category.slug}`}
                      className='text-sm text-gray-600 hover:text-primary transition-colors block py-1'>
                      <div className='flex items-center justify-between'>
                        <span>{category.name}</span>
                        {category.label && (
                          <Badge variant='secondary' className='ml-2 text-xs'>
                            {category.label}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
