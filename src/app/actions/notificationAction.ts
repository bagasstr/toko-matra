'use server'

import { prisma } from '@/lib/prisma'
import { generateCustomId } from '@/lib/helpper'
import { revalidatePath } from 'next/cache'

export type Notification = {
  id: string
  userId: string
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}

export async function getNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: notifications }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return { success: false, error: 'Failed to fetch notifications' }
  }
}

export async function updateNotificationStatus(
  notificationId: string,
  isRead: boolean
) {
  try {
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead },
    })

    revalidatePath('/notifikasi')
    return { success: true, data: updatedNotification }
  } catch (error) {
    console.error('Error updating notification status:', error)
    return { success: false, error: 'Failed to update notification status' }
  }
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type?: boolean
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        id: generateCustomId('notif'),
        userId,
        title,
        message,
        isRead: type || false,
      },
    })

    revalidatePath('/notifikasi')
    return { success: true, data: notification }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { success: false, error: 'Failed to create notification' }
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    await prisma.notification.delete({
      where: { id: notificationId },
    })

    revalidatePath('/notifikasi')
    return { success: true }
  } catch (error) {
    console.error('Error deleting notification:', error)
    return { success: false, error: 'Failed to delete notification' }
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })

    revalidatePath('/notifikasi')
    return { success: true }
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return { success: false, error: 'Failed to mark all notifications as read' }
  }
}

export async function getUnreadCount(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    })

    return { success: true, data: count }
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return { success: false, error: 'Failed to fetch unread count' }
  }
}
