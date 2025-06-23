'use client'

import { useEffect, useState } from 'react'
import { validateSession } from '@/app/actions/session'
import FooterMobileServer from './footerMobileClient'

export default function FooterMobileWrapper() {
  const [userId, setUserId] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await validateSession()
        if (session?.user?.id) {
          setUserId(session.user.id)
        }
      } catch (error) {
        // Graceful degradation - show footer without user ID
        console.error('Session validation error in footer:', error)
      } finally {
        setMounted(true)
      }
    }

    checkSession()
  }, [])

  // Prevent hydration issues
  if (!mounted) {
    return null
  }

  return <FooterMobileServer userId={userId} />
}
