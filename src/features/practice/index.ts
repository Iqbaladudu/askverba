/**
 * Practice Feature Public API
 * Business logic and data layer only (components moved to @/components/practice)
 */

// Types
export * from './types'

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
