'use client'

import React, { lazy, Suspense } from 'react'
import { Bell } from 'lucide-react'
import { getNotifications } from '@/app/actions/notificationAction'
import NotificationItem from './components/NotificationItem'
import { useEffect, useState } from 'react'
import { validateSession } from '@/app/actions/session'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Loading from './loading'

const NotificationItems = lazy(() => import('./components/NotificationItem'))
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
  const { data: notifications = [], isLoading } = useQuery({
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
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    // staleTime: 30000,
    gcTime: 5 * 60 * 1000, // 5 minutes
  })

  if (error) {
    return (
      <div className='max-w-2xl mx-auto py-10 px-4'>
        <div className='text-red-500 text-center py-10'>{error}</div>
      </div>
    )
  }

  if (isLoading || !notifications.length) {
    return <Loading />
  }

  return (
    <div className='max-w-2xl mx-auto py-10 px-4'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold flex items-center gap-2'>
          <Bell /> Notifikasi
        </h1>
      </div>
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
    </div>
  )
}

export default NotificationsPage
