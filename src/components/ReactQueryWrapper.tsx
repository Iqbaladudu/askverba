'use client'

import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Enhanced QueryClient configuration for production
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time - how long data is considered fresh
        staleTime: 5 * 60 * 1000, // 5 minutes

        // Cache time - how long data stays in cache after becoming unused
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

        // Retry configuration
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as any).status
            if (status >= 400 && status < 500) {
              return false
            }
          }

          // Retry up to 3 times for other errors
          return failureCount < 3
        },

        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Refetch on window focus (disabled for better UX)
        refetchOnWindowFocus: false,

        // Refetch on reconnect
        refetchOnReconnect: true,

        // Background refetch interval (disabled by default)
        refetchInterval: false,

        // Network mode
        networkMode: 'online',
      },
      mutations: {
        // Retry mutations once
        retry: 1,

        // Retry delay for mutations
        retryDelay: 1000,

        // Network mode for mutations
        networkMode: 'online',
      },
    },
  })
}

export default function ReactQueryWrapper({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools will be added conditionally */}
      {process.env.NODE_ENV === 'development' && <DevtoolsWrapper />}
    </QueryClientProvider>
  )
}

// Separate component for devtools to handle loading safely
function DevtoolsWrapper() {
  const [DevtoolsComponent, setDevtoolsComponent] = useState<React.ComponentType<any> | null>(null)

  React.useEffect(() => {
    // Only load devtools in browser environment
    if (typeof window !== 'undefined') {
      import('@tanstack/react-query-devtools')
        .then((mod) => {
          setDevtoolsComponent(() => mod.ReactQueryDevtools)
        })
        .catch((error) => {
          console.warn('Failed to load React Query Devtools:', error)
        })
    }
  }, [])

  if (!DevtoolsComponent) {
    return null
  }

  return (
    <DevtoolsComponent
      initialIsOpen={false}
      position="bottom-right"
      toggleButtonProps={{
        style: {
          marginLeft: '5px',
          transform: 'scale(0.8)',
        },
      }}
    />
  )
}
