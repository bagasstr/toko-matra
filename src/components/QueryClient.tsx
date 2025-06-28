'use client'

import {
  QueryClient,
  QueryClientProvider as ReactQueryClientProvider,
} from '@tanstack/react-query'
import { useState } from 'react'

const QueryClientProvider = ({ children }: { children: React.ReactNode }) => {
  // Create QueryClient only once using useState to prevent recreation on re-renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false, // Prevent refetch on window focus
            refetchOnMount: false, // Don't refetch if data exists
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
    </ReactQueryClientProvider>
  )
}

export default QueryClientProvider
