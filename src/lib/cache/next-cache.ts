/**
 * Next.js cache utilities with Redis integration
 * Provides multi-layer caching with Next.js cache and Redis
 */

import { unstable_cache } from 'next/cache'
import { TranslationCache } from '@/lib/redis'

// Cache configuration
export const CACHE_CONFIG = {
  // Short-term cache for frequently accessed data
  SHORT_TTL: 60 * 5, // 5 minutes
  // Medium-term cache for user-specific data
  MEDIUM_TTL: 60 * 30, // 30 minutes
  // Long-term cache for static/rarely changing data
  LONG_TTL: 60 * 60 * 24, // 24 hours
  // Very long-term cache for translations
  TRANSLATION_TTL: 60 * 60 * 24 * 7, // 7 days
}

// Cache tags for organized invalidation
export const CACHE_TAGS = {
  USER: (userId: string) => `user-${userId}`,
  VOCABULARY: (userId: string) => `vocabulary-${userId}`,
  VOCABULARY_STATS: (userId: string) => `vocabulary-stats-${userId}`,
  TRANSLATION_HISTORY: (userId: string) => `translation-history-${userId}`,
  PRACTICE_SESSIONS: (userId: string) => `practice-sessions-${userId}`,
  PRACTICE_STATS: (userId: string) => `practice-stats-${userId}`,
  USER_STATS: (userId: string) => `user-stats-${userId}`,
  ANALYTICS: (userId: string) => `analytics-${userId}`,
  GLOBAL_STATS: 'global-stats',
  POPULAR_TRANSLATIONS: 'popular-translations',
}

/**
 * Multi-layer cache wrapper that combines Next.js cache with Redis
 */
export function createCachedFunction<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    keyPrefix: string
    ttl?: number
    tags?: string[]
    revalidate?: number
    useRedis?: boolean
    useNextCache?: boolean
  },
) {
  const {
    keyPrefix,
    ttl = CACHE_CONFIG.MEDIUM_TTL,
    tags = [],
    revalidate,
    useRedis = true,
    useNextCache = true,
  } = options

  // Create Next.js cached function if enabled
  const nextCachedFn = useNextCache
    ? unstable_cache(fn, [keyPrefix], {
        tags,
        revalidate: revalidate || ttl,
      })
    : fn

  // Return wrapper function with Redis layer
  return async (...args: T): Promise<R> => {
    const cacheKey = `${keyPrefix}:${JSON.stringify(args)}`

    // Try Redis cache first if enabled
    if (useRedis) {
      try {
        // Use a generic cache key approach since TranslationCache methods are specific
        const redis = (await import('@/lib/redis')).default
        if (redis) {
          const cached = await redis.get(cacheKey)
          if (cached) {
            console.log(`[CACHE HIT] Redis: ${cacheKey}`)
            return JSON.parse(cached)
          }
        }
      } catch (error) {
        console.warn(`[CACHE ERROR] Redis get failed for ${cacheKey}:`, error)
      }
    }

    // Execute function (with Next.js cache if enabled)
    console.log(`[CACHE MISS] Executing: ${cacheKey}`)
    const result = await nextCachedFn(...args)

    // Store in Redis if enabled
    if (useRedis) {
      try {
        const redis = (await import('@/lib/redis')).default
        if (redis) {
          await redis.setex(cacheKey, ttl, JSON.stringify(result))
          console.log(`[CACHE SET] Redis: ${cacheKey}`)
        }
      } catch (error) {
        console.warn(`[CACHE ERROR] Redis set failed for ${cacheKey}:`, error)
      }
    }

    return result
  }
}

/**
 * Cached vocabulary functions
 */
export const cachedVocabulary = {
  getUserVocabulary: createCachedFunction(
    async (userId: string, options: unknown) => {
      const { getUserVocabulary } = await import('@/lib/services/vocabularyService')
      return getUserVocabulary(userId, options)
    },
    {
      keyPrefix: 'vocabulary:user',
      ttl: CACHE_CONFIG.MEDIUM_TTL,
      tags: ['vocabulary'],
    },
  ),

  getVocabularyStats: createCachedFunction(
    async (userId: string) => {
      const { getVocabularyStats } = await import('@/lib/services/vocabularyService')
      return getVocabularyStats(userId)
    },
    {
      keyPrefix: 'vocabulary:stats',
      ttl: CACHE_CONFIG.SHORT_TTL,
      tags: ['vocabulary-stats'],
    },
  ),

  getWordsForPractice: createCachedFunction(
    async (userId: string, options: unknown) => {
      const { getWordsForPractice } = await import('@/lib/services/vocabularyService')
      return getWordsForPractice(userId, options)
    },
    {
      keyPrefix: 'vocabulary:practice',
      ttl: CACHE_CONFIG.SHORT_TTL,
      tags: ['vocabulary'],
    },
  ),
}

/**
 * Cached practice functions
 */
export const cachedPractice = {
  getUserPracticeSessions: createCachedFunction(
    async (userId: string, options: unknown) => {
      const { getUserPracticeSessions } = await import('@/lib/services/practiceService')
      return getUserPracticeSessions(userId, options)
    },
    {
      keyPrefix: 'practice:sessions',
      ttl: CACHE_CONFIG.MEDIUM_TTL,
      tags: ['practice-sessions'],
    },
  ),

  getPracticeStats: createCachedFunction(
    async (userId: string, period: string) => {
      const { getPracticeStats } = await import('@/lib/services/practiceService')
      return getPracticeStats(userId, period)
    },
    {
      keyPrefix: 'practice:stats',
      ttl: CACHE_CONFIG.SHORT_TTL,
      tags: ['practice-stats'],
    },
  ),
}

/**
 * Cached translation functions
 */
export const cachedTranslation = {
  getTranslationHistory: createCachedFunction(
    async (userId: string, options: unknown) => {
      const { getTranslationHistory } = await import('@/lib/services/translationService')
      return getTranslationHistory(userId, options)
    },
    {
      keyPrefix: 'translation:history',
      ttl: CACHE_CONFIG.MEDIUM_TTL,
      tags: ['translation-history'],
    },
  ),

  getTranslationStats: createCachedFunction(
    async (userId: string) => {
      const { getTranslationStats } = await import('@/lib/services/translationService')
      return getTranslationStats(userId)
    },
    {
      keyPrefix: 'translation:stats',
      ttl: CACHE_CONFIG.SHORT_TTL,
      tags: ['translation-history'],
    },
  ),
}

/**
 * Cache invalidation utilities
 */
export const cacheInvalidation = {
  // Invalidate user-specific caches
  invalidateUserCache: async (userId: string) => {
    // Note: revalidateTag should only be called from server components/routes
    // This function should be called from API routes, not client components

    // Clear Redis cache
    await TranslationCache.clearUserCache(userId)
  },

  // Invalidate vocabulary-specific caches
  invalidateVocabularyCache: async (userId: string) => {
    // Note: revalidateTag should only be called from server components/routes

    // Clear specific Redis keys
    const keys = [
      `vocabulary:user:*${userId}*`,
      `vocabulary:stats:*${userId}*`,
      `vocabulary:practice:*${userId}*`,
    ]

    for (const pattern of keys) {
      try {
        // Note: This is a simplified approach. In production, you might want
        // to use Redis SCAN command for pattern-based deletion
        const redis = (await import('@/lib/redis')).default
        if (redis) {
          await redis.del(pattern)
        }
      } catch (error) {
        console.warn('Failed to delete Redis pattern:', pattern, error)
      }
    }
  },

  // Invalidate practice-specific caches
  invalidatePracticeCache: async (userId: string) => {
    // Note: revalidateTag should only be called from server components/routes

    // Clear Redis cache
    await TranslationCache.clearUserCache(userId)
  },

  // Invalidate translation-specific caches
  invalidateTranslationCache: async (userId: string) => {
    // Note: revalidateTag should only be called from server components/routes

    // Clear Redis cache
    await TranslationCache.clearUserCache(userId)
  },

  // Invalidate global caches
  invalidateGlobalCache: async () => {
    // Note: revalidateTag should only be called from server components/routes

    // Clear global Redis keys
    const redis = (await import('@/lib/redis')).default
    if (redis) {
      try {
        await redis.del('popular:translations')
      } catch (error) {
        console.warn('Failed to delete global cache:', error)
      }
    }
  },
}

/**
 * Cache warming utilities for better performance
 */
export const cacheWarming = {
  // Warm up user caches after login
  warmUserCache: async (userId: string) => {
    try {
      // Pre-load frequently accessed data
      await Promise.allSettled([
        cachedVocabulary.getVocabularyStats(userId),
        cachedPractice.getPracticeStats(userId, 'week'),
        cachedTranslation.getTranslationStats(userId),
      ])
      console.log(`[CACHE WARM] User cache warmed for ${userId}`)
    } catch (error) {
      console.warn('Cache warming failed:', error)
    }
  },

  // Warm up vocabulary cache before practice
  warmVocabularyCache: async (userId: string) => {
    try {
      await Promise.allSettled([
        cachedVocabulary.getWordsForPractice(userId, { limit: 20 }),
        cachedVocabulary.getVocabularyStats(userId),
      ])
      console.log(`[CACHE WARM] Vocabulary cache warmed for ${userId}`)
    } catch (error) {
      console.warn('Vocabulary cache warming failed:', error)
    }
  },
}

/**
 * Cache health monitoring
 */
export const cacheHealth = {
  // Check cache hit rates and performance
  getCacheStats: async () => {
    try {
      // Check Redis status using our helper function
      const { getRedisStatus } = await import('@/lib/redis')
      const redisStatus = getRedisStatus()

      // Try to ping Redis if it's connected
      let pingResult = false
      if (redisStatus.connected) {
        try {
          const redis = (await import('@/lib/redis')).default
          if (redis) {
            const info = await redis.ping()
            pingResult = info === 'PONG'
          }
        } catch (pingError) {
          console.warn('Redis ping failed:', pingError)
        }
      }

      return {
        redis: {
          connected: redisStatus.connected && pingResult,
          initialized: redisStatus.initialized,
          timestamp: new Date().toISOString(),
        },
        nextjs: {
          // Next.js cache stats would need to be tracked separately
          enabled: true,
        },
      }
    } catch (error) {
      return {
        redis: {
          connected: false,
          initialized: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        nextjs: {
          enabled: true,
        },
      }
    }
  },
}
