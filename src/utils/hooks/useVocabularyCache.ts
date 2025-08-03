'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Vocabulary } from '@/payload-types'

interface CacheEntry {
  data: Vocabulary[]
  timestamp: number
  key: string
}

interface CacheOptions {
  maxAge: number // in milliseconds
  maxSize: number // maximum number of cache entries
}

const DEFAULT_OPTIONS: CacheOptions = {
  maxAge: 5 * 60 * 1000, // 5 minutes
  maxSize: 10, // 10 different cache entries
}

export function useVocabularyCache(options: Partial<CacheOptions> = {}) {
  const cacheOptions = { ...DEFAULT_OPTIONS, ...options }
  const cache = useRef<Map<string, CacheEntry>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate cache key from parameters
  const generateCacheKey = useCallback((params: Record<string, any>) => {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce(
        (result, key) => {
          result[key] = params[key]
          return result
        },
        {} as Record<string, any>,
      )

    return JSON.stringify(sortedParams)
  }, [])

  // Check if cache entry is valid
  const isCacheValid = useCallback(
    (entry: CacheEntry) => {
      return Date.now() - entry.timestamp < cacheOptions.maxAge
    },
    [cacheOptions.maxAge],
  )

  // Clean expired cache entries
  const cleanCache = useCallback(() => {
    const now = Date.now()
    const entries = Array.from(cache.current.entries())

    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > cacheOptions.maxAge) {
        cache.current.delete(key)
      }
    })

    // If cache is still too large, remove oldest entries
    if (cache.current.size > cacheOptions.maxSize) {
      const sortedEntries = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, cache.current.size - cacheOptions.maxSize)

      sortedEntries.forEach(([key]) => {
        cache.current.delete(key)
      })
    }
  }, [cacheOptions.maxAge, cacheOptions.maxSize])

  // Get vocabulary from cache or fetch
  const getVocabulary = useCallback(
    async (params: {
      limit?: number
      difficulty?: string
      status?: string
      customerId?: string
    }): Promise<Vocabulary[]> => {
      const cacheKey = generateCacheKey(params)
      const cachedEntry = cache.current.get(cacheKey)

      // Return cached data if valid
      if (cachedEntry && isCacheValid(cachedEntry)) {
        return cachedEntry.data
      }

      setLoading(true)
      setError(null)

      try {
        // Build query parameters
        const queryParams = new URLSearchParams()
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.difficulty && params.difficulty !== 'all') {
          queryParams.append('difficulty', params.difficulty)
        }
        if (params.status && params.status !== 'all') {
          queryParams.append('status', params.status)
        }
        if (params.customerId) queryParams.append('customerId', params.customerId)

        const response = await fetch(`/api/custom/vocabulary/practice?${queryParams}`)

        if (!response.ok) {
          throw new Error('Failed to fetch vocabulary')
        }

        const data = await response.json()
        const vocabulary: Vocabulary[] = data.docs || []

        // Cache the result
        cache.current.set(cacheKey, {
          data: vocabulary,
          timestamp: Date.now(),
          key: cacheKey,
        })

        // Clean cache
        cleanCache()

        return vocabulary
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vocabulary'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [generateCacheKey, isCacheValid, cleanCache],
  )

  // Preload vocabulary for practice
  const preloadVocabulary = useCallback(
    async (
      configs: Array<{
        limit?: number
        difficulty?: string
        status?: string
        customerId?: string
      }>,
    ) => {
      const promises = configs.map((config) =>
        getVocabulary(config).catch((err) => {
          console.warn('Failed to preload vocabulary:', err)
          return []
        }),
      )

      await Promise.all(promises)
    },
    [getVocabulary],
  )

  // Invalidate cache for specific parameters
  const invalidateCache = useCallback(
    (params?: Record<string, any>) => {
      if (params) {
        const cacheKey = generateCacheKey(params)
        cache.current.delete(cacheKey)
      } else {
        // Clear entire cache
        cache.current.clear()
      }
    },
    [generateCacheKey],
  )

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const entries = Array.from(cache.current.values())
    const validEntries = entries.filter((entry) => isCacheValid(entry))

    return {
      totalEntries: cache.current.size,
      validEntries: validEntries.length,
      expiredEntries: entries.length - validEntries.length,
      cacheHitRate: validEntries.length / Math.max(entries.length, 1),
      oldestEntry: entries.length > 0 ? Math.min(...entries.map((e) => e.timestamp)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map((e) => e.timestamp)) : null,
    }
  }, [isCacheValid])

  // Auto-clean cache periodically
  useEffect(() => {
    const interval = setInterval(cleanCache, 60000) // Clean every minute
    return () => clearInterval(interval)
  }, [cleanCache])

  // Prefetch common vocabulary combinations on mount
  useEffect(() => {
    const commonConfigs = [
      { limit: 20, difficulty: 'easy' },
      { limit: 20, difficulty: 'medium' },
      { limit: 20, status: 'new' },
      { limit: 20, status: 'learning' },
    ]

    preloadVocabulary(commonConfigs)
  }, []) // Empty dependency array to run only once on mount

  return {
    getVocabulary,
    preloadVocabulary,
    invalidateCache,
    getCacheStats,
    loading,
    error,
  }
}
