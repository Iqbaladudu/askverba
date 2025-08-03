/**
 * Vocabulary Feature Types
 * Consolidated vocabulary-related types
 */

import { BaseEntity } from '@/utils/types/api.types'

// Vocabulary status
export type VocabularyStatus = 'new' | 'learning' | 'mastered'

// Vocabulary difficulty
export type VocabularyDifficulty = 'beginner' | 'intermediate' | 'advanced'

// Vocabulary frequency
export type VocabularyFrequency = 'rare' | 'uncommon' | 'common' | 'very_common'

// Part of speech
export type PartOfSpeech = 
  | 'noun' 
  | 'verb' 
  | 'adjective' 
  | 'adverb' 
  | 'pronoun' 
  | 'preposition' 
  | 'conjunction' 
  | 'interjection'
  | 'article'
  | 'determiner'
  | 'unknown'

// Vocabulary item
export interface VocabularyItem extends BaseEntity {
  customer: string
  word: string
  translation: string
  partOfSpeech: PartOfSpeech
  definition: string
  examples: string[]
  difficulty: VocabularyDifficulty
  frequency: VocabularyFrequency
  sourceLanguage: string
  targetLanguage: string
  status: VocabularyStatus
  practiceCount: number
  correctCount: number
  accuracy: number
  masteryLevel: number
  lastPracticed?: string
  averageTimeSpent?: number
  addedFromTranslation?: string
  tags?: string[]
  notes?: string
  isFavorite?: boolean
  audioUrl?: string
  imageUrl?: string
}

// Vocabulary options for queries
export interface VocabularyOptions {
  limit?: number
  page?: number
  status?: VocabularyStatus
  difficulty?: VocabularyDifficulty
  search?: string
  sortBy?: 'word' | 'createdAt' | 'lastPracticed' | 'accuracy' | 'masteryLevel'
  sortOrder?: 'asc' | 'desc'
  tags?: string[]
  isFavorite?: boolean
}

// Vocabulary response
export interface VocabularyResponse {
  docs: VocabularyItem[]
  totalDocs: number
  limit: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  fromCache: boolean
}

// Vocabulary statistics
export interface VocabularyStats {
  totalWords: number
  masteredWords: number
  learningWords: number
  newWords: number
  averageAccuracy: number
  totalPracticeCount: number
  lastPracticed?: string
  streakDays: number
  weeklyProgress: {
    wordsLearned: number
    practiceTime: number
    accuracy: number
  }
  monthlyProgress: {
    wordsLearned: number
    practiceTime: number
    accuracy: number
  }
  difficultyBreakdown: {
    beginner: number
    intermediate: number
    advanced: number
  }
  statusBreakdown: {
    new: number
    learning: number
    mastered: number
  }
}

// Vocabulary progress update
export interface VocabularyProgressUpdate {
  vocabularyId: string
  isCorrect: boolean
  timeSpent?: number
  attempts?: number
  sessionType?: string
}

// Vocabulary creation data
export interface VocabularyCreateData {
  word: string
  translation: string
  partOfSpeech: PartOfSpeech
  definition: string
  examples?: string[]
  difficulty?: VocabularyDifficulty
  frequency?: VocabularyFrequency
  sourceLanguage?: string
  targetLanguage?: string
  tags?: string[]
  notes?: string
  addedFromTranslation?: string
}

// Vocabulary update data
export interface VocabularyUpdateData {
  word?: string
  translation?: string
  partOfSpeech?: PartOfSpeech
  definition?: string
  examples?: string[]
  difficulty?: VocabularyDifficulty
  status?: VocabularyStatus
  tags?: string[]
  notes?: string
  isFavorite?: boolean
}

// Vocabulary export options
export interface VocabularyExportOptions {
  format: 'json' | 'csv' | 'anki' | 'xlsx'
  status?: VocabularyStatus[]
  difficulty?: VocabularyDifficulty[]
  dateRange?: {
    from: string
    to: string
  }
  includeProgress?: boolean
  includeExamples?: boolean
  includeNotes?: boolean
}

// Vocabulary export result
export interface VocabularyExportResult {
  data: string | Buffer
  filename: string
  mimeType: string
  size: number
  itemCount: number
}

// Vocabulary import data
export interface VocabularyImportData {
  words: VocabularyCreateData[]
  options?: {
    skipDuplicates?: boolean
    updateExisting?: boolean
    defaultDifficulty?: VocabularyDifficulty
    defaultStatus?: VocabularyStatus
  }
}

// Vocabulary import result
export interface VocabularyImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: number
  details: {
    imported: string[]
    skipped: string[]
    errors: Array<{
      word: string
      error: string
    }>
  }
}

// Vocabulary search filters
export interface VocabularySearchFilters {
  query?: string
  status?: VocabularyStatus[]
  difficulty?: VocabularyDifficulty[]
  partOfSpeech?: PartOfSpeech[]
  tags?: string[]
  dateAdded?: {
    from?: string
    to?: string
  }
  lastPracticed?: {
    from?: string
    to?: string
  }
  accuracyRange?: {
    min?: number
    max?: number
  }
  masteryRange?: {
    min?: number
    max?: number
  }
}

// Vocabulary learning goals
export interface VocabularyLearningGoals {
  dailyNewWords: number
  dailyPracticeTime: number
  weeklyMasteryTarget: number
  targetAccuracy: number
  preferredDifficulty: VocabularyDifficulty[]
  focusAreas: PartOfSpeech[]
}

// Vocabulary recommendation
export interface VocabularyRecommendation {
  word: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  estimatedDifficulty: VocabularyDifficulty
  relatedWords: string[]
  contexts: string[]
}

// Vocabulary analytics
export interface VocabularyAnalytics {
  learningVelocity: number // words per day
  retentionRate: number // percentage
  practiceEfficiency: number // accuracy improvement per practice
  strongAreas: PartOfSpeech[]
  weakAreas: PartOfSpeech[]
  recommendedFocus: VocabularyDifficulty
  nextMilestone: {
    target: number
    current: number
    estimatedDays: number
  }
}

// Type guards
export const isVocabularyItem = (obj: unknown): obj is VocabularyItem => {
  return typeof obj === 'object' && obj !== null && 'word' in obj && 'translation' in obj
}

// Constants
export const VOCABULARY_DIFFICULTIES: VocabularyDifficulty[] = ['beginner', 'intermediate', 'advanced']
export const VOCABULARY_STATUSES: VocabularyStatus[] = ['new', 'learning', 'mastered']
export const PARTS_OF_SPEECH: PartOfSpeech[] = [
  'noun', 'verb', 'adjective', 'adverb', 'pronoun', 
  'preposition', 'conjunction', 'interjection', 'article', 'determiner', 'unknown'
]

export const DEFAULT_VOCABULARY_OPTIONS: VocabularyOptions = {
  limit: 20,
  page: 1,
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

export const MASTERY_THRESHOLDS = {
  LEARNING: 60, // 60% accuracy to move from new to learning
  MASTERED: 85, // 85% accuracy to move to mastered
  MIN_PRACTICES_FOR_MASTERY: 5, // minimum practice sessions before mastery
} as const

// Utility functions
export const VocabularyUtils = {
  /**
   * Calculate mastery level based on accuracy and practice count
   */
  calculateMasteryLevel: (accuracy: number, practiceCount: number): number => {
    const baseLevel = Math.min(100, accuracy)
    const practiceBonus = Math.min(20, practiceCount * 2)
    return Math.min(100, baseLevel + practiceBonus)
  },

  /**
   * Determine status based on performance
   */
  determineStatus: (accuracy: number, practiceCount: number): VocabularyStatus => {
    if (practiceCount >= MASTERY_THRESHOLDS.MIN_PRACTICES_FOR_MASTERY && 
        accuracy >= MASTERY_THRESHOLDS.MASTERED) {
      return 'mastered'
    } else if (practiceCount >= 1 && accuracy >= MASTERY_THRESHOLDS.LEARNING) {
      return 'learning'
    }
    return 'new'
  },

  /**
   * Get display color for status
   */
  getStatusColor: (status: VocabularyStatus): string => {
    switch (status) {
      case 'new': return 'blue'
      case 'learning': return 'yellow'
      case 'mastered': return 'green'
      default: return 'gray'
    }
  },

  /**
   * Get display color for difficulty
   */
  getDifficultyColor: (difficulty: VocabularyDifficulty): string => {
    switch (difficulty) {
      case 'beginner': return 'green'
      case 'intermediate': return 'yellow'
      case 'advanced': return 'red'
      default: return 'gray'
    }
  },

  /**
   * Format practice time
   */
  formatPracticeTime: (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  },
} as const
