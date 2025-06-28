'use client'

import { useEffect, useState } from 'react'
import { useSessionStore } from '@/hooks/zustandStore'

interface SessionProviderProps {
  children: React.ReactNode
}

const SessionProvider = ({ children }: SessionProviderProps) => {
  const [mounted, setMounted] = useState(false)
  const { initializeSession, isInitialized } = useSessionStore()

  // Handle client-side mounting for hydration safety
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize session only after component is mounted (client-side)
  useEffect(() => {
    if (mounted && !isInitialized) {
      console.log('🔐 SessionProvider: Initializing session after mount')
      initializeSession()
    }
  }, [mounted, initializeSession, isInitialized])

  return <>{children}</>
}

export default SessionProvider
