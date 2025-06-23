'use client'

import React from 'react'
import { Bell } from 'lucide-react'
import { getNotifications } from '@/app/actions/notificationAction'
import NotificationItem from './components/NotificationItem'
import NotificationBadge from './components/NotificationBadge'
import { useEffect, useState } from 'react'
import { validateSession } from '@/app/actions/session'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface Notification {
  id: string
  title: string
  message: string
  createdAt: Date
  isRead: boolean
}

const NotificationsPage = () => {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Get user ID on component mount
  useEffect(() => {
    const getUserId = async () => {
      try {
        const session = await validateSession()
        if (session?.user?.id) {
          setUserId(session.user.id)
        } else {
          setError('User not authenticated')
        }
      } catch (err) {
        setError('Failed to authenticate user')
        console.error('Error getting user ID:', err)
      }
    }

    getUserId()
  }, [])

  // TanStack Query for notifications
  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID not available')
      const result = await getNotifications(userId)
      if (result.success && result.data) {
        return result.data
      } else {
        throw new Error(result.error || 'Failed to fetch notifications')
      }
    },
    enabled: !!userId,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })

  if (error) {
    return (
      <div className='max-w-2xl mx-auto py-10 px-4'>
        <div className='text-red-500 text-center py-10'>{error}</div>
      </div>
    )
  }

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0

  return (
    <div className='max-w-2xl mx-auto py-10 px-4'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold flex items-center gap-2'>
          <Bell /> Notifikasi
        </h1>
        <NotificationBadge count={unreadCount} />
      </div>
      {!notifications || notifications.length === 0 ? (
        <div className='text-gray-400 text-center py-10'>
          Tidak ada notifikasi.
        </div>
      ) : (
        <div className='space-y-4'>
          {notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              id={notif.id}
              title={notif.title}
              message={notif.message}
              createdAt={notif.createdAt}
              isRead={notif.isRead}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
