/**
 * Translation Domain Public API
 * Exports all public interfaces and implementations for the translation domain
 */

// Types
export * from './types'

// Services
export { TranslationService } from './services/TranslationService'
export type { AIProvider, CacheService } from './services/TranslationService'

// Components (will be added later)
// export * from './components'

// Hooks (will be added later)
// export * from './hooks'

// Utils (will be added later)
// export * from './utils'

// Re-export commonly used types for convenience
export type {
  TranslationRequest,
  TranslationResult,
  SimpleTranslationResult,
  DetailedTranslationResult,
  TranslationMode,
  SupportedLanguage,
  VocabularyItem,
  TranslationStats,
} from './types'
