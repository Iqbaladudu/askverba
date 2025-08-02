/**
 * Core Constants Index
 * Centralized export of all application constants
 */

// Route constants
export * from './routes'
export * from './errors'
export * from './prompt'

// UI Constants
export const UI_CONSTANTS = {
  // Brand colors
  COLORS: {
    PRIMARY: '#FF5B9E',
    PRIMARY_HOVER: '#E5519A',
    PRIMARY_LIGHT: '#FFE8F1',
    SECONDARY: '#6366F1',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#3B82F6',
  },

  // Breakpoints (matching Tailwind)
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },

  // Z-index layers
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080,
  },

  // Animation durations
  ANIMATION: {
    FAST: '150ms',
    NORMAL: '300ms',
    SLOW: '500ms',
  },

  // Common spacing
  SPACING: {
    CONTAINER_PADDING: '1rem',
    SECTION_PADDING: '2rem',
    CARD_PADDING: '1.5rem',
  },
} as const

// API Constants
export const API_CONSTANTS = {
  // Request timeouts
  TIMEOUT: {
    DEFAULT: 10000, // 10 seconds
    TRANSLATION: 30000, // 30 seconds for AI requests
    UPLOAD: 60000, // 60 seconds for file uploads
  },

  // Rate limiting
  RATE_LIMIT: {
    GUEST_TRANSLATIONS_PER_HOUR: 5,
    USER_TRANSLATIONS_PER_HOUR: 100,
    API_REQUESTS_PER_MINUTE: 60,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1,
  },

  // File upload limits
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  },
} as const

// Feature flags
export const FEATURE_FLAGS = {
  VOCABULARY_BETA: true,
  ANALYTICS_BETA: true,
  PRACTICE_SESSIONS: true,
  ANKI_EXPORT: true,
  VOICE_SYNTHESIS: true,
  DARK_MODE: false, // Not implemented yet
} as const

// Translation constants
export const TRANSLATION_CONSTANTS = {
  MODES: {
    SIMPLE: 'simple',
    DETAILED: 'detailed',
  },

  LANGUAGES: {
    SOURCE: 'en',
    TARGET: 'id',
  },

  LIMITS: {
    MIN_TEXT_LENGTH: 1,
    MAX_TEXT_LENGTH: 5000,
    MAX_VOCABULARY_WORDS: 50,
  },
} as const

// Practice constants
export const PRACTICE_CONSTANTS = {
  TYPES: {
    FLASHCARD: 'flashcard',
    MULTIPLE_CHOICE: 'multiple_choice',
    FILL_BLANKS: 'fill_blanks',
    LISTENING: 'listening',
    MIXED: 'mixed',
  },

  DIFFICULTY: {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
  },

  SESSION: {
    MIN_QUESTIONS: 5,
    MAX_QUESTIONS: 50,
    DEFAULT_QUESTIONS: 10,
    TIME_LIMIT: 30 * 60 * 1000, // 30 minutes in milliseconds
  },
} as const

// Vocabulary constants
export const VOCABULARY_CONSTANTS = {
  DIFFICULTY_LEVELS: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
  },

  MASTERY_LEVELS: {
    NEW: 0,
    LEARNING: 1,
    FAMILIAR: 2,
    MASTERED: 3,
  },

  EXPORT_FORMATS: {
    ANKI: 'anki',
    CSV: 'csv',
    JSON: 'json',
  },
} as const

// Analytics constants
export const ANALYTICS_CONSTANTS = {
  TIME_RANGES: {
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
    ALL_TIME: 'all_time',
  },

  METRICS: {
    TRANSLATIONS: 'translations',
    VOCABULARY: 'vocabulary',
    PRACTICE: 'practice',
    STREAK: 'streak',
  },
} as const

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  AUTH_CUSTOMER: 'auth-customer',
  THEME: 'theme',
  LANGUAGE: 'language',
  PREFERENCES: 'user-preferences',
  DRAFT_TRANSLATION: 'draft-translation',
} as const

// Cookie names
export const COOKIE_NAMES = {
  AUTH_TOKEN: 'auth-token',
  AUTH_CUSTOMER: 'auth-customer',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const

// Environment constants
export const ENV_CONSTANTS = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const

// Export all constants as a single object for convenience
export const CONSTANTS = {
  UI: UI_CONSTANTS,
  API: API_CONSTANTS,
  FEATURES: FEATURE_FLAGS,
  TRANSLATION: TRANSLATION_CONSTANTS,
  PRACTICE: PRACTICE_CONSTANTS,
  VOCABULARY: VOCABULARY_CONSTANTS,
  ANALYTICS: ANALYTICS_CONSTANTS,
  STORAGE: STORAGE_KEYS,
  COOKIES: COOKIE_NAMES,
  ENV: ENV_CONSTANTS,
} as const

export default CONSTANTS
