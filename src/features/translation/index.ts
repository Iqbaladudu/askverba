/**
 * Translation Feature Public API
 * Consolidated from domains/translation and other translation-related modules
 */

// Types
export * from './types'
export * from './types/translator'

// Actions
export * from './actions/translate-simple.action'
export * from './actions/translate-detailed.action'

// Services
export * from './services/translationService'

// Components (not exported to avoid client-server boundary issues)
// export * from './components'

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
