'use client'

import { ReactNode } from 'react'
import { PerformanceProvider } from '@/components/PerformanceProvider'

interface ClientLayoutWrapperProps {
  children: ReactNode
}

export default function ClientLayoutWrapper({
  children,
}: ClientLayoutWrapperProps) {
  return <PerformanceProvider>{children}</PerformanceProvider>
}
