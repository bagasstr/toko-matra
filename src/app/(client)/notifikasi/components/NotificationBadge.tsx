'use client'

import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationBadgeProps {
  count: number
  className?: string
}

const NotificationBadge = ({ count, className }: NotificationBadgeProps) => {
  if (count === 0) return null

  return (
    <div className={cn('relative inline-flex', className)}>
      <Bell className='h-5 w-5' />
      <span className='absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white'>
        {count > 99 ? '99+' : count}
      </span>
    </div>
  )
}

export default NotificationBadge
