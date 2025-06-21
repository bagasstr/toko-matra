'use client'

import { Bell, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { markNotificationAsRead } from '@/app/actions/notificationAction'
import { useRouter } from 'next/navigation'
import { useSSE } from '@/app/context/SseProvidet'
import { useEffect, useState } from 'react'

interface NotificationItemProps {
  id: string
  title: string
  message: string
  createdAt: Date
  isRead: boolean
}

const NotificationItem = ({
  id,
  title,
  message,
  createdAt,
  isRead: initialIsRead,
}: NotificationItemProps) => {
  const router = useRouter()
  const { updateNotificationStatus } = useSSE()
  const [isRead, setIsRead] = useState(initialIsRead)

  const handleClick = async () => {
    if (!isRead) {
      try {
        const result = await markNotificationAsRead(id)
        if (!result.error) {
          setIsRead(true)
          updateNotificationStatus(id, true)
        }
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`flex gap-3 items-start p-4 rounded-xl border shadow-sm bg-white relative cursor-pointer hover:bg-gray-50 transition-colors ${
        isRead ? 'opacity-70' : 'bg-primary/5 border-primary/30'
      }`}>
      <div className='pt-1'>
        {isRead ? (
          <CheckCircle className='text-green-400' size={24} />
        ) : (
          <Bell className='text-primary' size={24} />
        )}
      </div>
      <div className='flex-1'>
        <div className='font-semibold mb-1 text-base'>{title}</div>
        <div className='text-sm text-gray-600 mb-1'>{message}</div>
        <div className='text-xs text-gray-400'>
          {formatDistanceToNow(new Date(createdAt), {
            addSuffix: true,
            locale: idLocale,
          })}
        </div>
      </div>
      {!isRead && (
        <span className='absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse' />
      )}
    </div>
  )
}

export default NotificationItem
