// Note: Install ioredis first: npm install ioredis @types/ioredis
import { Redis } from 'ioredis'

// Temporary mock implementation until Redis is installed
class MockRedis {
  async setex(key: string, ttl: number, value: string): Promise<void> {
    console.log(`[MOCK REDIS] SET ${key} (TTL: ${ttl}s):`, value.substring(0, 100) + '...')
  }

  async get(key: string): Promise<string | null> {
    console.log(`[MOCK REDIS] GET ${key}: null (not implemented)`)
    return null
  }

  async incr(key: string): Promise<number> {
    console.log(`[MOCK REDIS] INCR ${key}: 1`)
    return 1
  }

  async del(...keys: string[]): Promise<number> {
    console.log(`[MOCK REDIS] DEL:`, keys)
    return keys.length
  }

  async flushall(): Promise<void> {
    console.log(`[MOCK REDIS] FLUSHALL`)
  }
}

// Redis client configuration with error handling
let redis: Redis | MockRedis

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
    lazyConnect: true, // Don't connect immediately
    connectTimeout: 5000,
    commandTimeout: 5000,
  })

  // Test connection
  redis.on('error', (err) => {
    console.warn('Redis connection error, falling back to mock:', err.message)
    redis = new MockRedis()
  })

  redis.on('connect', () => {
    console.log('Redis connected successfully')
  })
} catch (error) {
  console.warn('Redis initialization failed, using mock Redis:', error)
  redis = new MockRedis()
}

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
  // Cache translation result
  static async cacheTranslation(
    originalText: string,
    mode: 'simple' | 'detailed',
    result: any,
  ): Promise<void> {
    try {
      const key = CACHE_KEYS.TRANSLATION(originalText, mode)
      await redis.setex(key, CACHE_TTL.TRANSLATION, JSON.stringify(result))
    } catch (error) {
      console.error('Failed to cache translation:', error)
      // Don't throw error - graceful degradation
    }
  }

  // Get cached translation
  static async getCachedTranslation(
    originalText: string,
    mode: 'simple' | 'detailed',
  ): Promise<any | null> {
    try {
      const key = CACHE_KEYS.TRANSLATION(originalText, mode)
      const cached = await redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Failed to get cached translation:', error)
      // Return null for cache miss - graceful degradation
      return null
    }
  }

  // Cache user's recent translations
  static async cacheUserTranslations(userId: string, translations: any[]): Promise<void> {
    try {
      const key = CACHE_KEYS.USER_TRANSLATIONS(userId)
      await redis.setex(key, CACHE_TTL.USER_DATA, JSON.stringify(translations))
    } catch (error) {
      console.error('Failed to cache user translations:', error)
    }
  }

  // Get user's cached translations
  static async getUserTranslations(userId: string): Promise<any[] | null> {
    try {
      const key = CACHE_KEYS.USER_TRANSLATIONS(userId)
      const cached = await redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Failed to get user translations:', error)
      return null
    }
  }

  // Increment translation count for analytics
  static async incrementTranslationCount(userId: string): Promise<number> {
    try {
      const key = CACHE_KEYS.TRANSLATION_COUNT(userId)
      return await redis.incr(key)
    } catch (error) {
      console.error('Failed to increment translation count:', error)
      return 0
    }
  }

  // Cache popular translations
  static async cachePopularTranslations(translations: any[]): Promise<void> {
    try {
      const key = CACHE_KEYS.POPULAR_TRANSLATIONS
      await redis.setex(key, CACHE_TTL.POPULAR_DATA, JSON.stringify(translations))
    } catch (error) {
      console.error('Failed to cache popular translations:', error)
    }
  }

  // Get popular translations
  static async getPopularTranslations(): Promise<any[] | null> {
    try {
      const key = CACHE_KEYS.POPULAR_TRANSLATIONS
      const cached = await redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Failed to get popular translations:', error)
      return null
    }
  }

  // Cache user vocabulary
  static async cacheUserVocabulary(userId: string, vocabulary: any[]): Promise<void> {
    try {
      const key = CACHE_KEYS.VOCABULARY(userId)
      await redis.setex(key, CACHE_TTL.VOCABULARY, JSON.stringify(vocabulary))
    } catch (error) {
      console.error('Failed to cache vocabulary:', error)
    }
  }

  // Get cached vocabulary
  static async getUserVocabulary(userId: string): Promise<any[] | null> {
    try {
      const key = CACHE_KEYS.VOCABULARY(userId)
      const cached = await redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Failed to get vocabulary:', error)
      return null
    }
  }

  // Cache vocabulary stats
  static async cacheVocabularyStats(userId: string, stats: any): Promise<void> {
    try {
      const key = `${CACHE_KEYS.VOCABULARY(userId)}:stats`
      await redis.setex(key, CACHE_TTL.USER_DATA, JSON.stringify(stats))
    } catch (error) {
      console.error('Failed to cache vocabulary stats:', error)
    }
  }

  // Get cached vocabulary stats
  static async getVocabularyStats(userId: string): Promise<any | null> {
    try {
      const key = `${CACHE_KEYS.VOCABULARY(userId)}:stats`
      const cached = await redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Failed to get vocabulary stats:', error)
      return null
    }
  }

  // Cache practice words
  static async cachePracticeWords(userId: string, options: any, words: any[]): Promise<void> {
    try {
      const optionsKey = Buffer.from(JSON.stringify(options)).toString('base64')
      const key = `user:${userId}:practice:${optionsKey}`
      await redis.setex(key, CACHE_TTL.USER_DATA, JSON.stringify(words))
    } catch (error) {
      console.error('Failed to cache practice words:', error)
    }
  }

  // Get cached practice words
  static async getPracticeWords(userId: string, options: any): Promise<any[] | null> {
    try {
      const optionsKey = Buffer.from(JSON.stringify(options)).toString('base64')
      const key = `user:${userId}:practice:${optionsKey}`
      const cached = await redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Failed to get practice words:', error)
      return null
    }
  }

  // Clear user cache when data is updated
  static async clearUserCache(userId: string): Promise<void> {
    try {
      const keys = [CACHE_KEYS.USER_TRANSLATIONS(userId), CACHE_KEYS.VOCABULARY(userId)]
      await redis.del(...keys)
    } catch (error) {
      console.error('Failed to clear user cache:', error)
    }
  }

  // Clear all cache (for maintenance)
  static async clearAllCache(): Promise<void> {
    try {
      await redis.flushall()
    } catch (error) {
      console.error('Failed to clear all cache:', error)
    }
  }
}

export default redis
