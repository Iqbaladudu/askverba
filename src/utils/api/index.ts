/**
 * API Infrastructure Index
 * Central export point for all API-related functionality
 */

// Client
export * from './client'

// Error handling
export * from './error-handler'

// Validation
export * from './validation'

// PayloadCMS integration (server-side only - not exported to avoid client-side imports)

// Middleware
export * from './middleware/authMiddleware'
export * from './middleware/errorHandler'

// Validation schemas
export * from './validation/schemas'
