'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface PerformanceContextType {
  isSlowConnection: boolean
  prefetchEnabled: boolean
  measurePerformance: (componentName: string, duration: number) => void
}

const PerformanceContext = createContext<PerformanceContextType>({
  isSlowConnection: false,
  prefetchEnabled: true,
  measurePerformance: () => {},
})

export function PerformanceProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSlowConnection, setIsSlowConnection] = useState(false)
  const [prefetchEnabled, setPrefetchEnabled] = useState(true)

  useEffect(() => {
    // Detect slow connection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        const updateConnectionStatus = () => {
          setIsSlowConnection(
            connection.effectiveType === 'slow-2g' ||
              connection.effectiveType === '2g'
          )
          setPrefetchEnabled(!isSlowConnection)
        }

        updateConnectionStatus()
        connection.addEventListener('change', updateConnectionStatus)

        return () =>
          connection.removeEventListener('change', updateConnectionStatus)
      }
    }
  }, [isSlowConnection])

  const measurePerformance = (componentName: string, duration: number) => {
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.warn(
        `[Performance] ${componentName} took ${duration.toFixed(2)}ms`
      )
    }
  }

  return (
    <PerformanceContext.Provider
      value={{
        isSlowConnection,
        prefetchEnabled,
        measurePerformance,
      }}>
      {children}
    </PerformanceContext.Provider>
  )
}

export const usePerformance = () => useContext(PerformanceContext)
