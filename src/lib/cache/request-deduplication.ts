/**
 * Request deduplication utilities
 * Prevents multiple identical requests from being executed simultaneously
 */

// Types
interface PendingRequest<T = unknown> {
  promise: Promise<T>
  timestamp: number
  requestCount: number
}

interface DeduplicationOptions {
  ttl?: number // Time to live for pending requests (ms)
  maxConcurrent?: number // Maximum concurrent requests for same key
  keyGenerator?: (...args: unknown[]) => string
}

// Global pending requests map
const pendingRequests = new Map<string, PendingRequest>()

// Cleanup interval for expired requests
const CLEANUP_INTERVAL = 60000 // 1 minute
let cleanupTimer: NodeJS.Timeout | null = null

/**
 * Default key generator for request deduplication
 */
function defaultKeyGenerator(...args: unknown[]): string {
  return JSON.stringify(args)
}

/**
 * Clean up expired pending requests
 */
function cleanupExpiredRequests(): void {
  const now = Date.now()
  const expiredKeys: string[] = []

  for (const [key, request] of pendingRequests.entries()) {
    // Default TTL of 30 seconds for pending requests
    if (now - request.timestamp > 30000) {
      expiredKeys.push(key)
    }
  }

  for (const key of expiredKeys) {
    pendingRequests.delete(key)
  }

  if (expiredKeys.length > 0) {
    console.log(`[DEDUP] Cleaned up ${expiredKeys.length} expired requests`)
  }
}

/**
 * Start cleanup timer
 */
function startCleanupTimer(): void {
  if (!cleanupTimer) {
    cleanupTimer = setInterval(cleanupExpiredRequests, CLEANUP_INTERVAL)
  }
}

/**
 * Stop cleanup timer
 */
function stopCleanupTimer(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer)
    cleanupTimer = null
  }
}

// Start cleanup timer on module load
startCleanupTimer()

/**
 * Create a deduplicated function wrapper
 */
export function createDeduplicatedFunction<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  options: DeduplicationOptions = {}
): (...args: T) => Promise<R> {
  const {
    ttl = 30000, // 30 seconds default TTL
    maxConcurrent = 10,
    keyGenerator = defaultKeyGenerator,
  } = options

  return async (...args: T): Promise<R> => {
    // Generate unique key for this request
    const key = `${fn.name || 'anonymous'}:${keyGenerator(...args)}`
    
    // Check if there's already a pending request
    const existing = pendingRequests.get(key)
    
    if (existing) {
      // Check if request is still valid (not expired)
      if (Date.now() - existing.timestamp < ttl) {
        // Check concurrent request limit
        if (existing.requestCount < maxConcurrent) {
          existing.requestCount++
          console.log(`[DEDUP] Joining existing request: ${key} (count: ${existing.requestCount})`)
          
          try {
            const result = await existing.promise
            existing.requestCount--
            return result
          } catch (error) {
            existing.requestCount--
            throw error
          }
        } else {
          console.warn(`[DEDUP] Max concurrent requests reached for: ${key}`)
          // Fall through to create new request
        }
      } else {
        // Request expired, remove it
        pendingRequests.delete(key)
      }
    }

    // Create new request
    console.log(`[DEDUP] Creating new request: ${key}`)
    
    const promise = fn(...args)
    const pendingRequest: PendingRequest<R> = {
      promise,
      timestamp: Date.now(),
      requestCount: 1,
    }

    pendingRequests.set(key, pendingRequest as PendingRequest)

    try {
      const result = await promise
      
      // Clean up completed request
      pendingRequests.delete(key)
      
      return result
    } catch (error) {
      // Clean up failed request
      pendingRequests.delete(key)
      throw error
    }
  }
}

/**
 * Deduplicated API client wrapper
 */
export function createDeduplicatedApiCall<T extends unknown[], R>(
  apiCall: (...args: T) => Promise<R>,
  options: DeduplicationOptions = {}
): (...args: T) => Promise<R> {
  return createDeduplicatedFunction(apiCall, {
    ttl: 10000, // 10 seconds for API calls
    maxConcurrent: 5,
    ...options,
  })
}

/**
 * Deduplicated database query wrapper
 */
export function createDeduplicatedQuery<T extends unknown[], R>(
  query: (...args: T) => Promise<R>,
  options: DeduplicationOptions = {}
): (...args: T) => Promise<R> {
  return createDeduplicatedFunction(query, {
    ttl: 5000, // 5 seconds for database queries
    maxConcurrent: 3,
    ...options,
  })
}

/**
 * Deduplicated translation wrapper
 */
export function createDeduplicatedTranslation<T extends unknown[], R>(
  translateFn: (...args: T) => Promise<R>,
  options: DeduplicationOptions = {}
): (...args: T) => Promise<R> {
  return createDeduplicatedFunction(translateFn, {
    ttl: 60000, // 1 minute for translations (they take longer)
    maxConcurrent: 2, // Limit concurrent translations
    keyGenerator: (text: unknown, mode: unknown) => {
      // Custom key generator for translations
      const textStr = typeof text === 'string' ? text : JSON.stringify(text)
      const modeStr = typeof mode === 'string' ? mode : JSON.stringify(mode)
      return `${textStr.substring(0, 100)}:${modeStr}` // Limit text length in key
    },
    ...options,
  })
}

/**
 * Batch request processor for multiple similar requests
 */
export class BatchProcessor<T, R> {
  private batch: Array<{
    args: T
    resolve: (value: R) => void
    reject: (error: unknown) => void
  }> = []
  
  private timer: NodeJS.Timeout | null = null
  private processing = false

  constructor(
    private processor: (items: T[]) => Promise<R[]>,
    private options: {
      batchSize?: number
      batchTimeout?: number
    } = {}
  ) {
    this.options.batchSize = options.batchSize || 10
    this.options.batchTimeout = options.batchTimeout || 100 // 100ms
  }

  async add(args: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this.batch.push({ args, resolve, reject })

      // Process immediately if batch is full
      if (this.batch.length >= this.options.batchSize!) {
        this.processBatch()
      } else {
        // Set timer for batch timeout
        if (!this.timer) {
          this.timer = setTimeout(() => {
            this.processBatch()
          }, this.options.batchTimeout)
        }
      }
    })
  }

  private async processBatch(): Promise<void> {
    if (this.processing || this.batch.length === 0) {
      return
    }

    this.processing = true

    // Clear timer
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    // Take current batch
    const currentBatch = this.batch.splice(0)
    
    try {
      const args = currentBatch.map(item => item.args)
      const results = await this.processor(args)

      // Resolve all promises
      currentBatch.forEach((item, index) => {
        if (results[index] !== undefined) {
          item.resolve(results[index])
        } else {
          item.reject(new Error('No result for batch item'))
        }
      })
    } catch (error) {
      // Reject all promises
      currentBatch.forEach(item => {
        item.reject(error)
      })
    } finally {
      this.processing = false

      // Process remaining items if any
      if (this.batch.length > 0) {
        this.processBatch()
      }
    }
  }
}

/**
 * Utility functions for managing deduplication
 */
export const deduplicationUtils = {
  // Get current pending requests count
  getPendingRequestsCount(): number {
    return pendingRequests.size
  },

  // Get pending requests info
  getPendingRequestsInfo(): Array<{ key: string; timestamp: number; requestCount: number }> {
    return Array.from(pendingRequests.entries()).map(([key, request]) => ({
      key,
      timestamp: request.timestamp,
      requestCount: request.requestCount,
    }))
  },

  // Clear all pending requests (useful for testing)
  clearPendingRequests(): void {
    pendingRequests.clear()
  },

  // Force cleanup of expired requests
  forceCleanup(): void {
    cleanupExpiredRequests()
  },

  // Get deduplication statistics
  getStats(): {
    pendingCount: number
    oldestRequest: number | null
    totalRequestCount: number
  } {
    const now = Date.now()
    let oldestRequest: number | null = null
    let totalRequestCount = 0

    for (const request of pendingRequests.values()) {
      if (oldestRequest === null || request.timestamp < oldestRequest) {
        oldestRequest = request.timestamp
      }
      totalRequestCount += request.requestCount
    }

    return {
      pendingCount: pendingRequests.size,
      oldestRequest: oldestRequest ? now - oldestRequest : null,
      totalRequestCount,
    }
  },
}

// Cleanup on process exit
process.on('exit', () => {
  stopCleanupTimer()
})

process.on('SIGINT', () => {
  stopCleanupTimer()
  process.exit(0)
})

process.on('SIGTERM', () => {
  stopCleanupTimer()
  process.exit(0)
})
