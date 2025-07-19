'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'

interface LoadingCardProps {
  title?: string
  description?: string
  variant?: 'skeleton' | 'spinner'
}

export default function LoadingCard({
  title = 'Memuat data...',
  description = 'Mohon tunggu sebentar',
  variant = 'skeleton',
}: LoadingCardProps) {
  if (variant === 'spinner') {
    return (
      <Card className='h-32 flex items-center justify-center'>
        <CardContent className='flex flex-col items-center space-y-2 p-6'>
          <Loader2 className='h-6 w-6 animate-spin text-primary' />
          <p className='text-sm text-muted-foreground'>{title}</p>
          {description && (
            <p className='text-xs text-muted-foreground'>{description}</p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='animate-pulse'>
      <CardHeader className='space-y-2'>
        <Skeleton className='h-5 w-32' />
        <Skeleton className='h-3 w-24' />
      </CardHeader>
      <CardContent className='space-y-3'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-4 w-1/2' />
      </CardContent>
    </Card>
  )
}
