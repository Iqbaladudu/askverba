/**
 * Optimized data fetching hooks with React Query integration
 * Provides efficient data fetching with caching, deduplication, and error handling
 */

'use client'

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { createDeduplicatedApiCall } from '@/lib/cache/request-deduplication'
import { api } from '@/lib/api/client'

// Query keys for organized cache management
export const QUERY_KEYS = {
  // User data
  user: (userId: string) => ['user', userId],
  userProfile: (userId: string) => ['user', userId, 'profile'],
  
  // Vocabulary
  vocabulary: (userId: string) => ['vocabulary', userId],
  vocabularyList: (userId: string, filters?: unknown) => ['vocabulary', userId, 'list', filters],
  vocabularyStats: (userId: string) => ['vocabulary', userId, 'stats'],
  vocabularyPractice: (userId: string, options?: unknown) => ['vocabulary', userId, 'practice', options],
  
  // Practice sessions
  practice: (userId: string) => ['practice', userId],
  practiceList: (userId: string, filters?: unknown) => ['practice', userId, 'list', filters],
  practiceStats: (userId: string, period?: string) => ['practice', userId, 'stats', period],
  
  // Translation history
  translations: (userId: string) => ['translations', userId],
  translationList: (userId: string, filters?: unknown) => ['translations', userId, 'list', filters],
  translationStats: (userId: string) => ['translations', userId, 'stats'],
  
  // Analytics
  analytics: (userId: string, period?: string) => ['analytics', userId, period],
  
  // Global data
  popularTranslations: () => ['popular', 'translations'],
  globalStats: () => ['global', 'stats'],
}

// Default query options
const DEFAULT_QUERY_OPTIONS: Partial<UseQueryOptions> = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
}

// Deduplicated API calls
const deduplicatedApi = {
  get: createDeduplicatedApiCall(api.get),
  post: createDeduplicatedApiCall(api.post),
  put: createDeduplicatedApiCall(api.put),
  delete: createDeduplicatedApiCall(api.delete),
}

/**
 * Optimized vocabulary hooks
 */
export const useOptimizedVocabulary = {
  // Get vocabulary list with filters
  useList: (filters?: {
    page?: number
    limit?: number
    status?: string
    difficulty?: string
    search?: string
    sortBy?: string
    sortOrder?: string
  }) => {
    const { customer } = useAuth()
    
    return useQuery({
      queryKey: QUERY_KEYS.vocabularyList(customer?.id || '', filters),
      queryFn: async () => {
        if (!customer?.id) throw new Error('User not authenticated')
        
        const params = new URLSearchParams()
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, String(value))
            }
          })
        }
        
        const response = await deduplicatedApi.get(`/api/vocabulary?${params}`)
        return response.data
      },
      enabled: !!customer?.id,
      ...DEFAULT_QUERY_OPTIONS,
    })
  },

  // Get vocabulary statistics
  useStats: () => {
    const { customer } = useAuth()
    
    return useQuery({
      queryKey: QUERY_KEYS.vocabularyStats(customer?.id || ''),
      queryFn: async () => {
        if (!customer?.id) throw new Error('User not authenticated')
        
        const response = await deduplicatedApi.get(`/api/vocabulary/stats`)
        return response.data
      },
      enabled: !!customer?.id,
      staleTime: 2 * 60 * 1000, // 2 minutes for stats
      ...DEFAULT_QUERY_OPTIONS,
    })
  },

  // Get words for practice
  usePracticeWords: (options?: {
    limit?: number
    difficulty?: string
    status?: string
  }) => {
    const { customer } = useAuth()
    
    return useQuery({
      queryKey: QUERY_KEYS.vocabularyPractice(customer?.id || '', options),
      queryFn: async () => {
        if (!customer?.id) throw new Error('User not authenticated')
        
        const params = new URLSearchParams()
        if (options) {
          Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, String(value))
            }
          })
        }
        
        const response = await deduplicatedApi.get(`/api/vocabulary/practice?${params}`)
        return response.data
      },
      enabled: !!customer?.id,
      staleTime: 1 * 60 * 1000, // 1 minute for practice words
      ...DEFAULT_QUERY_OPTIONS,
    })
  },

  // Create vocabulary mutation
  useCreate: () => {
    const queryClient = useQueryClient()
    const { customer } = useAuth()
    
    return useMutation({
      mutationFn: async (data: unknown) => {
        const response = await api.post('/api/vocabulary', data)
        return response.data
      },
      onSuccess: () => {
        // Invalidate related queries
        if (customer?.id) {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vocabulary(customer.id) })
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vocabularyStats(customer.id) })
        }
      },
    })
  },

  // Update vocabulary mutation
  useUpdate: () => {
    const queryClient = useQueryClient()
    const { customer } = useAuth()
    
    return useMutation({
      mutationFn: async (data: { id: string; [key: string]: unknown }) => {
        const response = await api.put('/api/vocabulary', data)
        return response.data
      },
      onSuccess: () => {
        // Invalidate related queries
        if (customer?.id) {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vocabulary(customer.id) })
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vocabularyStats(customer.id) })
        }
      },
    })
  },

  // Delete vocabulary mutation
  useDelete: () => {
    const queryClient = useQueryClient()
    const { customer } = useAuth()
    
    return useMutation({
      mutationFn: async (id: string) => {
        const response = await api.delete(`/api/vocabulary?id=${id}`)
        return response.data
      },
      onSuccess: () => {
        // Invalidate related queries
        if (customer?.id) {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vocabulary(customer.id) })
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vocabularyStats(customer.id) })
        }
      },
    })
  },
}

/**
 * Optimized practice hooks
 */
export const useOptimizedPractice = {
  // Get practice sessions
  useSessions: (filters?: {
    page?: number
    limit?: number
    sessionType?: string
    difficulty?: string
    dateFrom?: string
    dateTo?: string
  }) => {
    const { customer } = useAuth()
    
    return useQuery({
      queryKey: QUERY_KEYS.practiceList(customer?.id || '', filters),
      queryFn: async () => {
        if (!customer?.id) throw new Error('User not authenticated')
        
        const params = new URLSearchParams()
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, String(value))
            }
          })
        }
        
        const response = await deduplicatedApi.get(`/api/practice?${params}`)
        return response.data
      },
      enabled: !!customer?.id,
      ...DEFAULT_QUERY_OPTIONS,
    })
  },

  // Get practice statistics
  useStats: (period: string = 'week') => {
    const { customer } = useAuth()
    
    return useQuery({
      queryKey: QUERY_KEYS.practiceStats(customer?.id || '', period),
      queryFn: async () => {
        if (!customer?.id) throw new Error('User not authenticated')
        
        const response = await deduplicatedApi.get(`/api/practice/stats?period=${period}`)
        return response.data
      },
      enabled: !!customer?.id,
      staleTime: 2 * 60 * 1000, // 2 minutes for stats
      ...DEFAULT_QUERY_OPTIONS,
    })
  },

  // Create practice session mutation
  useCreate: () => {
    const queryClient = useQueryClient()
    const { customer } = useAuth()
    
    return useMutation({
      mutationFn: async (data: unknown) => {
        const response = await api.post('/api/practice', data)
        return response.data
      },
      onSuccess: () => {
        // Invalidate related queries
        if (customer?.id) {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.practice(customer.id) })
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.practiceStats(customer.id) })
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vocabularyStats(customer.id) })
        }
      },
    })
  },
}

/**
 * Optimized translation hooks
 */
export const useOptimizedTranslation = {
  // Get translation history
  useHistory: (filters?: {
    page?: number
    limit?: number
    mode?: string
    search?: string
    dateFrom?: string
    dateTo?: string
  }) => {
    const { customer } = useAuth()
    
    return useQuery({
      queryKey: QUERY_KEYS.translationList(customer?.id || '', filters),
      queryFn: async () => {
        if (!customer?.id) throw new Error('User not authenticated')
        
        const params = new URLSearchParams()
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, String(value))
            }
          })
        }
        
        const response = await deduplicatedApi.get(`/api/translate?${params}`)
        return response.data
      },
      enabled: !!customer?.id,
      ...DEFAULT_QUERY_OPTIONS,
    })
  },

  // Translate text mutation
  useTranslate: () => {
    const queryClient = useQueryClient()
    const { customer } = useAuth()
    
    return useMutation({
      mutationFn: async (data: {
        text: string
        mode: 'simple' | 'detailed'
        saveToHistory?: boolean
      }) => {
        const response = await api.post('/api/translate', data)
        return response.data
      },
      onSuccess: (data, variables) => {
        // Invalidate translation history if saved
        if (variables.saveToHistory && customer?.id) {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.translations(customer.id) })
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.translationStats(customer.id) })
        }
      },
    })
  },

  // Delete translation mutation
  useDelete: () => {
    const queryClient = useQueryClient()
    const { customer } = useAuth()
    
    return useMutation({
      mutationFn: async (id: string) => {
        const response = await api.delete(`/api/translate?id=${id}`)
        return response.data
      },
      onSuccess: () => {
        // Invalidate related queries
        if (customer?.id) {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.translations(customer.id) })
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.translationStats(customer.id) })
        }
      },
    })
  },
}

/**
 * Parallel data fetching hook for dashboard
 */
export const useDashboardData = () => {
  const { customer } = useAuth()
  
  // Fetch all dashboard data in parallel
  const vocabularyStats = useOptimizedVocabulary.useStats()
  const practiceStats = useOptimizedPractice.useStats()
  const recentVocabulary = useOptimizedVocabulary.useList({ 
    limit: 5, 
    sortBy: 'createdAt', 
    sortOrder: 'desc' 
  })
  const recentPractice = useOptimizedPractice.useSessions({ 
    limit: 5, 
    sortBy: 'createdAt', 
    sortOrder: 'desc' 
  })

  return {
    vocabularyStats,
    practiceStats,
    recentVocabulary,
    recentPractice,
    isLoading: vocabularyStats.isLoading || practiceStats.isLoading || 
               recentVocabulary.isLoading || recentPractice.isLoading,
    isError: vocabularyStats.isError || practiceStats.isError || 
             recentVocabulary.isError || recentPractice.isError,
    error: vocabularyStats.error || practiceStats.error || 
           recentVocabulary.error || recentPractice.error,
  }
}

/**
 * Prefetch utilities for better UX
 */
export const usePrefetch = () => {
  const queryClient = useQueryClient()
  const { customer } = useAuth()

  return {
    // Prefetch vocabulary data
    prefetchVocabulary: async (filters?: unknown) => {
      if (!customer?.id) return
      
      await queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.vocabularyList(customer.id, filters),
        queryFn: async () => {
          const params = new URLSearchParams()
          if (filters && typeof filters === 'object') {
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                params.append(key, String(value))
              }
            })
          }
          
          const response = await deduplicatedApi.get(`/api/vocabulary?${params}`)
          return response.data
        },
        staleTime: 5 * 60 * 1000,
      })
    },

    // Prefetch practice data
    prefetchPractice: async (filters?: unknown) => {
      if (!customer?.id) return
      
      await queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.practiceList(customer.id, filters),
        queryFn: async () => {
          const params = new URLSearchParams()
          if (filters && typeof filters === 'object') {
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                params.append(key, String(value))
              }
            })
          }
          
          const response = await deduplicatedApi.get(`/api/practice?${params}`)
          return response.data
        },
        staleTime: 5 * 60 * 1000,
      })
    },
  }
}
