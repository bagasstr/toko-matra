'use client'

import Link from 'next/link'
import Image from 'next/image'
import { redirect, usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { headers } from 'next/headers'
import { getAllCategories } from '@/app/actions/categoryAction'
import { getAllProducts } from '@/app/actions/productAction'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'

const Breadcrumb = () => {
  return (
    <div className='flex items-center mb-6'>
      <nav
        className='text-sm text-gray-500 flex gap-2 items-center'
        aria-label='Breadcrumb'>
        <Link href='/' className='hover:underline text-primary'>
          Home
        </Link>
        <span className='mx-1'>/</span>
        <span className='text-gray-700 font-medium'>kategori</span>
      </nav>
    </div>
  )
}

const CategoryCard = ({ category }) => {
  const allSlugs = [...(category.children?.map((child) => child.slug) || [])]

  return (
    <Link
      key={category.id}
      href={`/kategori/${category.slug}`}
      className='group block border rounded-xl bg-white shadow-sm hover:shadow-md transition overflow-hidden p-4 text-center'>
      {category && (
        <div className='flex justify-center mb-3'>
          <Image
            src={category.imageUrl}
            alt={category.name}
            width={60}
            height={60}
            className='object-contain'
          />
        </div>
      )}
      <div className='font-semibold text-lg mb-1 group-hover:text-primary transition'>
        {category.name}
      </div>
      <Badge>{allSlugs.length} kategori</Badge>
    </Link>
  )
}

const CategorySkeleton = () => {
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className='block border rounded-xl bg-white shadow-sm overflow-hidden p-4 text-center'>
          <div className='flex justify-center mb-3'>
            <Skeleton className='w-[60px] h-[60px] rounded-full' />
          </div>
          <Skeleton className='h-6 w-32 mx-auto mb-1' />
          <Skeleton className='h-5 w-20 mx-auto' />
        </div>
      ))}
    </div>
  )
}

const page = () => {
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { categorie, error } = await getAllCategories()
      if (error) throw error
      return categorie
    },
  })

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { products, error } = await getAllProducts()
      if (error) throw error
      return products
    },
  })

  const isLoading = isLoadingCategories || isLoadingProducts

  return (
    <div className=''>
      <Breadcrumb />
      <h1 className='text-2xl font-bold mb-6'>Semua Kategori</h1>
      {isLoading ? (
        <CategorySkeleton />
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </div>
  )
}

export default page
