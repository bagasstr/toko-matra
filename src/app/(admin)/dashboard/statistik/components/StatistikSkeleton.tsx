'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function StatistikSkeleton() {
  // Static heights to avoid hydration mismatch from Math.random()
  const chartHeights = [120, 180, 100, 220, 160, 140, 200]

  return (
    <div className='p-6 space-y-6 animate-pulse'>
      {/* Header */}
      <Skeleton className='h-8 w-48' />

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-16 mb-2' />
              <Skeleton className='h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {/* Sales Chart */}
        <Card>
          <CardHeader className='flex justify-between items-center'>
            <Skeleton className='h-6 w-36' />
            <Skeleton className='h-9 w-28' />
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {/* Simulated chart bars */}
              <div className='flex items-end space-x-2 h-64'>
                {chartHeights.map((height, index) => (
                  <div key={index} className='flex-1 flex flex-col justify-end'>
                    <Skeleton
                      className='w-full mb-1'
                      style={{ height: `${height}px` }}
                    />
                    <Skeleton className='h-3 w-full' />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Products */}
        <Card>
          <CardHeader className='flex justify-between items-center'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-9 w-28' />
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className='flex justify-between items-center'>
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-40' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                  <div className='text-right space-y-2'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-3 w-16' />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
