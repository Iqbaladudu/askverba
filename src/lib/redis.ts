/**
 * Production Redis client with proper error handling
 * No mock implementations - requires real Redis server
 */

import { Redis, Cluster } from 'ioredis'

// Redis client configuration with enhanced error handling
let redis: Redis | Cluster | null = null

// Connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryDelayOnFailover: 100,
  enableOfflineQueue: false,
  family: 4, // IPv4
}

// Initialize Redis client
async function initializeRedis(): Promise<void> {
  try {
    // Check if Redis cluster is configured
    const clusterNodes = process.env.REDIS_CLUSTER_NODES

    if (clusterNodes) {
      // Initialize Redis Cluster
      const nodes = clusterNodes.split(',').map((node) => {
        const [host, port] = node.trim().split(':')
        return { host, port: parseInt(port) }
      })

      redis = new Cluster(nodes, {
        redisOptions: redisConfig,
        enableOfflineQueue: false,
      })

      console.log('Initializing Redis Cluster...')
    } else {
      // Initialize single Redis instance
      redis = new Redis(redisConfig)
      console.log('Initializing Redis single instance...')
    }

    // Set up event handlers
    redis.on('connect', () => {
      console.log('✅ Redis connected successfully')
    })

    redis.on('ready', () => {
      console.log('✅ Redis ready for commands')
    })

    redis.on('error', (err) => {
      console.error('⚠️ Redis connection error:', err.message)
      // Log error but don't crash the application
    })

    redis.on('close', () => {
      console.log('🔌 Redis connection closed')
    })

    redis.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...')
    })

    // Test connection with timeout
    const testPromise = redis.ping()
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
    })

    await Promise.race([testPromise, timeoutPromise])
    console.log('✅ Redis connection test successful')
  } catch (error) {
    console.error('⚠️ Redis initialization failed:', error)
    throw error // Re-throw to be handled by caller
  }
}

// Initialize Redis on module load with proper error handling
let isRedisInitialized = false

async function ensureRedisConnection(): Promise<void> {
  if (!isRedisInitialized) {
    try {
      await initializeRedis()
      isRedisInitialized = true
    } catch (error) {
      console.error('Failed to initialize Redis. Application will continue without caching:', error)
      // Don't set isRedisInitialized to true, so we can retry later
    }
  }
}

// Initialize on module load
ensureRedisConnection().catch((err) => {
  console.error('Redis initialization error on module load:', err)
})

// Cache keys
export const CACHE_KEYS = {
  TRANSLATION: (text: string, mode: string) =>
    `translation:${mode}:${Buffer.from(text).toString('base64')}`,
  USER_TRANSLATIONS: (userId: string) => `user:${userId}:translations`,
  POPULAR_TRANSLATIONS: 'popular:translations',
  VOCABULARY: (userId: string) => `user:${userId}:vocabulary`,
  TRANSLATION_COUNT: (userId: string) => `user:${userId}:count`,
} as const

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  TRANSLATION: 60 * 60 * 24 * 7, // 7 days
  USER_DATA: 60 * 60 * 2, // 2 hours
  POPULAR_DATA: 60 * 60 * 6, // 6 hours
  VOCABULARY: 60 * 60 * 24, // 24 hours
} as const

export class TranslationCache {
  // Helper method to check if Redis is available
  private static isRedisAvailable(): boolean {
    return redis !== null && isRedisInitialized
  }

  // Cache translation result
  static async cacheTranslation(
    originalText: string,
    mode: 'simple' | 'detailed',
    result: unknown,
  ): Promise<void> {
    if (!this.isRedisAvailable()) {
      console.warn('Redis not available, skipping cache operation')
      return
    }

    try {
      const key = CACHE_KEYS.TRANSLATION(originalText, mode)
      await redis!.setex(key, CACHE_TTL.TRANSLATION, JSON.stringify(result))
    } catch (error) {
      console.error('Failed to cache translation:', error)
      // Don't throw error - graceful degradation
    }
  }

  // Get cached translation
  static async getCachedTranslation(
    originalText: string,
    mode: 'simple' | 'detailed',
  ): Promise<unknown | null> {
    if (!this.isRedisAvailable()) {
      return null
    }

    try {
      const key = CACHE_KEYS.TRANSLATION(originalText, mode)
      const cached = await redis!.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Failed to get cached translation:', error)
      // Return null for cache miss - graceful degradation
      return null
    }
  }

  // Cache user's recent translations
  static async cacheUserTranslations(userId: string, translations: unknown[]): Promise<void> {
    if (!this.isRedisAvailable()) {
      return
    }

    try {
      const key = CACHE_KEYS.USER_TRANSLATIONS(userId)
      await redis!.setex(key, CACHE_TTL.USER_DATA, JSON.stringify(translations))
    } catch (error) {
      console.error('Failed to cache user translations:', error)
    }
  }

  // Get user's cached translations
  static async getUserTranslations(userId: string): Promise<unknown[] | null> {
    if (!this.isRedisAvailable()) {
      return null
    }

    try {
      const key = CACHE_KEYS.USER_TRANSLATIONS(userId)
      const cached = await redis!.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Failed to get user translations:', error)
      return null
    }
  }

  // Increment translation count for analytics
  static async incrementTranslationCount(userId: string): Promise<number> {
    if (!this.isRedisAvailable()) {
      return 0
    }

    try {
      const key = CACHE_KEYS.TRANSLATION_COUNT(userId)
      return await redis!.incr(key)
    } catch (error) {
      console.error('Failed to increment translation count:', error)
      return 0
    }
  }

  // Cache popular translations
  static async cachePopularTranslations(translations: unknown[]): Promise<void> {
    if (!this.isRedisAvailable()) {
      return
    }

    try {
      const key = CACHE_KEYS.POPULAR_TRANSLATIONS
      await redis!.setex(key, CACHE_TTL.POPULAR_DATA, JSON.stringify(translations))
    } catch (error) {
      console.error('Failed to cache popular translations:', error)
    }
  }

  // Get popular translations
  static async getPopularTranslations(): Promise<unknown[] | null> {
    if (!this.isRedisAvailable()) {
      return null
    }

    try {
      const key = CACHE_KEYS.POPULAR_TRANSLATIONS
      const cached = await redis!.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Failed to get popular translations:', error)
      return null
    }
  }

  // Cache user vocabulary
  static async cacheUserVocabulary(userId: string, vocabulary: unknown[]): Promise<void> {
    if (!this.isRedisAvailable()) {
      return
    }

    try {
      const key = CACHE_KEYS.VOCABULARY(userId)
      await redis!.setex(key, CACHE_TTL.VOCABULARY, JSON.stringify(vocabulary))
    } catch (error) {
      console.error('Failed to cache vocabulary:', error)
    }
  }

  // Get cached vocabulary
  static async getUserVocabulary(userId: string): Promise<unknown[] | null> {
    if (!this.isRedisAvailable()) {
      return null
    }

    try {
      const key = CACHE_KEYS.VOCABULARY(userId)
      const cached = await redis!.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Failed to get vocabulary:', error)
      return null
    }
  }

  // Cache vocabulary stats
  static async cacheVocabularyStats(userId: string, stats: Record<string, unknown>): Promise<void> {
    if (!this.isRedisAvailable()) {
      return
    }

    try {
      const key = `${CACHE_KEYS.VOCABULARY(userId)}:stats`
      await redis!.setex(key, CACHE_TTL.USER_DATA, JSON.stringify(stats))
    } catch (error) {
      console.error('Failed to cache vocabulary stats:', error)
    }
  }

  // Get cached vocabulary stats
  static async getVocabularyStats(userId: string): Promise<Record<string, unknown> | null> {
    if (!this.isRedisAvailable()) {
      return null
    }

    try {
      const key = `${CACHE_KEYS.VOCABULARY(userId)}:stats`
      const cached = await redis!.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Failed to get vocabulary stats:', error)
      return null
    }
  }

  // Cache practice words
  static async cachePracticeWords(
    userId: string,
    options: Record<string, unknown>,
    words: unknown[],
  ): Promise<void> {
    if (!this.isRedisAvailable()) {
      return
    }

    try {
      const optionsKey = Buffer.from(JSON.stringify(options)).toString('base64')
      const key = `user:${userId}:practice:${optionsKey}`
      await redis!.setex(key, CACHE_TTL.USER_DATA, JSON.stringify(words))
    } catch (error) {
      console.error('Failed to cache practice words:', error)
    }
  }

  // Get cached practice words
  static async getPracticeWords(
    userId: string,
    options: Record<string, unknown>,
  ): Promise<unknown[] | null> {
    if (!this.isRedisAvailable()) {
      return null
    }

    try {
      const optionsKey = Buffer.from(JSON.stringify(options)).toString('base64')
      const key = `user:${userId}:practice:${optionsKey}`
      const cached = await redis!.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Failed to get practice words:', error)
      return null
    }
  }

  // Clear user cache when data is updated
  static async clearUserCache(userId: string): Promise<void> {
    if (!this.isRedisAvailable()) {
      return
    }

    try {
      const keys = [CACHE_KEYS.USER_TRANSLATIONS(userId), CACHE_KEYS.VOCABULARY(userId)]
      await redis!.del(...keys)
    } catch (error) {
      console.error('Failed to clear user cache:', error)
    }
  }

  // Clear all cache (for maintenance)
  static async clearAllCache(): Promise<void> {
    if (!this.isRedisAvailable()) {
      return
    }

    try {
      await redis!.flushall()
    } catch (error) {
      console.error('Failed to clear all cache:', error)
    }
  }
}

// Export Redis instance (can be null if not initialized)
export default redis

// Export helper function to get Redis status
export function getRedisStatus(): { connected: boolean; initialized: boolean } {
  return {
    connected: redis !== null,
    initialized: isRedisInitialized,
  }
}
