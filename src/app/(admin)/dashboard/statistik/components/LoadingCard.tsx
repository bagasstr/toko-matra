'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface LoadingCardProps {
  title?: string
  showChart?: boolean
  rows?: number
}

export default function LoadingCard({
  title = 'Loading...',
  showChart = false,
  rows = 3,
}: LoadingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className='h-5 w-32' />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showChart ? (
          <div className='h-40 flex items-end justify-between space-x-2'>
            {[80, 120, 60, 140, 100, 90, 130].map((height, i) => (
              <Skeleton
                key={i}
                className='w-full bg-gradient-to-t from-gray-300 to-gray-200 rounded-t'
                style={{ height: `${height}px` }}
              />
            ))}
          </div>
        ) : (
          <div className='space-y-3'>
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className='flex justify-between items-center'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-12' />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
