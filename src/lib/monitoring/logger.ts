/**
 * Enhanced logging system with structured logging and multiple outputs
 * Provides consistent logging across the application with proper formatting
 */

// Types
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  metadata?: Record<string, unknown>
  error?: {
    name: string
    message: string
    stack?: string
  }
  requestId?: string
  userId?: string
  sessionId?: string
}

interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableStorage: boolean
  enableRemote: boolean
  maxStoredLogs: number
  remoteEndpoint?: string
}

// Log levels with numeric values for comparison
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  enableConsole: true,
  enableStorage: typeof window !== 'undefined',
  enableRemote: process.env.NODE_ENV === 'production',
  maxStoredLogs: 1000,
  remoteEndpoint: '/api/logs',
}

// Logger class
class Logger {
  private config: LoggerConfig
  private logs: LogEntry[] = []
  private flushTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    
    // Start periodic flush for remote logging
    if (this.config.enableRemote) {
      this.startPeriodicFlush()
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level]
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      metadata,
    }

    // Add error details if provided
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }

    // Add request context if available
    if (typeof window !== 'undefined') {
      entry.sessionId = this.getSessionId()
    }

    // Add user context if available (you might want to get this from auth context)
    // entry.userId = getCurrentUserId()

    return entry
  }

  private formatConsoleMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    const level = entry.level.toUpperCase().padEnd(5)
    const context = entry.context ? `[${entry.context}]` : ''
    
    return `${timestamp} ${level} ${context} ${entry.message}`
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return

    const message = this.formatConsoleMessage(entry)
    const data = entry.metadata || entry.error ? [entry.metadata, entry.error].filter(Boolean) : []

    switch (entry.level) {
      case 'debug':
        console.debug(message, ...data)
        break
      case 'info':
        console.info(message, ...data)
        break
      case 'warn':
        console.warn(message, ...data)
        break
      case 'error':
      case 'fatal':
        console.error(message, ...data)
        break
    }
  }

  private storeLog(entry: LogEntry): void {
    if (!this.config.enableStorage) return

    this.logs.push(entry)

    // Remove old logs if we exceed the limit
    if (this.logs.length > this.config.maxStoredLogs) {
      this.logs.splice(0, this.logs.length - this.config.maxStoredLogs)
    }

    // Store in localStorage for persistence
    try {
      const storedLogs = this.logs.slice(-100) // Keep only last 100 logs in localStorage
      localStorage.setItem('app_logs', JSON.stringify(storedLogs))
    } catch (error) {
      console.warn('Failed to store logs in localStorage:', error)
    }
  }

  private async sendToRemote(entries: LogEntry[]): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: entries }),
      })
    } catch (error) {
      console.error('Failed to send logs to remote endpoint:', error)
    }
  }

  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, 30000) // Flush every 30 seconds
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server'
    
    let sessionId = sessionStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }

  // Public logging methods
  debug(message: string, context?: string, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return

    const entry = this.createLogEntry('debug', message, context, metadata)
    this.logToConsole(entry)
    this.storeLog(entry)
  }

  info(message: string, context?: string, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return

    const entry = this.createLogEntry('info', message, context, metadata)
    this.logToConsole(entry)
    this.storeLog(entry)
  }

  warn(message: string, context?: string, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return

    const entry = this.createLogEntry('warn', message, context, metadata)
    this.logToConsole(entry)
    this.storeLog(entry)
  }

  error(message: string, error?: Error, context?: string, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return

    const entry = this.createLogEntry('error', message, context, metadata, error)
    this.logToConsole(entry)
    this.storeLog(entry)

    // Send critical errors immediately
    if (this.config.enableRemote) {
      this.sendToRemote([entry]).catch(console.error)
    }
  }

  fatal(message: string, error?: Error, context?: string, metadata?: Record<string, unknown>): void {
    const entry = this.createLogEntry('fatal', message, context, metadata, error)
    this.logToConsole(entry)
    this.storeLog(entry)

    // Send fatal errors immediately
    if (this.config.enableRemote) {
      this.sendToRemote([entry]).catch(console.error)
    }
  }

  // Utility methods
  getLogs(filter?: {
    level?: LogLevel
    context?: string
    since?: Date
    limit?: number
  }): LogEntry[] {
    let filtered = this.logs

    if (filter) {
      if (filter.level) {
        const minLevel = LOG_LEVELS[filter.level]
        filtered = filtered.filter(log => LOG_LEVELS[log.level] >= minLevel)
      }

      if (filter.context) {
        filtered = filtered.filter(log => log.context?.includes(filter.context!))
      }

      if (filter.since) {
        const sinceTime = filter.since.getTime()
        filtered = filtered.filter(log => new Date(log.timestamp).getTime() >= sinceTime)
      }

      if (filter.limit) {
        filtered = filtered.slice(-filter.limit)
      }
    }

    return filtered
  }

  getStoredLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem('app_logs')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  clearLogs(): void {
    this.logs = []
    try {
      localStorage.removeItem('app_logs')
    } catch (error) {
      console.warn('Failed to clear stored logs:', error)
    }
  }

  flush(): void {
    if (this.logs.length === 0) return

    // Send logs to remote endpoint
    if (this.config.enableRemote) {
      this.sendToRemote([...this.logs]).catch(console.error)
    }

    // Clear logs after flushing
    this.logs = []
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    this.flush()
  }
}

// Global logger instance
export const logger = new Logger()

// Convenience functions for common logging patterns
export const log = {
  // API logging
  api: {
    request: (method: string, url: string, metadata?: Record<string, unknown>) => {
      logger.debug(`API Request: ${method} ${url}`, 'API', metadata)
    },
    response: (method: string, url: string, status: number, duration: number) => {
      const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info'
      logger[level](`API Response: ${method} ${url} - ${status} (${duration}ms)`, 'API', {
        method,
        url,
        status,
        duration,
      })
    },
    error: (method: string, url: string, error: Error, metadata?: Record<string, unknown>) => {
      logger.error(`API Error: ${method} ${url}`, error, 'API', { method, url, ...metadata })
    },
  },

  // User action logging
  user: {
    action: (action: string, metadata?: Record<string, unknown>) => {
      logger.info(`User Action: ${action}`, 'USER', metadata)
    },
    error: (action: string, error: Error, metadata?: Record<string, unknown>) => {
      logger.error(`User Action Error: ${action}`, error, 'USER', metadata)
    },
  },

  // Database logging
  db: {
    query: (operation: string, collection: string, duration?: number) => {
      logger.debug(`DB Query: ${operation} on ${collection}${duration ? ` (${duration}ms)` : ''}`, 'DB')
    },
    error: (operation: string, collection: string, error: Error) => {
      logger.error(`DB Error: ${operation} on ${collection}`, error, 'DB')
    },
  },

  // Cache logging
  cache: {
    hit: (key: string, source: string = 'unknown') => {
      logger.debug(`Cache Hit: ${key} from ${source}`, 'CACHE')
    },
    miss: (key: string, source: string = 'unknown') => {
      logger.debug(`Cache Miss: ${key} from ${source}`, 'CACHE')
    },
    set: (key: string, source: string = 'unknown', ttl?: number) => {
      logger.debug(`Cache Set: ${key} to ${source}${ttl ? ` (TTL: ${ttl}s)` : ''}`, 'CACHE')
    },
    error: (operation: string, key: string, error: Error) => {
      logger.error(`Cache Error: ${operation} for ${key}`, error, 'CACHE')
    },
  },

  // Performance logging
  performance: {
    slow: (operation: string, duration: number, threshold: number = 1000) => {
      if (duration > threshold) {
        logger.warn(`Slow Operation: ${operation} took ${duration}ms`, 'PERFORMANCE', {
          operation,
          duration,
          threshold,
        })
      }
    },
    memory: (usage: number, limit: number) => {
      const percentage = (usage / limit) * 100
      const level = percentage > 80 ? 'warn' : 'info'
      logger[level](`Memory Usage: ${usage.toFixed(2)}MB (${percentage.toFixed(1)}%)`, 'MEMORY', {
        usage,
        limit,
        percentage,
      })
    },
  },
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    logger.flush()
  })
}

// Export logger class for custom instances
export { Logger, LogLevel, LogEntry, LoggerConfig }
