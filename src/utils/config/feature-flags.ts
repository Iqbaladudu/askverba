/**
 * Feature Flags Configuration
 * Centralized feature flag management for controlled feature rollouts
 */

import { appConfig } from './app.config'

// Feature flag types
export type FeatureFlagValue = boolean | string | number | object

export interface FeatureFlag {
  key: string
  name: string
  description: string
  defaultValue: FeatureFlagValue
  enabled: boolean
  rolloutPercentage?: number
  userSegments?: string[]
  environments?: string[]
  dependencies?: string[]
  expiresAt?: string
}

// Feature flag categories
export enum FeatureFlagCategory {
  AUTHENTICATION = 'authentication',
  TRANSLATION = 'translation',
  VOCABULARY = 'vocabulary',
  PRACTICE = 'practice',
  ANALYTICS = 'analytics',
  UI_UX = 'ui_ux',
  PERFORMANCE = 'performance',
  EXPERIMENTAL = 'experimental',
}

// Feature flags configuration
export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // Authentication features
  EMAIL_VERIFICATION: {
    key: 'email_verification',
    name: 'Email Verification',
    description: 'Require email verification for new accounts',
    defaultValue: false,
    enabled: appConfig.email.enabled,
    environments: ['production'],
  },

  SOCIAL_AUTH: {
    key: 'social_auth',
    name: 'Social Authentication',
    description: 'Enable social login with Google, GitHub, etc.',
    defaultValue: false,
    enabled: false,
    rolloutPercentage: 0,
  },

  TWO_FACTOR_AUTH: {
    key: 'two_factor_auth',
    name: 'Two-Factor Authentication',
    description: 'Enable 2FA for enhanced security',
    defaultValue: false,
    enabled: false,
    rolloutPercentage: 10,
    userSegments: ['premium'],
  },

  // Translation features
  TRANSLATION_CACHE: {
    key: 'translation_cache',
    name: 'Translation Caching',
    description: 'Cache translation results for better performance',
    defaultValue: true,
    enabled: true,
  },

  BATCH_TRANSLATION: {
    key: 'batch_translation',
    name: 'Batch Translation',
    description: 'Allow multiple text translations in one request',
    defaultValue: false,
    enabled: true,
    rolloutPercentage: 50,
  },

  TRANSLATION_HISTORY_EXPORT: {
    key: 'translation_history_export',
    name: 'Translation History Export',
    description: 'Allow users to export their translation history',
    defaultValue: true,
    enabled: true,
  },

  AI_PROVIDER_FALLBACK: {
    key: 'ai_provider_fallback',
    name: 'AI Provider Fallback',
    description: 'Automatically fallback to secondary AI provider on failure',
    defaultValue: true,
    enabled: appConfig.ai.mistral.enabled && appConfig.ai.xai.enabled,
  },

  // Vocabulary features
  VOCABULARY_TRACKING: {
    key: 'vocabulary_tracking',
    name: 'Vocabulary Tracking',
    description: 'Track and save vocabulary from translations',
    defaultValue: true,
    enabled: true,
  },

  VOCABULARY_PRACTICE: {
    key: 'vocabulary_practice',
    name: 'Vocabulary Practice',
    description: 'Practice sessions for learned vocabulary',
    defaultValue: true,
    enabled: true,
  },

  VOCABULARY_SPACED_REPETITION: {
    key: 'vocabulary_spaced_repetition',
    name: 'Spaced Repetition',
    description: 'Intelligent spaced repetition for vocabulary learning',
    defaultValue: false,
    enabled: false,
    rolloutPercentage: 25,
  },

  // Practice features
  PRACTICE_SESSIONS: {
    key: 'practice_sessions',
    name: 'Practice Sessions',
    description: 'Interactive practice sessions for language learning',
    defaultValue: true,
    enabled: true,
  },

  PRACTICE_GAMIFICATION: {
    key: 'practice_gamification',
    name: 'Practice Gamification',
    description: 'Add gamification elements to practice sessions',
    defaultValue: false,
    enabled: false,
    rolloutPercentage: 30,
  },

  PRACTICE_LEADERBOARDS: {
    key: 'practice_leaderboards',
    name: 'Practice Leaderboards',
    description: 'Competitive leaderboards for practice sessions',
    defaultValue: false,
    enabled: false,
    dependencies: ['practice_gamification'],
  },

  // Analytics features
  ANALYTICS_DASHBOARD: {
    key: 'analytics_dashboard',
    name: 'Analytics Dashboard',
    description: 'Detailed analytics and progress tracking',
    defaultValue: true,
    enabled: true,
  },

  ADVANCED_ANALYTICS: {
    key: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Advanced analytics with ML insights',
    defaultValue: false,
    enabled: false,
    rolloutPercentage: 20,
    userSegments: ['premium', 'beta'],
  },

  ANALYTICS_EXPORT: {
    key: 'analytics_export',
    name: 'Analytics Export',
    description: 'Export analytics data in various formats',
    defaultValue: false,
    enabled: false,
    rolloutPercentage: 15,
  },

  // UI/UX features
  DARK_MODE: {
    key: 'dark_mode',
    name: 'Dark Mode',
    description: 'Dark theme support',
    defaultValue: true,
    enabled: true,
  },

  MOBILE_APP_BANNER: {
    key: 'mobile_app_banner',
    name: 'Mobile App Banner',
    description: 'Show mobile app download banner',
    defaultValue: false,
    enabled: false,
    rolloutPercentage: 10,
  },

  NEW_DASHBOARD_DESIGN: {
    key: 'new_dashboard_design',
    name: 'New Dashboard Design',
    description: 'Updated dashboard with improved UX',
    defaultValue: false,
    enabled: false,
    rolloutPercentage: 5,
    userSegments: ['beta'],
  },

  // Performance features
  LAZY_LOADING: {
    key: 'lazy_loading',
    name: 'Lazy Loading',
    description: 'Lazy load components for better performance',
    defaultValue: true,
    enabled: true,
  },

  SERVICE_WORKER: {
    key: 'service_worker',
    name: 'Service Worker',
    description: 'Enable service worker for offline support',
    defaultValue: false,
    enabled: false,
    rolloutPercentage: 25,
  },

  // Experimental features
  AI_CONVERSATION_MODE: {
    key: 'ai_conversation_mode',
    name: 'AI Conversation Mode',
    description: 'Interactive conversation practice with AI',
    defaultValue: false,
    enabled: false,
    rolloutPercentage: 5,
    userSegments: ['beta'],
    expiresAt: '2024-12-31',
  },

  VOICE_TRANSLATION: {
    key: 'voice_translation',
    name: 'Voice Translation',
    description: 'Translate speech to text and vice versa',
    defaultValue: false,
    enabled: false,
    rolloutPercentage: 0,
    userSegments: ['beta'],
  },

  REAL_TIME_COLLABORATION: {
    key: 'real_time_collaboration',
    name: 'Real-time Collaboration',
    description: 'Collaborate on translations in real-time',
    defaultValue: false,
    enabled: false,
    rolloutPercentage: 0,
    userSegments: ['premium'],
  },
} as const

// Feature flag service
export class FeatureFlagService {
  private static instance: FeatureFlagService
  private flags: Map<string, FeatureFlag> = new Map()
  private userContext: {
    userId?: string
    userSegments?: string[]
    environment?: string
  } = {}

  private constructor() {
    this.initializeFlags()
  }

  static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService()
    }
    return FeatureFlagService.instance
  }

  private initializeFlags(): void {
    Object.values(FEATURE_FLAGS).forEach(flag => {
      this.flags.set(flag.key, flag)
    })
  }

  /**
   * Set user context for personalized feature flags
   */
  setUserContext(context: {
    userId?: string
    userSegments?: string[]
    environment?: string
  }): void {
    this.userContext = { ...this.userContext, ...context }
  }

  /**
   * Check if a feature flag is enabled
   */
  isEnabled(flagKey: string): boolean {
    const flag = this.flags.get(flagKey)
    if (!flag) {
      console.warn(`Feature flag '${flagKey}' not found`)
      return false
    }

    // Check if flag is globally disabled
    if (!flag.enabled) {
      return false
    }

    // Check environment restrictions
    if (flag.environments && flag.environments.length > 0) {
      const currentEnv = this.userContext.environment || appConfig.app.env
      if (!flag.environments.includes(currentEnv)) {
        return false
      }
    }

    // Check dependencies
    if (flag.dependencies && flag.dependencies.length > 0) {
      const dependenciesMet = flag.dependencies.every(dep => this.isEnabled(dep))
      if (!dependenciesMet) {
        return false
      }
    }

    // Check expiration
    if (flag.expiresAt && new Date() > new Date(flag.expiresAt)) {
      return false
    }

    // Check user segments
    if (flag.userSegments && flag.userSegments.length > 0) {
      const userSegments = this.userContext.userSegments || []
      const hasRequiredSegment = flag.userSegments.some(segment => 
        userSegments.includes(segment)
      )
      if (!hasRequiredSegment) {
        return false
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      const userId = this.userContext.userId
      if (userId) {
        const hash = this.hashUserId(userId, flagKey)
        const percentage = hash % 100
        return percentage < flag.rolloutPercentage
      }
      // If no user ID, use random rollout
      return Math.random() * 100 < flag.rolloutPercentage
    }

    return true
  }

  /**
   * Get feature flag value
   */
  getValue<T = FeatureFlagValue>(flagKey: string, defaultValue?: T): T {
    const flag = this.flags.get(flagKey)
    if (!flag || !this.isEnabled(flagKey)) {
      return defaultValue as T
    }
    return flag.defaultValue as T
  }

  /**
   * Get all enabled feature flags
   */
  getEnabledFlags(): Record<string, FeatureFlagValue> {
    const enabledFlags: Record<string, FeatureFlagValue> = {}
    
    this.flags.forEach((flag, key) => {
      if (this.isEnabled(key)) {
        enabledFlags[key] = flag.defaultValue
      }
    })

    return enabledFlags
  }

  /**
   * Get feature flag metadata
   */
  getFlagMetadata(flagKey: string): FeatureFlag | null {
    return this.flags.get(flagKey) || null
  }

  /**
   * Override a feature flag (for testing)
   */
  override(flagKey: string, enabled: boolean): void {
    const flag = this.flags.get(flagKey)
    if (flag) {
      this.flags.set(flagKey, { ...flag, enabled })
    }
  }

  /**
   * Reset all overrides
   */
  resetOverrides(): void {
    this.initializeFlags()
  }

  private hashUserId(userId: string, flagKey: string): number {
    const str = `${userId}:${flagKey}`
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}

// Singleton instance
export const featureFlags = FeatureFlagService.getInstance()

// Convenience functions
export const isFeatureEnabled = (flagKey: string): boolean => {
  return featureFlags.isEnabled(flagKey)
}

export const getFeatureValue = <T = FeatureFlagValue>(
  flagKey: string, 
  defaultValue?: T
): T => {
  return featureFlags.getValue(flagKey, defaultValue)
}

// React hook for feature flags (to be used in components)
export const useFeatureFlag = (flagKey: string) => {
  return {
    isEnabled: isFeatureEnabled(flagKey),
    value: getFeatureValue(flagKey),
  }
}

// Export types and constants
export type { FeatureFlag, FeatureFlagValue }
export { FeatureFlagCategory }

export default {
  FeatureFlagService,
  featureFlags,
  isFeatureEnabled,
  getFeatureValue,
  useFeatureFlag,
  FEATURE_FLAGS,
}
