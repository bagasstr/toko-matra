'use client'

import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search } from 'lucide-react'
import { headers } from 'next/headers'
import { getTreeCategories } from '@/app/actions/categoryAction'
import { getAllProducts } from '@/app/actions/productAction'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { useMemo, Suspense } from 'react'

const Breadcrumb = ({ searchQuery = '' }) => {
  return (
    <div className='flex items-center mb-16'>
      <nav
        className='text-sm text-gray-500 flex gap-2 items-center'
        aria-label='Breadcrumb'>
        <Link href='/' className='hover:underline text-primary'>
          Home
        </Link>
        <span className='mx-1'>/</span>
        {searchQuery ? (
          <>
            <Link href='/kategori' className='hover:underline text-primary'>
              Kategori
            </Link>
            <span className='mx-1'>/</span>
            <span className='text-gray-700 font-medium'>
              Hasil pencarian: "{searchQuery}"
            </span>
          </>
        ) : (
          <span className='text-gray-700 font-medium'>kategori</span>
        )}
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
          <OptimizedImage
            src={category.imageUrl}
            alt={category.name}
            width={60}
            height={60}
            className='object-contain'
            priority={false}
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

const ProductCard = ({ product }) => {
  // Build proper category URL based on parent-child relationship
  const getCategoryUrl = () => {
    if (product.category?.parent) {
      // If has parent category, build parent/child/product structure
      return `/kategori/${product.category.parent.slug}/${product.category.slug}/${product.slug}`
    } else {
      // If no parent, use direct category/product structure
      return `/kategori/${product.category?.slug}/${product.slug}`
    }
  }

  return (
    <Link
      href={getCategoryUrl()}
      className='group block border rounded-xl bg-white shadow-sm hover:shadow-md transition overflow-hidden'>
      <div className='p-4'>
        <div className='aspect-square relative mb-3 bg-gray-50 rounded-lg overflow-hidden'>
          <OptimizedImage
            src={product.images?.[0]?.url || '/default-product.png'}
            alt={product.name}
            fill
            className='object-contain group-hover:scale-105 transition-transform duration-300'
            priority={false}
          />
        </div>
        <div className='space-y-2'>
          <h3 className='font-semibold text-sm group-hover:text-primary transition line-clamp-2'>
            {product.name}
          </h3>
          <div className='flex items-center justify-between'>
            <span className='text-lg font-bold text-primary'>
              Rp {product.price?.toLocaleString('id-ID')}
            </span>
            <Badge variant='secondary' className='text-xs'>
              {product.category?.name}
            </Badge>
          </div>
          <div className='text-xs text-gray-500'>
            Min: {product.minOrder} {product.unit}
          </div>
        </div>
      </div>
    </Link>
  )
}

const SearchResults = ({ products, searchQuery, isLoading }) => {
  if (isLoading) {
    return (
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className='block border rounded-xl bg-white shadow-sm overflow-hidden'>
            <div className='p-4'>
              <Skeleton className='aspect-square mb-3 rounded-lg' />
              <Skeleton className='h-4 w-full mb-2' />
              <Skeleton className='h-6 w-24 mb-1' />
              <Skeleton className='h-3 w-16' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className='text-center py-12'>
        <Search size={48} className='mx-auto text-gray-400 mb-4' />
        <h3 className='text-lg font-semibold text-gray-700 mb-2'>
          Tidak ada produk ditemukan
        </h3>
        <p className='text-gray-500'>
          Coba gunakan kata kunci yang berbeda untuk pencarian "{searchQuery}"
        </p>
        <Link href='/kategori'>
          <Button variant='outline' className='mt-4'>
            Lihat Semua Kategori
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='text-sm text-gray-600'>
        Menampilkan {products.length} produk untuk "{searchQuery}"
      </div>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

const CategoryPageContent = () => {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categoriesTree'],
    queryFn: async () => {
      const { treeCategories, error } = await getTreeCategories()
      if (error) throw error
      // Return hanya parent categories dengan data children
      return treeCategories || []
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

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery || !products.length) return []

    const query = searchQuery.toLowerCase()
    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.name?.toLowerCase().includes(query) ||
        product.brand?.name?.toLowerCase().includes(query)
      )
    })
  }, [products, searchQuery])

  const isLoading = isLoadingCategories || isLoadingProducts

  return (
    <div className=''>
      <Breadcrumb searchQuery={searchQuery} />

      {searchQuery ? (
        <>
          <h1 className='text-2xl font-bold mb-6'>Hasil Pencarian</h1>
          <SearchResults
            products={filteredProducts}
            searchQuery={searchQuery}
            isLoading={isLoading}
          />
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}

const page = () => {
  return (
    <Suspense
      fallback={
        <div className=''>
          <div className='flex items-center mb-16'>
            <div className='h-4 w-48 bg-gray-200 rounded animate-pulse'></div>
          </div>
          <div className='h-8 w-64 bg-gray-200 rounded animate-pulse mb-6'></div>
          <CategorySkeleton />
        </div>
      }>
      <CategoryPageContent />
    </Suspense>
  )
}

export default page
