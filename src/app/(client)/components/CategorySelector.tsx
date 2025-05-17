'use client'

import React from 'react'
import { Category, CategorySelectorProps } from './types/category'
import { cn } from '@/lib/utils'

interface CategoryTreeProps extends CategorySelectorProps {
  categories: Category[]
  level?: number
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  value,
  onChange,
  level = 0,
}) => {
  return (
    <ul className={cn('list-none', level > 0 && 'ml-4')}>
      {categories.map((category) => (
        <li key={category.id} className='py-1'>
          <button
            type='button'
            onClick={() => onChange(category.id.toString())}
            className={cn(
              'text-left hover:text-primary transition-colors',
              value === category.id.toString() && 'text-primary font-semibold'
            )}>
            {category.name}
          </button>
          {category.children && category.children.length > 0 && (
            <CategoryTree
              categories={category.children}
              value={value}
              onChange={onChange}
              level={level + 1}
            />
          )}
        </li>
      ))}
    </ul>
  )
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
}) => {
  const [categories, setCategories] = React.useState<Category[]>([])

  React.useEffect(() => {
    // TODO: Replace with actual API call
    const mockCategories: Category[] = [
      {
        id: 1,
        name: 'Arsitektural',
        parentId: 0,
        children: [
          {
            id: 4,
            name: 'Bahan Bangunan',
            parentId: 1,
            children: [],
          },
          {
            id: 5,
            name: 'Cat dan Pelapis',
            parentId: 1,
            children: [],
          },
        ],
      },
      {
        id: 2,
        name: 'Struktural',
        parentId: 0,
        children: [
          {
            id: 6,
            name: 'Beton',
            parentId: 2,
            children: [],
          },
          {
            id: 7,
            name: 'Baja',
            parentId: 2,
            children: [],
          },
        ],
      },
      {
        id: 3,
        name: 'Mekanikal, Elektrikal, dan Pipa',
        parentId: 0,
        children: [],
      },
    ]

    setCategories(mockCategories)
  }, [])

  return (
    <div className='w-full max-w-xs'>
      <CategoryTree categories={categories} value={value} onChange={onChange} />
    </div>
  )
}

export default CategorySelector
