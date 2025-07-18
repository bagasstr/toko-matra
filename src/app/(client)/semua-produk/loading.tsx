import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-6'>
        {/* Breadcrumb Skeleton */}
        <div className='mb-4'>
          <Skeleton className='h-4 w-48' />
        </div>

        {/* Header Skeleton */}
        <div className='mb-8'>
          <Skeleton className='h-8 w-64 mb-2' />
          <Skeleton className='h-4 w-96' />
        </div>

        {/* Search and Filters Skeleton */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='space-y-4'>
              {/* Search Bar Skeleton */}
              <Skeleton className='h-12 w-full' />

              {/* Mobile Filters Toggle Skeleton */}
              <div className='md:hidden'>
                <Skeleton className='h-10 w-full' />
              </div>

              {/* Filters Row Skeleton */}
              <div className='hidden md:flex md:flex-row gap-4 justify-between items-center'>
                <div className='flex flex-row gap-4 flex-1'>
                  <Skeleton className='h-10 w-48' />
                  <Skeleton className='h-10 w-48' />
                  <Skeleton className='h-10 w-48' />
                  <Skeleton className='h-10 w-32' />
                </div>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-8 w-8' />
                  <Skeleton className='h-8 w-8' />
                </div>
              </div>

              {/* Active Filters Skeleton */}
              <div className='flex flex-wrap gap-2'>
                <Skeleton className='h-6 w-24' />
                <Skeleton className='h-6 w-32' />
                <Skeleton className='h-6 w-28' />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count Skeleton */}
        <div className='flex justify-between items-center mb-6'>
          <Skeleton className='h-4 w-48' />
        </div>

        {/* Products Grid Skeleton */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 auto-rows-fr mb-8'>
          {Array.from({ length: 24 }).map((_, index) => (
            <Card key={index} className='overflow-hidden'>
              <CardContent className='p-0'>
                <Skeleton className='w-full aspect-square' />
                <div className='p-4 space-y-2'>
                  <Skeleton className='h-3 w-1/2' />
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-5 w-1/2' />
                  <div className='flex justify-between items-center mt-3'>
                    <Skeleton className='h-4 w-1/3' />
                    <Skeleton className='h-8 w-20' />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className='flex justify-center'>
          <div className='flex items-center space-x-2'>
            <Skeleton className='h-8 w-8' />
            <Skeleton className='h-8 w-8' />
            <Skeleton className='h-8 w-8' />
            <Skeleton className='h-8 w-8' />
            <Skeleton className='h-8 w-8' />
          </div>
        </div>
      </div>
    </div>
  )
}
