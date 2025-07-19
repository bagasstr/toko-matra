'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function StatistikSkeleton() {
  return (
    <div className='container mx-auto py-8 px-4'>
      {/* Header */}
      <div className='mb-8'>
        <Skeleton className='h-8 w-48 mb-2' />
        <Skeleton className='h-4 w-96' />
      </div>

      {/* Stats Cards */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                <Skeleton className='h-4 w-24' />
              </CardTitle>
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-7 w-16 mb-1' />
              <Skeleton className='h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Tables Section */}
      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Sales Chart */}
        <Card>
          <CardHeader className='flex justify-between items-center'>
            <CardTitle>
              <Skeleton className='h-5 w-32' />
            </CardTitle>
            <Skeleton className='h-9 w-24' />
          </CardHeader>
          <CardContent>
            <div className='h-80 flex items-end justify-between px-4 pb-4 space-x-2'>
              {[120, 180, 100, 220, 160, 140, 200].map((height, i) => (
                <div
                  key={i}
                  className='flex flex-col items-center space-y-2 flex-1'>
                  <Skeleton
                    className='w-full bg-gradient-to-t from-gray-300 to-gray-200 rounded-t animate-pulse'
                    style={{ height: `${height}px` }}
                  />
                  <Skeleton className='h-3 w-8' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Best Selling Products */}
        <Card>
          <CardHeader className='flex justify-between items-center'>
            <CardTitle>
              <Skeleton className='h-5 w-36' />
            </CardTitle>
            <Skeleton className='h-9 w-24' />
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {/* Table Header */}
              <div className='grid grid-cols-4 gap-4 py-2 border-b'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-12' />
                <Skeleton className='h-4 w-10' />
              </div>

              {/* Table Rows */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='grid grid-cols-4 gap-4 py-3'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-8' />
                  <Skeleton className='h-4 w-16' />
                  <Skeleton className='h-4 w-12' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Section */}
      <div className='grid gap-6 md:grid-cols-3 mt-8'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>
                <Skeleton className='h-5 w-32' />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-12' />
                </div>
                <div className='flex justify-between items-center'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-4 w-16' />
                </div>
                <div className='flex justify-between items-center'>
                  <Skeleton className='h-4 w-28' />
                  <Skeleton className='h-4 w-10' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
