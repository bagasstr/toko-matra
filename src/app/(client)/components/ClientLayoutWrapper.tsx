// components/ClientLayoutWrapper.tsx
'use client'
import { ReactNode, useEffect, useState } from 'react'
import { PerformanceProvider } from '@/components/PerformanceProvider'

interface ClientLayoutWrapperProps {
  children: ReactNode
}

export default function ClientLayoutWrapper({
  children,
}: ClientLayoutWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div>Loading...</div>
  }

  return <PerformanceProvider>{children}</PerformanceProvider>
}
