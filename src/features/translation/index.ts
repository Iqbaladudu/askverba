/**
 * Translation Feature Public API
 * Business logic and data layer only (components moved to @/components/translation)
 */

// Types
export * from './types'
export * from './types/translator'

// Actions
export * from './actions/translate-simple.action'
export * from './actions/translate-detailed.action'

// Services
export * from './services/translationService'

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
