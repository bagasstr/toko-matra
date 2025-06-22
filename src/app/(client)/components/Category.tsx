'use client'

import {
  getParentCategories,
  getTreeCategories,
} from '@/app/actions/categoryAction'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'
import OptimizedImage from '@/components/OptimizedImage'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'

interface IDataCategories {
  id: string
  name: string
  imageUrl: string | null
  slug: string
}

const CategorySkeleton = () => {
  return (
    <>
      {/* Mobile Skeleton */}
      <div className='lg:hidden overflow-x-auto scrollbar-hide'>
        <div className='flex gap-3 py-2 w-full'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='w-[120px] flex-shrink-0'>
              <Card className='flex flex-col items-stretch justify-between p-2 h-full'>
                <div className='relative w-full aspect-square'>
                  <Skeleton className='w-full h-full' />
                </div>
                <CardFooter className='p-0 pt-1 flex justify-center items-center'>
                  <Skeleton className='h-4 w-20' />
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Skeleton */}
      <div className='hidden lg:grid grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4'>
        {[...Array(8)].map((_, i) => (
          <div key={i}>
            <Card className='flex flex-col items-stretch justify-between p-3 md:p-4 h-full'>
              <div className='relative w-full aspect-square'>
                <Skeleton className='w-full h-full' />
              </div>
              <CardFooter className='p-0 pt-2 flex justify-center items-center'>
                <Skeleton className='h-4 w-20' />
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </>
  )
}

const Category = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { categorie, error } = await getParentCategories()
      if (error) throw error
      return categorie
    },
  })

  return (
    <section className=''>
      <div className='container mx-auto px-4'>
        <div className='my-6 flex items-center justify-between'>
          <h2 className='text-lg sm:text-xl lg:text-2xl text-foreground/85 font-bold'>
            Kategori
          </h2>
          <Link
            href='/kategori'
            className='flex items-center gap-1 text-primary hover:text-primary/80 transition-colors'>
            <span className='text-sm md:text-base lg:text-xl'>Lihat Semua</span>
            <ChevronRight size={16} className='sm:w-[18px] sm:h-[18px]' />
          </Link>
        </div>

        {isLoading ? (
          <CategorySkeleton />
        ) : (
          <>
            {/* Mobile Carousel */}
            <div className='lg:hidden overflow-x-auto scrollbar-hide'>
              <div className='flex gap-3 py-2 w-full'>
                {categories
                  .filter((cat: IDataCategories) => cat.imageUrl)
                  .map((category: IDataCategories) => (
                    <Link
                      href={`/kategori/${category.slug}`}
                      key={category.id}
                      className='group w-[120px] flex-shrink-0'>
                      <Card className='flex flex-col items-stretch justify-between p-2 h-full transition-all duration-300 hover:shadow-md hover:border-primary/20'>
                        <div className='relative w-full aspect-square'>
                          {category.imageUrl ? (
                            <OptimizedImage
                              src={category.imageUrl}
                              alt={category.name}
                              width={120}
                              height={120}
                              className='w-full h-full object-contain p-0 transition-transform duration-300 group-hover:scale-105'
                              sizes='120px'
                              priority={false}
                            />
                          ) : (
                            <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
                              <span className='text-gray-400 text-xs'>
                                No Image
                              </span>
                            </div>
                          )}
                        </div>
                        <CardFooter className='p-0 pt-1 flex justify-center items-center'>
                          <p className='text-sm text-center font-medium text-foreground/80 group-hover:text-primary transition-colors line-clamp-2'>
                            {category.name}
                          </p>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
              </div>
            </div>

            {/* Desktop Grid */}
            <div className='hidden lg:grid grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4'>
              {categories
                .filter((cat: IDataCategories) => cat.imageUrl)
                .map((category: IDataCategories) => (
                  <Link
                    href={`/kategori/${category.slug}`}
                    key={category.id}
                    className='group'>
                    <Card className='flex flex-col items-stretch justify-between p-3 md:p-4 h-full transition-all duration-300 hover:shadow-md hover:border-primary/20'>
                      <div className='relative w-full aspect-square'>
                        <OptimizedImage
                          src={category.imageUrl}
                          alt={category.name}
                          width={150}
                          height={150}
                          className='w-full h-full object-contain p-0 transition-transform duration-300 group-hover:scale-105'
                          sizes='(max-width: 1024px) 25vw, (max-width: 1280px) 16vw, 12vw'
                          priority={false}
                        />
                      </div>
                      <CardFooter className='p-0 pt-2 flex justify-center items-center'>
                        <p className='text-xs md:text-sm text-center font-medium text-foreground/80 group-hover:text-primary transition-colors line-clamp-2'>
                          {category.name}
                        </p>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
export default Category
