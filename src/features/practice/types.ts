/**
 * Practice Feature Types
 * Consolidated practice-related types
 */

import { BaseEntity } from '@/utils/types/api.types'
import { VocabularyItem } from '@/features/vocabulary/types'

// Practice session types
export type PracticeSessionType = 'flashcard' | 'multiple_choice' | 'fill_blanks' | 'listening' | 'mixed'

// Practice difficulty levels
export type PracticeDifficulty = 'easy' | 'medium' | 'hard'

// Practice session status
export type PracticeSessionStatus = 'active' | 'completed' | 'paused' | 'abandoned'

// Practice session entity
export interface PracticeSession extends BaseEntity {
  customer: string
  sessionType: PracticeSessionType
  status: PracticeSessionStatus
  score: number
  timeSpent: number
  difficulty: PracticeDifficulty
  totalQuestions: number
  correctAnswers: number
  averageTimePerQuestion: number
  streakCount: number
  wordsData: string // JSON string of word results
  startedAt: string
  completedAt?: string
  metadata?: PracticeSessionMetadata
}

// Practice session metadata
export interface PracticeSessionMetadata {
  deviceType?: 'mobile' | 'tablet' | 'desktop'
  inputMethod?: 'touch' | 'keyboard' | 'voice'
  interruptions?: number
  pauseDuration?: number
  hints?: number
  skips?: number
  customSettings?: Record<string, unknown>
}

// Practice session data for creation
export interface PracticeSessionData {
  sessionType: PracticeSessionType
  words: Array<{
    vocabularyId: string
    isCorrect: boolean
    timeSpent: number
    attempts: number
    hintsUsed?: number
    skipped?: boolean
  }>
  score: number
  timeSpent: number
  difficulty: PracticeDifficulty
  metadata?: {
    totalQuestions: number
    correctAnswers: number
    averageTimePerQuestion: number
    streakCount: number
    deviceType?: string
    inputMethod?: string
  }
}

// Practice word result
export interface PracticeWordResult {
  vocabularyId: string
  word: string
  translation: string
  isCorrect: boolean
  timeSpent: number
  attempts: number
  hintsUsed: number
  skipped: boolean
  userAnswer?: string
  correctAnswer: string
  feedback?: string
}

// Practice statistics
export interface PracticeStats {
  totalSessions: number
  totalTimeSpent: number
  averageScore: number
  bestScore: number
  currentStreak: number
  longestStreak: number
  sessionsByType: {
    flashcard: number
    multiple_choice: number
    typing: number
    listening: number
  }
  recentSessions: PracticeSession[]
  weeklyProgress: {
    sessionsCompleted: number
    timeSpent: number
    averageScore: number
    wordsLearned: number
  }
  monthlyProgress: {
    sessionsCompleted: number
    timeSpent: number
    averageScore: number
    wordsLearned: number
  }
}

// Practice configuration
export interface PracticeConfig {
  sessionType: PracticeSessionType
  difficulty: PracticeDifficulty
  wordCount: number
  timeLimit?: number
  shuffleWords: boolean
  showHints: boolean
  allowSkip: boolean
  repeatIncorrect: boolean
  focusAreas?: string[]
  excludeMastered?: boolean
  prioritizeWeak?: boolean
}

// Practice question types
export type PracticeQuestionType = 
  | 'translation_to_native'
  | 'native_to_translation'
  | 'multiple_choice'
  | 'fill_in_blank'
  | 'listening'
  | 'spelling'
  | 'definition_match'

// Practice question
export interface PracticeQuestion {
  id: string
  type: PracticeQuestionType
  vocabularyItem: VocabularyItem
  question: string
  options?: string[]
  correctAnswer: string
  hints?: string[]
  explanation?: string
  audioUrl?: string
  imageUrl?: string
  timeLimit?: number
}

// Practice session response
export interface PracticeSessionResponse {
  docs: PracticeSession[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// Practice achievement
export interface PracticeAchievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'streak' | 'accuracy' | 'speed' | 'volume' | 'consistency'
  requirement: {
    type: string
    value: number
    timeframe?: string
  }
  reward?: {
    points: number
    badge?: string
    unlock?: string
  }
  unlockedAt?: string
}

// Practice leaderboard entry
export interface PracticeLeaderboardEntry {
  userId: string
  username: string
  avatar?: string
  score: number
  rank: number
  streak: number
  totalSessions: number
  averageAccuracy: number
}

// Practice analytics
export interface PracticeAnalytics {
  performanceTrend: Array<{
    date: string
    score: number
    timeSpent: number
    accuracy: number
  }>
  strengthAreas: Array<{
    area: string
    accuracy: number
    improvement: number
  }>
  weaknessAreas: Array<{
    area: string
    accuracy: number
    needsWork: boolean
  }>
  recommendations: Array<{
    type: 'focus_area' | 'session_type' | 'difficulty' | 'schedule'
    message: string
    priority: 'high' | 'medium' | 'low'
  }>
  learningVelocity: {
    wordsPerDay: number
    sessionsPerWeek: number
    timePerSession: number
  }
}

// Practice reminder settings
export interface PracticeReminderSettings {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'custom'
  time: string // HH:MM format
  days: number[] // 0-6, Sunday = 0
  message?: string
  sound?: boolean
  vibration?: boolean
}

// Practice export options
export interface PracticeExportOptions {
  format: 'json' | 'csv' | 'xlsx'
  dateRange?: {
    from: string
    to: string
  }
  sessionTypes?: PracticeSessionType[]
  includeWordDetails?: boolean
  includeMetadata?: boolean
}

// Practice import data
export interface PracticeImportData {
  sessions: Omit<PracticeSessionData, 'customer'>[]
  options?: {
    skipDuplicates?: boolean
    validateWords?: boolean
  }
}

// Type guards
export const isPracticeSession = (obj: unknown): obj is PracticeSession => {
  return typeof obj === 'object' && obj !== null && 'sessionType' in obj && 'score' in obj
}

// Constants
export const PRACTICE_SESSION_TYPES: PracticeSessionType[] = [
  'flashcard', 'multiple_choice', 'fill_blanks', 'listening', 'mixed'
]

export const PRACTICE_DIFFICULTIES: PracticeDifficulty[] = ['easy', 'medium', 'hard']

export const PRACTICE_QUESTION_TYPES: PracticeQuestionType[] = [
  'translation_to_native', 'native_to_translation', 'multiple_choice', 
  'fill_in_blank', 'listening', 'spelling', 'definition_match'
]

export const DEFAULT_PRACTICE_CONFIG: PracticeConfig = {
  sessionType: 'mixed',
  difficulty: 'medium',
  wordCount: 10,
  shuffleWords: true,
  showHints: true,
  allowSkip: false,
  repeatIncorrect: true,
  excludeMastered: false,
  prioritizeWeak: true,
}

export const SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  FAIR: 60,
  POOR: 40,
} as const

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const

// Utility functions
export const PracticeUtils = {
  /**
   * Calculate score based on correct answers and time
   */
  calculateScore: (correct: number, total: number, timeSpent: number, timeLimit?: number): number => {
    const accuracy = (correct / total) * 100
    if (!timeLimit) return Math.round(accuracy)
    
    const timeBonus = Math.max(0, (timeLimit - timeSpent) / timeLimit * 10)
    return Math.round(Math.min(100, accuracy + timeBonus))
  },

  /**
   * Get score grade
   */
  getScoreGrade: (score: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'A'
    if (score >= SCORE_THRESHOLDS.GOOD) return 'B'
    if (score >= SCORE_THRESHOLDS.FAIR) return 'C'
    if (score >= SCORE_THRESHOLDS.POOR) return 'D'
    return 'F'
  },

  /**
   * Get score color
   */
  getScoreColor: (score: number): string => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'green'
    if (score >= SCORE_THRESHOLDS.GOOD) return 'blue'
    if (score >= SCORE_THRESHOLDS.FAIR) return 'yellow'
    if (score >= SCORE_THRESHOLDS.POOR) return 'orange'
    return 'red'
  },

  /**
   * Format session duration
   */
  formatDuration: (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  },

  /**
   * Calculate accuracy percentage
   */
  calculateAccuracy: (correct: number, total: number): number => {
    return total > 0 ? Math.round((correct / total) * 100) : 0
  },

  /**
   * Determine if streak milestone reached
   */
  isStreakMilestone: (streak: number): boolean => {
    return STREAK_MILESTONES.includes(streak)
  },

  /**
   * Get next streak milestone
   */
  getNextStreakMilestone: (currentStreak: number): number | null => {
    return STREAK_MILESTONES.find(milestone => milestone > currentStreak) || null
  },

  /**
   * Generate practice recommendations
   */
  generateRecommendations: (stats: PracticeStats): string[] => {
    const recommendations: string[] = []
    
    if (stats.averageScore < SCORE_THRESHOLDS.FAIR) {
      recommendations.push('Focus on easier words to build confidence')
    }
    
    if (stats.currentStreak === 0) {
      recommendations.push('Start a daily practice streak')
    }
    
    if (stats.sessionsByType.flashcard === 0) {
      recommendations.push('Try flashcard sessions for quick reviews')
    }
    
    return recommendations
  },
} as const
