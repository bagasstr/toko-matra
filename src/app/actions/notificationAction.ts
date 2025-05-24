'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { validateSession } from './session'

export type Notification = {
  id: string
  title: string
  message: string
  time: string
  isRead: boolean
  userId: string
  createdAt: Date
}

export async function getNotifications() {
  try {
    const session = await validateSession()

    if (!session?.user?.email) {
      return { error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { notifications }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return { error: 'Failed to fetch notifications' }
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const session = await validateSession()

    if (!session?.user?.email) {
      return { error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: user.id,
      },
      data: {
        isRead: true,
      },
    })

    revalidatePath('/notifikasi')
    return { success: true }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { error: 'Failed to mark notification as read' }
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const session = await validateSession()

    if (!session?.user?.email) {
      return { error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    revalidatePath('/notifikasi')
    return { success: true }
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return { error: 'Failed to mark all notifications as read' }
  }
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  isRead: boolean
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        title,
        message,
        isRead,
      },
    })

    return { notification }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { error: 'Failed to create notification' }
  }
}
