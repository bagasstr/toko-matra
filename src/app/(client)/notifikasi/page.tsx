'use client'

import React from 'react'
import { Bell } from 'lucide-react'
import { getNotifications } from '@/app/actions/notificationAction'
import NotificationItem from './components/NotificationItem'
import NotificationBadge from './components/NotificationBadge'
import { useSSE } from '@/app/context/SseProvidet'
import { useEffect, useState } from 'react'

interface Notification {
  id: string
  title: string
  message: string
  createdAt: Date
  isRead: boolean
}

const NotificationsPage = () => {
  const { notifications: sseNotifications } = useSSE()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInitialNotifications = async () => {
      try {
        const result = await getNotifications()
        if (result.error) {
          setError(result.error)
        } else if (result.notifications) {
          setNotifications(result.notifications)
        }
      } catch (err) {
        setError('Failed to fetch notifications')
        console.error('Error fetching notifications:', err)
      }
    }

    fetchInitialNotifications()
  }, [])

  // Merge SSE notifications with existing notifications
  useEffect(() => {
    if (sseNotifications.length > 0) {
      setNotifications((prevNotifications) => {
        const merged = [...prevNotifications]
        sseNotifications.forEach((sseNotif) => {
          const existingIndex = merged.findIndex((n) => n.id === sseNotif.id)
          if (existingIndex !== -1) {
            // Update existing notification
            merged[existingIndex] = {
              ...merged[existingIndex],
              isRead: sseNotif.isRead,
            }
          } else {
            // Add new notification at the beginning
            merged.unshift({
              ...sseNotif,
              createdAt: new Date(sseNotif.createdAt),
            })
          }
        })
        return merged
      })
    }
  }, [sseNotifications])

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
