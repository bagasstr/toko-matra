import React from 'react'
import { Bell } from 'lucide-react'
import { getNotifications } from '@/app/actions/notificationAction'
import NotificationItem from './components/NotificationItem'
import NotificationBadge from './components/NotificationBadge'

const NotificationsPage = async () => {
  const { notifications, error } = await getNotifications()

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
