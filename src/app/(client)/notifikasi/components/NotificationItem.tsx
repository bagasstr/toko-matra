'use client'

import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { updateNotificationStatus } from '@/app/actions/notificationAction'
import { useQueryClient } from '@tanstack/react-query'
import { validateSession } from '@/app/actions/session'

interface NotificationItemProps {
  id: string
  title: string
  message: string
  createdAt: Date
  isRead: boolean
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  title,
  message,
  createdAt,
  isRead,
}) => {
  const queryClient = useQueryClient()

  const handleClick = async () => {
    if (!isRead) {
      try {
        const session = await validateSession()
        if (session?.user?.id) {
          await updateNotificationStatus(id, true)
          // Invalidate and refetch notifications
          queryClient.invalidateQueries({
            queryKey: ['notifications', session.user.id],
          })
        }
      } catch (error) {
        console.error('Error updating notification status:', error)
      }
    }
  }

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isRead
          ? 'bg-white border-gray-200 hover:bg-gray-50'
          : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
      }`}
      onClick={handleClick}>
      <div className='flex justify-between items-start mb-2'>
        <h3
          className={`font-semibold ${
            isRead ? 'text-gray-800' : 'text-blue-800'
          }`}>
          {title}
        </h3>
        {!isRead && (
          <div className='w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1'></div>
        )}
      </div>
      <p
        className={`text-sm mb-2 ${
          isRead ? 'text-gray-600' : 'text-blue-700'
        }`}>
        {message}
      </p>
      <p className='text-xs text-gray-500'>
        {formatDistanceToNow(new Date(createdAt), {
          addSuffix: true,
          locale: idLocale,
        })}
      </p>
    </div>
  )
}

export default NotificationItem
