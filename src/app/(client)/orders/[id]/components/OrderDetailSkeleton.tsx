import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function OrderDetailSkeleton() {
  return (
    <div className='max-w-6xl mx-auto px-4 py-8 space-y-6'>
      <Skeleton className='h-6 w-48' />
      <Skeleton className='h-8 w-64' />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left column skeleton */}
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-32' />
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex justify-between'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-24' />
              </div>
              <div className='flex justify-between'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-16' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-32' />
            </CardHeader>
            <CardContent>
              <div className='flex gap-4'>
                <Skeleton className='h-16 w-16' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-48' />
                  <Skeleton className='h-3 w-24' />
                </div>
                <Skeleton className='h-4 w-20' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column skeleton */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-40' />
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-32' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-20' />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
