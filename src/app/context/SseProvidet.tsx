'use client'
import { createContext, useContext, useEffect, useState } from 'react'

interface Notification {
  title: string
  id: string
  message: string
  isRead: boolean
  createdAt: string
  type?: 'NEW_NOTIFICATION' | 'STATUS_UPDATE' | 'ERROR'
}

interface SSEContextType {
  notifications: Notification[]
  updateNotificationStatus: (id: string, isRead: boolean) => void
}

const SSEContext = createContext<SSEContextType>({
  notifications: [],
  updateNotificationStatus: () => {},
})

export function SSEProvider({
  userId,
  children,
}: {
  userId: string
  children: React.ReactNode
}) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Function to update notification status
  const updateNotificationStatus = (id: string, isRead: boolean) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, isRead } : notification
      )
    )
  }

  useEffect(() => {
    if (!userId) return

    let eventSource: EventSource | null = null
    let retryCount = 0
    const maxRetries = 3 // Reduced retry attempts
    const retryDelay = 5000 // 5 seconds

    // Fetch existing notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${userId}`)
        if (!res.ok) {
          console.warn('Failed to fetch notifications, continuing without SSE')
          return
        }
        const data = await res.json()
        if (data.notifications) {
          // Sort notifications by date
          const sortedNotifications = data.notifications.sort(
            (a: Notification, b: Notification) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          setNotifications(sortedNotifications)
        }
      } catch (error) {
        console.warn('Error fetching notifications:', error)
      }
    }

    // Initialize SSE connection
    const initSSE = () => {
      if (eventSource) {
        eventSource.close()
      }

      try {
        eventSource = new EventSource(`/api/sse?userId=${userId}`)

        eventSource.onmessage = (event) => {
          try {
            const data: Notification = JSON.parse(event.data)

            // Handle error messages from server
            if (data.type === 'ERROR') {
              console.warn('SSE server error:', data.message)
              eventSource?.close()
              return
            }

            setNotifications((prev) => {
              // Handle different types of notifications
              switch (data.type) {
                case 'STATUS_UPDATE':
                  // Update existing notification status
                  return prev.map((notification) =>
                    notification.id === data.id
                      ? { ...notification, isRead: data.isRead }
                      : notification
                  )

                case 'NEW_NOTIFICATION':
                default:
                  // Check if notification already exists
                  const existingIndex = prev.findIndex((n) => n.id === data.id)
                  if (existingIndex !== -1) {
                    return prev // Skip if already exists
                  }
                  // Add new notification at the beginning
                  return [data, ...prev]
              }
            })
          } catch (error) {
            console.warn('Error parsing SSE message:', error)
          }
        }

        eventSource.onerror = (error) => {
          console.warn('SSE connection error, Redis may not be available')
          eventSource?.close()

          if (retryCount < maxRetries) {
            retryCount++
            console.log(
              `Retrying SSE connection (${retryCount}/${maxRetries})...`
            )
            setTimeout(initSSE, retryDelay)
          } else {
            console.log(
              'Max SSE retries reached, continuing without real-time updates'
            )
          }
        }

        eventSource.onopen = () => {
          console.log('SSE connection established')
          retryCount = 0 // Reset retry count on successful connection
        }
      } catch (error) {
        console.warn('Failed to initialize SSE connection:', error)
      }
    }

    // Start the system
    fetchNotifications()
    initSSE()

    // Cleanup
    return () => {
      if (eventSource) {
        console.log('Closing SSE connection')
        eventSource.close()
      }
    }
  }, [userId])

  return (
    <SSEContext.Provider value={{ notifications, updateNotificationStatus }}>
      {children}
    </SSEContext.Provider>
  )
}

export function useSSE() {
  return useContext(SSEContext)
}
