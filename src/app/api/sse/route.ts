'use server'

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getUnreadNotifications } from '@/app/actions/notificationAction'
import { validateSession } from '@/app/actions/session'

export async function GET() {
  const session = await validateSession()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const sendNotifications = async () => {
        try {
          const notifications = await getUnreadNotifications(session.user.id)
          const data = {
            type: 'INITIAL_NOTIFICATIONS',
            notifications: notifications,
          }
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`)
        } catch (error) {
          console.error('Error fetching initial notifications:', error)
          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'ERROR',
              message: 'Failed to fetch notifications',
            })}\n\n`
          )
        }
      }

      await sendNotifications()

      const intervalId = setInterval(sendNotifications, 30000) // Poll every 30 seconds

      controller.close = () => {
        clearInterval(intervalId)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
