/**
 * Application Logger
 * Centralized logging utility with different levels and contexts
 */

import { monitoringConfig } from '../config/app.config'

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Log entry structure
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: string
  metadata?: Record<string, unknown>
  error?: Error
  requestId?: string
  userId?: string
}

// Logger configuration
export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableFile: boolean
  enableRemote: boolean
  format: 'json' | 'text'
  includeStackTrace: boolean
}

// Default logger configuration
const defaultConfig: LoggerConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: false,
  enableRemote: false,
  format: 'json',
  includeStackTrace: true,
}

// Logger class
export class Logger {
  private config: LoggerConfig
  private context?: string

  constructor(context?: string, config: Partial<LoggerConfig> = {}) {
    this.context = context
    this.config = { ...defaultConfig, ...config }
    
    // Set log level from environment
    const envLevel = monitoringConfig.logging.level
    switch (envLevel) {
      case 'error':
        this.config.level = LogLevel.ERROR
        break
      case 'warn':
        this.config.level = LogLevel.WARN
        break
      case 'info':
        this.config.level = LogLevel.INFO
        break
      case 'debug':
        this.config.level = LogLevel.DEBUG
        break
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(context: string, metadata?: Record<string, unknown>): Logger {
    const childContext = this.context ? `${this.context}:${context}` : context
    const childLogger = new Logger(childContext, this.config)
    if (metadata) {
      childLogger.setDefaultMetadata(metadata)
    }
    return childLogger
  }

  private defaultMetadata: Record<string, unknown> = {}

  /**
   * Set default metadata for all log entries
   */
  setDefaultMetadata(metadata: Record<string, unknown>): void {
    this.defaultMetadata = { ...this.defaultMetadata, ...metadata }
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level
  }

  /**
   * Create a log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      metadata: { ...this.defaultMetadata, ...metadata },
      error,
    }
  }

  /**
   * Format log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    if (this.config.format === 'json') {
      return JSON.stringify({
        ...entry,
        level: LogLevel[entry.level],
        error: entry.error ? {
          name: entry.error.name,
          message: entry.error.message,
          stack: this.config.includeStackTrace ? entry.error.stack : undefined,
        } : undefined,
      })
    } else {
      const levelName = LogLevel[entry.level].padEnd(5)
      const context = entry.context ? `[${entry.context}] ` : ''
      const metadata = entry.metadata && Object.keys(entry.metadata).length > 0 
        ? ` ${JSON.stringify(entry.metadata)}` 
        : ''
      const errorInfo = entry.error 
        ? `\n${entry.error.name}: ${entry.error.message}${this.config.includeStackTrace ? `\n${entry.error.stack}` : ''}` 
        : ''
      
      return `${entry.timestamp} ${levelName} ${context}${entry.message}${metadata}${errorInfo}`
    }
  }

  /**
   * Output log entry
   */
  private output(entry: LogEntry): void {
    const formatted = this.formatLogEntry(entry)

    // Console output
    if (this.config.enableConsole) {
      switch (entry.level) {
        case LogLevel.ERROR:
          console.error(formatted)
          break
        case LogLevel.WARN:
          console.warn(formatted)
          break
        case LogLevel.INFO:
          console.info(formatted)
          break
        case LogLevel.DEBUG:
          console.debug(formatted)
          break
      }
    }

    // File output (would be implemented with fs in Node.js environment)
    if (this.config.enableFile) {
      // TODO: Implement file logging
    }

    // Remote logging (would integrate with services like Sentry, LogRocket, etc.)
    if (this.config.enableRemote) {
      // TODO: Implement remote logging
    }
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, metadata, error)
    this.output(entry)
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.WARN)) return
    
    const entry = this.createLogEntry(LogLevel.WARN, message, metadata)
    this.output(entry)
  }

  /**
   * Log an info message
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.INFO)) return
    
    const entry = this.createLogEntry(LogLevel.INFO, message, metadata)
    this.output(entry)
  }

  /**
   * Log a debug message
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, metadata)
    this.output(entry)
  }

  /**
   * Log with custom level
   */
  log(level: LogLevel, message: string, metadata?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog(level)) return
    
    const entry = this.createLogEntry(level, message, metadata, error)
    this.output(entry)
  }

  /**
   * Time a function execution
   */
  async time<T>(
    label: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const start = Date.now()
    this.debug(`Starting ${label}`, metadata)
    
    try {
      const result = await fn()
      const duration = Date.now() - start
      this.info(`Completed ${label}`, { ...metadata, duration })
      return result
    } catch (error) {
      const duration = Date.now() - start
      this.error(`Failed ${label}`, error as Error, { ...metadata, duration })
      throw error
    }
  }

  /**
   * Create a performance timer
   */
  timer(label: string, metadata?: Record<string, unknown>) {
    const start = Date.now()
    
    return {
      end: () => {
        const duration = Date.now() - start
        this.info(`Timer ${label}`, { ...metadata, duration })
        return duration
      },
      
      endWithError: (error: Error) => {
        const duration = Date.now() - start
        this.error(`Timer ${label} failed`, error, { ...metadata, duration })
        return duration
      }
    }
  }
}

// Create default logger instance
export const logger = new Logger()

// Create logger factory for different contexts
export const createLogger = (context: string, config?: Partial<LoggerConfig>): Logger => {
  return new Logger(context, config)
}

// Convenience functions using default logger
export const log = {
  error: (message: string, error?: Error, metadata?: Record<string, unknown>) => 
    logger.error(message, error, metadata),
  
  warn: (message: string, metadata?: Record<string, unknown>) => 
    logger.warn(message, metadata),
  
  info: (message: string, metadata?: Record<string, unknown>) => 
    logger.info(message, metadata),
  
  debug: (message: string, metadata?: Record<string, unknown>) => 
    logger.debug(message, metadata),
  
  time: <T>(label: string, fn: () => Promise<T>, metadata?: Record<string, unknown>) => 
    logger.time(label, fn, metadata),
  
  timer: (label: string, metadata?: Record<string, unknown>) => 
    logger.timer(label, metadata),
}

// Export types and utilities
export default {
  Logger,
  createLogger,
  logger,
  log,
  LogLevel,
}
