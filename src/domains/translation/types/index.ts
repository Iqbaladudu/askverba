/**
 * Translation Domain Types
 * Core types for the translation feature domain
 */

import { BaseEntity } from '@/core/types/api.types'

// Translation modes
export type TranslationMode = 'simple' | 'detailed'

// Supported languages
export type SupportedLanguage =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'it'
  | 'pt'
  | 'ru'
  | 'ja'
  | 'ko'
  | 'zh'
  | 'ar'
  | 'hi'
  | 'tr'
  | 'pl'
  | 'nl'
  | 'sv'
  | 'da'
  | 'no'
  | 'fi'

// Language information
export interface LanguageInfo {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string
  rtl?: boolean
}

// Translation request
export interface TranslationRequest {
  text: string
  sourceLanguage: SupportedLanguage
  targetLanguage: SupportedLanguage
  mode: TranslationMode
  userId?: string
  saveToHistory?: boolean
  context?: string
}

// Base translation result
export interface BaseTranslationResult {
  originalText: string
  translatedText: string
  sourceLanguage: SupportedLanguage
  targetLanguage: SupportedLanguage
  mode: TranslationMode
  confidence?: number
  processingTime?: number
  fromCache?: boolean
}

// Simple translation result
export interface SimpleTranslationResult extends BaseTranslationResult {
  mode: 'simple'
}

// Detailed translation result
export interface DetailedTranslationResult extends BaseTranslationResult {
  mode: 'detailed'
  breakdown: TranslationBreakdown
  grammar: GrammarAnalysis
  context: ContextAnalysis
  alternatives: AlternativeTranslation[]
}

// Translation breakdown for detailed mode
export interface TranslationBreakdown {
  sentences: SentenceBreakdown[]
  wordCount: number
  characterCount: number
  complexity: 'simple' | 'intermediate' | 'advanced'
}

// Sentence breakdown
export interface SentenceBreakdown {
  original: string
  translated: string
  words: WordBreakdown[]
  grammar: {
    tense?: string
    mood?: string
    voice?: string
  }
}

// Word breakdown
export interface WordBreakdown {
  original: string
  translated: string
  partOfSpeech: string
  definition?: string
  examples?: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

// Vocabulary item extracted from translation
export interface VocabularyItem {
  word: string
  translation: string
  partOfSpeech: string
  definition: string
  examples: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  frequency: 'rare' | 'uncommon' | 'common' | 'very_common'
  sourceLanguage: SupportedLanguage
  targetLanguage: SupportedLanguage
}

// Grammar analysis
export interface GrammarAnalysis {
  tenses: TenseAnalysis[]
  structures: GrammarStructure[]
  patterns: GrammarPattern[]
  suggestions: GrammarSuggestion[]
}

// Tense analysis
export interface TenseAnalysis {
  tense: string
  usage: string
  examples: string[]
  frequency: number
}

// Grammar structure
export interface GrammarStructure {
  type: string
  description: string
  examples: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

// Grammar pattern
export interface GrammarPattern {
  pattern: string
  explanation: string
  examples: string[]
  commonMistakes?: string[]
}

// Grammar suggestion
export interface GrammarSuggestion {
  type: 'improvement' | 'correction' | 'alternative'
  original: string
  suggested: string
  explanation: string
}

// Context analysis
export interface ContextAnalysis {
  formality: 'very_formal' | 'formal' | 'neutral' | 'informal' | 'very_informal'
  tone: 'professional' | 'casual' | 'friendly' | 'academic' | 'literary'
  domain: string[]
  culturalNotes?: string[]
  regionalVariations?: RegionalVariation[]
}

// Regional variation
export interface RegionalVariation {
  region: string
  variation: string
  explanation: string
}

// Alternative translation
export interface AlternativeTranslation {
  text: string
  context: string
  formality: string
  confidence: number
  explanation?: string
}

// Translation history entity
export interface TranslationHistoryEntity extends BaseEntity {
  user: string
  originalText: string
  translatedText: string
  sourceLanguage: SupportedLanguage
  targetLanguage: SupportedLanguage
  mode: TranslationMode
  result: SimpleTranslationResult | DetailedTranslationResult
  feedback?: TranslationFeedback
  tags?: string[]
  isFavorite?: boolean
}

// Translation feedback
export interface TranslationFeedback {
  rating: number // 1-5
  isUseful: boolean
  userCorrection?: string
  comments?: string
  reportedIssues?: string[]
}

// Translation statistics
export interface TranslationStats {
  totalTranslations: number
  translationsByMode: Record<TranslationMode, number>
  translationsByLanguagePair: Record<string, number>
  recentTranslations: number
  averageRating?: number
  mostUsedLanguages: Array<{
    language: SupportedLanguage
    count: number
  }>
}

// Translation cache entry
export interface TranslationCacheEntry {
  key: string
  result: SimpleTranslationResult | DetailedTranslationResult
  createdAt: string
  expiresAt: string
  hitCount: number
}

// Translation service configuration
export interface TranslationServiceConfig {
  provider: 'mistral' | 'xai'
  maxTextLength: number
  cacheEnabled: boolean
  cacheTTL: number
  retryAttempts: number
  timeout: number
}

// Translation error types
export interface TranslationError {
  code: string
  message: string
  details?: {
    provider?: string
    originalText?: string
    sourceLanguage?: SupportedLanguage
    targetLanguage?: SupportedLanguage
  }
}

// Translation batch request
export interface TranslationBatchRequest {
  translations: TranslationRequest[]
  options?: {
    continueOnError?: boolean
    maxConcurrency?: number
  }
}

// Translation batch result
export interface TranslationBatchResult {
  results: Array<{
    success: boolean
    result?: SimpleTranslationResult | DetailedTranslationResult
    error?: TranslationError
  }>
  summary: {
    total: number
    successful: number
    failed: number
    processingTime: number
  }
}

// Export/import types
export interface TranslationExportOptions {
  format: 'json' | 'csv' | 'xlsx'
  dateRange?: {
    from: string
    to: string
  }
  languages?: SupportedLanguage[]
  includeVocabulary?: boolean
  includeMetadata?: boolean
}

export interface TranslationExportResult {
  data: string | Buffer
  filename: string
  mimeType: string
  size: number
}

// Union types for convenience
export type TranslationResult = SimpleTranslationResult | DetailedTranslationResult
export type TranslationEntity = TranslationHistoryEntity

// Type guards
export const isSimpleTranslation = (
  result: TranslationResult,
): result is SimpleTranslationResult => {
  return result.mode === 'simple'
}

export const isDetailedTranslation = (
  result: TranslationResult,
): result is DetailedTranslationResult => {
  return result.mode === 'detailed'
}

// Constants
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
]

export const DEFAULT_TRANSLATION_CONFIG: TranslationServiceConfig = {
  provider: 'mistral',
  maxTextLength: 5000,
  cacheEnabled: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  retryAttempts: 3,
  timeout: 30000, // 30 seconds
}
