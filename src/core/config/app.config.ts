/**
 * Application Configuration
 * Centralized configuration management for the AskVerba application
 */

import { z } from 'zod'

// Environment validation schema
const envSchema = z.object({
  // App Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  APP_NAME: z.string().default('AskVerba'),
  APP_VERSION: z.string().default('1.0.0'),

  // Database Configuration
  DATABASE_URI: z.string().min(1, 'Database URI is required'),

  // PayloadCMS Configuration
  PAYLOAD_SECRET: z.string().min(32, 'Payload secret must be at least 32 characters'),

  // AI Configuration
  MISTRAL_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),

  // Authentication Configuration
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters').optional(),
  AUTH_COOKIE_NAME: z.string().default('auth-token'),
  AUTH_COOKIE_MAX_AGE: z.number().default(7 * 24 * 60 * 60), // 7 days in seconds

  // Rate Limiting
  RATE_LIMIT_MAX: z.number().default(100),
  RATE_LIMIT_WINDOW: z.number().default(15 * 60 * 1000), // 15 minutes in ms

  // Cache Configuration
  CACHE_TTL: z.number().default(5 * 60 * 1000), // 5 minutes in ms

  // Email Configuration (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Monitoring Configuration (optional)
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
})

// Validate environment variables
const env = envSchema.parse(process.env)

// Application configuration object
export const appConfig = {
  // App Settings
  app: {
    name: env.APP_NAME,
    version: env.APP_VERSION,
    url: env.APP_URL,
    env: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },

  // Database Settings
  database: {
    uri: env.DATABASE_URI,
  },

  // PayloadCMS Settings
  payload: {
    secret: env.PAYLOAD_SECRET,
  },

  // AI Settings
  ai: {
    mistral: {
      apiKey: env.MISTRAL_API_KEY,
      enabled: !!env.MISTRAL_API_KEY,
    },
    xai: {
      apiKey: env.XAI_API_KEY,
      enabled: !!env.XAI_API_KEY,
    },
    defaultProvider: env.MISTRAL_API_KEY ? 'mistral' : env.XAI_API_KEY ? 'xai' : null,
  },

  // Authentication Settings
  auth: {
    jwtSecret: env.JWT_SECRET,
    cookie: {
      name: env.AUTH_COOKIE_NAME,
      maxAge: env.AUTH_COOKIE_MAX_AGE,
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    },
  },

  // Rate Limiting Settings
  rateLimit: {
    max: env.RATE_LIMIT_MAX,
    windowMs: env.RATE_LIMIT_WINDOW,
  },

  // Cache Settings
  cache: {
    ttl: env.CACHE_TTL,
  },

  // Email Settings
  email: {
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    enabled: !!(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS),
  },

  // Monitoring Settings
  monitoring: {
    sentry: {
      dsn: env.SENTRY_DSN,
      enabled: !!env.SENTRY_DSN,
    },
    logging: {
      level: env.LOG_LEVEL,
    },
  },

  // Feature Flags (basic ones, detailed flags in feature-flags.ts)
  features: {
    emailVerification: !!process.env.SMTP_HOST, // Based on email configuration
    socialAuth: false,
    analytics: true,
    practiceMode: true,
    vocabularyTracking: true,
  },
} as const

// Type for the configuration
export type AppConfig = typeof appConfig

// Export individual config sections for convenience
export const {
  app: appSettings,
  database: databaseConfig,
  payload: payloadConfig,
  ai: aiConfig,
  auth: authConfig,
  rateLimit: rateLimitConfig,
  cache: cacheConfig,
  email: emailConfig,
  monitoring: monitoringConfig,
  features: featureFlags,
} = appConfig

// Validation helper
export function validateConfig(): void {
  try {
    envSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Invalid environment configuration:', error)
    process.exit(1)
  }
}

// Configuration getter with type safety
export function getConfig<K extends keyof AppConfig>(key: K): AppConfig[K] {
  return appConfig[key]
}

// Environment-specific configurations
export const isDevelopment = appConfig.app.isDevelopment
export const isProduction = appConfig.app.isProduction
export const isTest = appConfig.app.isTest

export default appConfig
