/**
 * Configuration Index
 * Central export point for all configuration modules
 */

// App configuration
export { default as appConfig } from './app.config'
export type { AppConfig } from './app.config'
export {
  appSettings,
  databaseConfig,
  payloadConfig,
  aiConfig,
  authConfig,
  rateLimitConfig,
  cacheConfig,
  emailConfig,
  monitoringConfig,
  featureFlags as appFeatureFlags,
  validateConfig,
  getConfig,
  isDevelopment,
  isProduction,
  isTest,
} from './app.config'

// Feature flags
export {
  FeatureFlagService,
  featureFlags,
  isFeatureEnabled,
  getFeatureValue,
  useFeatureFlag,
  FEATURE_FLAGS,
  FeatureFlagCategory,
} from './feature-flags'
export type { FeatureFlag, FeatureFlagValue } from './feature-flags'

// Database configuration
export { default as databaseConfiguration } from './database.config'

// AI configuration  
export { default as aiConfiguration } from './ai.config'

// Re-export for convenience
export const config = {
  app: appConfig,
  featureFlags,
  isFeatureEnabled,
  getFeatureValue,
  validateConfig,
}

export default config
