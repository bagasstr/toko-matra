'use client'

import React from 'react'
import { Bell, InboxIcon } from 'lucide-react'
import { getNotifications } from '@/app/actions/notificationAction'
import NotificationItem from './components/NotificationItem'
import { useSessionStore } from '@/hooks/zustandStore'
import { useQuery } from '@tanstack/react-query'
import Loading from './loading'

interface Notification {
  id: string
  title: string
  message: string
  createdAt: Date
  isRead: boolean
}

const NotificationsPage = () => {
  // Use optimized session store instead of manual session handling
  const {
    userId,
    isLoggedIn,
    isLoading: sessionLoading,
    isInitialized,
    initializeSession,
  } = useSessionStore()

  // Initialize session on component mount
  React.useEffect(() => {
    initializeSession()
  }, [initializeSession])

  // TanStack Query for notifications
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID not available')
      const result = await getNotifications(userId)
      if (result.success) {
        return result.data || []
      } else {
        throw new Error(result.error || 'Failed to fetch notifications')
      }
    },
    enabled: !!userId && isLoggedIn && isInitialized,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once to avoid long loading
  })

  // Handle session loading - include both loading state and initialization state
  if (sessionLoading || !isInitialized) {
    return <Loading />
  }

  // Handle not logged in
  if (!isLoggedIn) {
    return (
      <div className='max-w-2xl mx-auto py-10 px-4'>
        <div className='text-center py-10'>
          <p className='text-gray-500 mb-4'>
            Silakan login untuk melihat notifikasi
          </p>
          <a href='/login' className='text-blue-600 hover:underline'>
            Login sekarang
          </a>
        </div>
      </div>
    )
  }

  // Handle query loading
  if (isLoading) {
    return <Loading />
  }

  // Handle error
  if (error) {
    return (
      <div className='max-w-2xl mx-auto py-10 px-4'>
        <div className='text-red-500 text-center py-10'>
          {error instanceof Error ? error.message : 'Terjadi kesalahan'}
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-2xl mx-auto py-10 px-4'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold flex items-center gap-2'>
          <Bell /> Notifikasi
        </h1>
      </div>

      {notifications.length === 0 ? (
        // Empty state - no more loading spinner!
        <div className='text-center py-16'>
          <InboxIcon className='mx-auto h-16 w-16 text-gray-300 mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Tidak ada notifikasi
          </h3>
          <p className='text-gray-500'>
            Notifikasi akan muncul di sini ketika ada update pesanan atau
            informasi penting lainnya.
          </p>
        </div>
      ) : (
        // Show notifications
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
