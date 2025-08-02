/**
 * Practice Feature Public API
 * Consolidated practice-related modules
 */

// Types
export * from './types'

// Components
export * from './components'

// Hooks
export * from './hooks'

// Services
export * from './services/practiceService'

// Re-export commonly used types for convenience
export type {
  PracticeSession,
  PracticeSessionType,
  PracticeDifficulty,
  PracticeSessionData,
  PracticeWordResult,
  PracticeStats,
  PracticeConfig,
  PracticeQuestion,
  PracticeQuestionType,
  PracticeAchievement,
  PracticeAnalytics,
} from './types'
