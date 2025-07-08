/**
 * Performance monitoring and metrics collection
 * Tracks API performance, user interactions, and system health
 */

// Types
interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  tags?: Record<string, string>
  metadata?: Record<string, unknown>
}

interface ApiMetric extends PerformanceMetric {
  method: string
  endpoint: string
  statusCode?: number
  responseTime: number
  cacheHit?: boolean
  retryCount?: number
}

interface UserMetric extends PerformanceMetric {
  userId?: string
  sessionId: string
  action: string
  component?: string
}

interface SystemMetric extends PerformanceMetric {
  category: 'memory' | 'network' | 'cache' | 'database'
  level: 'info' | 'warning' | 'error'
}

// Performance metrics storage
class MetricsStore {
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 1000
  private flushInterval = 60000 // 1 minute

  constructor() {
    // Auto-flush metrics periodically
    if (typeof window !== 'undefined') {
      setInterval(() => this.flush(), this.flushInterval)
    }
  }

  add(metric: PerformanceMetric): void {
    this.metrics.push(metric)
    
    // Remove old metrics if we exceed the limit
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.splice(0, this.metrics.length - this.maxMetrics)
    }

    // Log important metrics immediately
    if (this.shouldLogImmediately(metric)) {
      this.logMetric(metric)
    }
  }

  private shouldLogImmediately(metric: PerformanceMetric): boolean {
    // Log slow API calls
    if (metric.name.includes('api') && metric.value > 5000) return true
    
    // Log errors
    if (metric.tags?.level === 'error') return true
    
    // Log high memory usage
    if (metric.name.includes('memory') && metric.value > 100) return true
    
    return false
  }

  private logMetric(metric: PerformanceMetric): void {
    const level = metric.tags?.level || 'info'
    const message = `[METRIC] ${metric.name}: ${metric.value}${metric.unit}`
    
    switch (level) {
      case 'error':
        console.error(message, metric)
        break
      case 'warning':
        console.warn(message, metric)
        break
      default:
        console.log(message, metric)
    }
  }

  getMetrics(filter?: {
    name?: string
    category?: string
    since?: number
    limit?: number
  }): PerformanceMetric[] {
    let filtered = this.metrics

    if (filter) {
      if (filter.name) {
        filtered = filtered.filter(m => m.name.includes(filter.name!))
      }
      
      if (filter.category) {
        filtered = filtered.filter(m => m.tags?.category === filter.category)
      }
      
      if (filter.since) {
        filtered = filtered.filter(m => m.timestamp >= filter.since!)
      }
      
      if (filter.limit) {
        filtered = filtered.slice(-filter.limit)
      }
    }

    return filtered
  }

  getStats(): {
    totalMetrics: number
    categories: Record<string, number>
    averageResponseTime: number
    errorRate: number
  } {
    const apiMetrics = this.metrics.filter(m => m.name.includes('api')) as ApiMetric[]
    const errorMetrics = this.metrics.filter(m => m.tags?.level === 'error')
    
    const categories: Record<string, number> = {}
    this.metrics.forEach(m => {
      const category = m.tags?.category || 'unknown'
      categories[category] = (categories[category] || 0) + 1
    })

    const averageResponseTime = apiMetrics.length > 0
      ? apiMetrics.reduce((sum, m) => sum + m.responseTime, 0) / apiMetrics.length
      : 0

    const errorRate = this.metrics.length > 0
      ? (errorMetrics.length / this.metrics.length) * 100
      : 0

    return {
      totalMetrics: this.metrics.length,
      categories,
      averageResponseTime,
      errorRate,
    }
  }

  flush(): void {
    if (this.metrics.length === 0) return

    // In production, send metrics to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(this.metrics)
    }

    // Clear metrics after flushing
    this.metrics = []
  }

  private async sendToMonitoringService(metrics: PerformanceMetric[]): Promise<void> {
    try {
      // Example: Send to monitoring service
      // await fetch('/api/metrics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ metrics })
      // })
      
      console.log(`[METRICS] Would send ${metrics.length} metrics to monitoring service`)
    } catch (error) {
      console.error('[METRICS] Failed to send metrics:', error)
    }
  }
}

// Global metrics store
const metricsStore = new MetricsStore()

/**
 * Performance monitoring utilities
 */
export const PerformanceMonitor = {
  // Track API call performance
  trackApiCall: (
    method: string,
    endpoint: string,
    responseTime: number,
    statusCode?: number,
    options?: {
      cacheHit?: boolean
      retryCount?: number
      userId?: string
    }
  ) => {
    const metric: ApiMetric = {
      name: 'api_call',
      value: responseTime,
      unit: 'ms',
      timestamp: Date.now(),
      method,
      endpoint,
      statusCode,
      responseTime,
      cacheHit: options?.cacheHit,
      retryCount: options?.retryCount,
      tags: {
        category: 'api',
        method,
        endpoint: endpoint.split('?')[0], // Remove query params
        status: statusCode ? String(statusCode) : 'unknown',
        level: statusCode && statusCode >= 400 ? 'error' : 'info',
      },
      metadata: {
        userId: options?.userId,
        cacheHit: options?.cacheHit,
        retryCount: options?.retryCount,
      },
    }

    metricsStore.add(metric)
  },

  // Track user interactions
  trackUserAction: (
    action: string,
    component?: string,
    duration?: number,
    userId?: string
  ) => {
    const sessionId = getSessionId()
    
    const metric: UserMetric = {
      name: 'user_action',
      value: duration || 0,
      unit: duration ? 'ms' : 'count',
      timestamp: Date.now(),
      userId,
      sessionId,
      action,
      component,
      tags: {
        category: 'user',
        action,
        component: component || 'unknown',
        level: 'info',
      },
    }

    metricsStore.add(metric)
  },

  // Track system metrics
  trackSystemMetric: (
    name: string,
    value: number,
    unit: string,
    category: SystemMetric['category'],
    level: SystemMetric['level'] = 'info'
  ) => {
    const metric: SystemMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      category,
      level,
      tags: {
        category,
        level,
      },
    }

    metricsStore.add(metric)
  },

  // Track page load performance
  trackPageLoad: (pageName: string) => {
    if (typeof window === 'undefined') return

    // Use Performance API if available
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          request: navigation.responseStart - navigation.requestStart,
          response: navigation.responseEnd - navigation.responseStart,
          dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          load: navigation.loadEventEnd - navigation.loadEventStart,
          total: navigation.loadEventEnd - navigation.navigationStart,
        }

        Object.entries(metrics).forEach(([name, value]) => {
          metricsStore.add({
            name: `page_load_${name}`,
            value,
            unit: 'ms',
            timestamp: Date.now(),
            tags: {
              category: 'performance',
              page: pageName,
              level: value > 3000 ? 'warning' : 'info',
            },
          })
        })
      }
    }
  },

  // Track memory usage
  trackMemoryUsage: () => {
    if (typeof window === 'undefined') return

    // Use Memory API if available (Chrome only)
    if ('memory' in window.performance) {
      const memory = (window.performance as any).memory
      
      const usedMB = memory.usedJSHeapSize / 1024 / 1024
      const totalMB = memory.totalJSHeapSize / 1024 / 1024
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024

      metricsStore.add({
        name: 'memory_usage',
        value: usedMB,
        unit: 'MB',
        timestamp: Date.now(),
        tags: {
          category: 'memory',
          level: usedMB > limitMB * 0.8 ? 'warning' : 'info',
        },
        metadata: {
          used: usedMB,
          total: totalMB,
          limit: limitMB,
          percentage: (usedMB / limitMB) * 100,
        },
      })
    }
  },

  // Get performance statistics
  getStats: () => metricsStore.getStats(),

  // Get metrics with filtering
  getMetrics: (filter?: Parameters<typeof metricsStore.getMetrics>[0]) => 
    metricsStore.getMetrics(filter),

  // Manually flush metrics
  flush: () => metricsStore.flush(),
}

/**
 * Performance timing decorator for functions
 */
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  fn: T,
  name: string,
  category: string = 'function'
): T {
  return ((...args: any[]) => {
    const startTime = performance.now()
    
    try {
      const result = fn(...args)
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - startTime
          PerformanceMonitor.trackSystemMetric(
            name,
            duration,
            'ms',
            category as SystemMetric['category'],
            duration > 1000 ? 'warning' : 'info'
          )
        })
      }
      
      // Handle sync functions
      const duration = performance.now() - startTime
      PerformanceMonitor.trackSystemMetric(
        name,
        duration,
        'ms',
        category as SystemMetric['category'],
        duration > 100 ? 'warning' : 'info'
      )
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      PerformanceMonitor.trackSystemMetric(
        name,
        duration,
        'ms',
        category as SystemMetric['category'],
        'error'
      )
      throw error
    }
  }) as T
}

/**
 * React hook for tracking component performance
 */
export function usePerformanceTracking(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      PerformanceMonitor.trackUserAction(
        'component_unmount',
        componentName,
        duration
      )
    }
  }, [componentName])

  const trackAction = React.useCallback((action: string, duration?: number) => {
    PerformanceMonitor.trackUserAction(action, componentName, duration)
  }, [componentName])

  return { trackAction }
}

/**
 * Utility functions
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  
  let sessionId = sessionStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('session_id', sessionId)
  }
  return sessionId
}

// Auto-track page loads and memory usage
if (typeof window !== 'undefined') {
  // Track initial page load
  window.addEventListener('load', () => {
    PerformanceMonitor.trackPageLoad(window.location.pathname)
  })

  // Track memory usage periodically
  setInterval(() => {
    PerformanceMonitor.trackMemoryUsage()
  }, 30000) // Every 30 seconds

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    PerformanceMonitor.trackUserAction(
      document.hidden ? 'page_hidden' : 'page_visible'
    )
  })
}

// Import React for hooks
import React from 'react'
