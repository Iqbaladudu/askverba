/**
 * Comprehensive retry strategy for API calls and operations
 * Implements exponential backoff, circuit breaker, and intelligent retry logic
 */

// Types
export interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  jitter?: boolean
  retryCondition?: (error: unknown, attempt: number) => boolean
  onRetry?: (error: unknown, attempt: number) => void
  timeout?: number
}

export interface CircuitBreakerOptions {
  failureThreshold?: number
  resetTimeout?: number
  monitoringPeriod?: number
}

// Circuit breaker states
enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

// Circuit breaker implementation
class CircuitBreaker {
  private state = CircuitState.CLOSED
  private failureCount = 0
  private lastFailureTime = 0
  private successCount = 0

  constructor(private options: CircuitBreakerOptions = {}) {
    this.options.failureThreshold = options.failureThreshold || 5
    this.options.resetTimeout = options.resetTimeout || 60000 // 1 minute
    this.options.monitoringPeriod = options.monitoringPeriod || 10000 // 10 seconds
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.options.resetTimeout!) {
        this.state = CircuitState.HALF_OPEN
        this.successCount = 0
        console.log('[CIRCUIT BREAKER] Transitioning to HALF_OPEN state')
      } else {
        throw new Error('Circuit breaker is OPEN - operation not allowed')
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failureCount = 0
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++
      if (this.successCount >= 3) { // Require 3 successes to close
        this.state = CircuitState.CLOSED
        console.log('[CIRCUIT BREAKER] Transitioning to CLOSED state')
      }
    }
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.options.failureThreshold!) {
      this.state = CircuitState.OPEN
      console.log('[CIRCUIT BREAKER] Transitioning to OPEN state')
    }
  }

  getState(): CircuitState {
    return this.state
  }

  getStats(): {
    state: CircuitState
    failureCount: number
    successCount: number
    lastFailureTime: number
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    }
  }
}

// Global circuit breakers for different services
const circuitBreakers = new Map<string, CircuitBreaker>()

function getCircuitBreaker(service: string): CircuitBreaker {
  if (!circuitBreakers.has(service)) {
    circuitBreakers.set(service, new CircuitBreaker())
  }
  return circuitBreakers.get(service)!
}

/**
 * Default retry condition - determines if an error should be retried
 */
function defaultRetryCondition(error: unknown, attempt: number): boolean {
  // Don't retry after max attempts
  if (attempt >= 5) return false

  // Handle different error types
  if (error && typeof error === 'object') {
    // HTTP errors
    if ('status' in error) {
      const status = (error as any).status
      
      // Don't retry client errors (4xx) except for specific cases
      if (status >= 400 && status < 500) {
        // Retry on rate limiting and request timeout
        return status === 429 || status === 408
      }
      
      // Retry server errors (5xx)
      if (status >= 500) return true
    }

    // Network errors
    if ('code' in error) {
      const code = (error as any).code
      const retryableCodes = [
        'ECONNRESET',
        'ECONNREFUSED',
        'ETIMEDOUT',
        'ENOTFOUND',
        'EAI_AGAIN',
      ]
      return retryableCodes.includes(code)
    }

    // Timeout errors
    if ('name' in error && (error as any).name === 'AbortError') {
      return true
    }
  }

  // Retry on generic errors for first few attempts
  return attempt < 3
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  backoffFactor: number,
  jitter: boolean
): number {
  let delay = baseDelay * Math.pow(backoffFactor, attempt - 1)
  
  // Apply maximum delay limit
  delay = Math.min(delay, maxDelay)
  
  // Add jitter to prevent thundering herd
  if (jitter) {
    delay = delay * (0.5 + Math.random() * 0.5)
  }
  
  return Math.floor(delay)
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry wrapper with exponential backoff and circuit breaker
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
  serviceName: string = 'default'
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    jitter = true,
    retryCondition = defaultRetryCondition,
    onRetry,
    timeout,
  } = options

  const circuitBreaker = getCircuitBreaker(serviceName)
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Wrap operation with circuit breaker and optional timeout
      const wrappedOperation = async () => {
        if (timeout) {
          return Promise.race([
            operation(),
            new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('Operation timeout')), timeout)
            }),
          ])
        }
        return operation()
      }

      const result = await circuitBreaker.execute(wrappedOperation)
      
      // Log successful retry
      if (attempt > 1) {
        console.log(`[RETRY] Operation succeeded on attempt ${attempt}`)
      }
      
      return result
    } catch (error) {
      lastError = error
      
      console.warn(`[RETRY] Attempt ${attempt} failed:`, error)

      // Check if we should retry
      if (attempt === maxAttempts || !retryCondition(error, attempt)) {
        console.error(`[RETRY] Max attempts reached or retry condition failed`)
        break
      }

      // Calculate delay for next attempt
      const delay = calculateDelay(attempt, baseDelay, maxDelay, backoffFactor, jitter)
      
      console.log(`[RETRY] Retrying in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`)
      
      // Call retry callback
      if (onRetry) {
        try {
          onRetry(error, attempt)
        } catch (callbackError) {
          console.warn('[RETRY] Retry callback failed:', callbackError)
        }
      }

      // Wait before next attempt
      await sleep(delay)
    }
  }

  // All attempts failed
  throw lastError
}

/**
 * Retry wrapper specifically for API calls
 */
export async function withApiRetry<T>(
  apiCall: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  return withRetry(
    apiCall,
    {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
      jitter: true,
      timeout: 30000, // 30 second timeout
      retryCondition: (error, attempt) => {
        // Custom retry logic for API calls
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status
          
          // Always retry on server errors
          if (status >= 500) return true
          
          // Retry on rate limiting
          if (status === 429) return true
          
          // Retry on request timeout
          if (status === 408) return true
          
          // Don't retry other client errors
          if (status >= 400) return false
        }
        
        // Retry network errors for first 2 attempts
        return attempt <= 2
      },
      onRetry: (error, attempt) => {
        console.log(`[API RETRY] Retrying API call (attempt ${attempt})`, {
          error: error instanceof Error ? error.message : error,
        })
      },
      ...options,
    },
    'api'
  )
}

/**
 * Retry wrapper for database operations
 */
export async function withDbRetry<T>(
  dbOperation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  return withRetry(
    dbOperation,
    {
      maxAttempts: 5,
      baseDelay: 500,
      maxDelay: 5000,
      backoffFactor: 1.5,
      jitter: true,
      timeout: 10000, // 10 second timeout
      retryCondition: (error, attempt) => {
        // Retry on connection errors and timeouts
        if (error && typeof error === 'object') {
          const message = (error as any).message || ''
          const code = (error as any).code || ''
          
          // MongoDB/Database specific errors
          const retryableErrors = [
            'ECONNRESET',
            'ECONNREFUSED',
            'ETIMEDOUT',
            'MongoNetworkError',
            'MongoTimeoutError',
            'connection timed out',
            'connection refused',
          ]
          
          return retryableErrors.some(err => 
            message.includes(err) || code.includes(err)
          )
        }
        
        return attempt <= 3
      },
      onRetry: (error, attempt) => {
        console.log(`[DB RETRY] Retrying database operation (attempt ${attempt})`, {
          error: error instanceof Error ? error.message : error,
        })
      },
      ...options,
    },
    'database'
  )
}

/**
 * Get circuit breaker statistics
 */
export function getCircuitBreakerStats(): Record<string, any> {
  const stats: Record<string, any> = {}
  
  for (const [service, breaker] of circuitBreakers.entries()) {
    stats[service] = breaker.getStats()
  }
  
  return stats
}

/**
 * Reset circuit breaker for a service
 */
export function resetCircuitBreaker(service: string): void {
  circuitBreakers.delete(service)
  console.log(`[CIRCUIT BREAKER] Reset circuit breaker for service: ${service}`)
}

/**
 * Reset all circuit breakers
 */
export function resetAllCircuitBreakers(): void {
  circuitBreakers.clear()
  console.log('[CIRCUIT BREAKER] Reset all circuit breakers')
}
