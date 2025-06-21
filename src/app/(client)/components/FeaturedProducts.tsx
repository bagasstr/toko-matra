'use client'

import { getAllCategories } from '@/app/actions/categoryAction'
import { getAllProducts } from '@/app/actions/productAction'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'

interface IDataProducts {
  id: string
  name: string
  images: string[]
  price: number
  isActive: boolean
  label: string
  isFeatured: boolean
  category: {
    name: string
    parentId: string
    slug: string
  }
  brand: {
    name: string
    id: string
    createdAt: Date
    updatedAt: Date
    slug: string
    logo: string
  }
  stock: number
  description: string
  slug: string
}

interface IDataCategories {
  id: string
  name: string
  slug: string
  parentId: string | null
}

const FeaturedProductsSkeleton = () => {
  return (
    <>
      {/* Mobile Skeleton */}
      <div className='lg:hidden overflow-x-auto scrollbar-hide'>
        <div className='flex gap-3 py-2 w-full'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='w-[160px] flex-shrink-0'>
              <Card className='flex flex-col items-stretch justify-between p-2 h-full'>
                <div className='relative w-full aspect-[3/2]'>
                  <Skeleton className='w-full h-full' />
                </div>
                <div className='flex-1 flex flex-col p-2'>
                  <Skeleton className='h-3 w-16 mb-1' />
                  <Skeleton className='h-4 w-full mb-1' />
                  <Skeleton className='h-4 w-24 mt-auto' />
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Skeleton */}
      <div className='hidden lg:grid grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6'>
        {[...Array(6)].map((_, i) => (
          <div key={i}>
            <Card className='flex flex-col items-stretch justify-between p-3 md:p-4 h-full'>
              <div className='relative w-full aspect-[3/2]'>
                <Skeleton className='w-full h-full' />
              </div>
              <div className='flex-1 flex flex-col p-3'>
                <Skeleton className='h-4 w-20 mb-1' />
                <Skeleton className='h-5 w-full mb-1' />
                <Skeleton className='h-6 w-32 mt-auto' />
              </div>
            </Card>
          </div>
        ))}
      </div>
    </>
  )
}

const FeaturedProducts = () => {
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['productsFeatured'],
    queryFn: async () => {
      const { products, error } = await getAllProducts()
      if (error) throw error
      return products
    },
  })

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categoriesProducts'],
    queryFn: async () => {
      const { categorie, error } = await getAllCategories()
      if (error) throw error
      return categorie
    },
  })

  const featuredProducts = products.filter(
    (product) => product.isActive && product.isFeatured
  )

  const isLoading = isLoadingProducts || isLoadingCategories
  console.log(featuredProducts)

  return (
    <section className=''>
      <div className='container mx-auto px-4'>
        <div className='my-6 flex items-center justify-between'>
          <h2 className='text-lg sm:text-xl lg:text-2xl text-foreground/85 font-bold'>
            Produk Unggulan
          </h2>
        </div>

        {isLoading ? (
          <FeaturedProductsSkeleton />
        ) : (
          <>
            {/* Mobile Carousel */}
            <div className='lg:hidden overflow-x-auto scrollbar-hide'>
              <div className='flex gap-3 py-2 w-full'>
                {featuredProducts.map((product: IDataProducts) => {
                  const parentCategory = categories.find(
                    (cat) => cat.id === product.category.parentId
                  )
                  // Skip rendering if parentCategory is not found
                  if (!parentCategory) return null

                  return (
                    <Link
                      key={product.id}
                      href={`/kategori/${parentCategory.slug}/${product.category.slug}/${product.slug}`}
                      className='group w-[160px] flex-shrink-0'>
                      <Card className='flex flex-col items-stretch justify-between p-2 h-full transition-all duration-300 hover:shadow-md hover:border-primary/20'>
                        <div className='relative w-full aspect-[3/2]'>
                          {product.label && (
                            <Badge className='absolute top-2 left-2 z-10'>
                              {product.label}
                            </Badge>
                          )}
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className='object-contain p-2'
                            sizes='160px'
                          />
                        </div>
                        <div className='flex-1 flex flex-col p-2'>
                          <div className='text-xs text-gray-400 mb-1'>
                            {product.brand === null
                              ? 'No Brand'
                              : product.brand.name}
                          </div>
                          <div className='font-semibold text-sm line-clamp-2 min-h-[40px] mb-1 text-gray-900'>
                            {product.name}
                          </div>
                          <div className='font-bold text-sm mt-auto'>
                            Rp {product.price.toLocaleString('id-ID')}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Desktop Grid */}
            <div className='hidden lg:grid grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6'>
              {featuredProducts.map((product: IDataProducts) => {
                const parentCategory = categories.find(
                  (cat) => cat.id === product.category.parentId
                )
                // Skip rendering if parentCategory is not found
                if (!parentCategory) return null

                return (
                  <Link
                    key={product.id}
                    href={`/kategori/${parentCategory.slug}/${product.category.slug}/${product.slug}`}
                    className='group'>
                    <Card className='flex flex-col items-stretch justify-between p-3 md:p-4 h-full transition-all duration-300 hover:shadow-md hover:border-primary/20'>
                      <div className='relative w-full aspect-[3/2]'>
                        {product.label && (
                          <Badge className='absolute top-2 left-2 z-10'>
                            {product.label}
                          </Badge>
                        )}
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className='object-contain p-3'
                          sizes='(max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw'
                        />
                      </div>
                      <div className='flex-1 flex flex-col p-3'>
                        <div className='text-sm text-gray-400 mb-1'>
                          {product.brand === null
                            ? 'No Brand'
                            : product.brand.name}
                        </div>
                        <div className='font-semibold text-base line-clamp-2 min-h-[48px] mb-1 text-gray-900'>
                          {product.name}
                        </div>
                        <div className='font-bold text-lg mt-auto'>
                          Rp {product.price.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default FeaturedProducts
