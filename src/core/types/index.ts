/**
 * Core Type Definitions
 * Global TypeScript types used throughout the application
 */

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type Nullable<T> = T | null
export type Maybe<T> = T | null | undefined

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
  requestId?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
  requestId?: string
}

// Authentication types
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'user' | 'admin'
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt: string
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Translation types
export interface TranslationRequest {
  text: string
  mode: 'simple' | 'detailed'
  sourceLanguage?: string
  targetLanguage?: string
  saveToHistory?: boolean
}

export interface SimpleTranslationResult {
  translation: string
  vocabulary?: VocabularyWord[]
  confidence?: number
  processingTime?: number
}

export interface DetailedTranslationResult {
  type: 'single_term' | 'paragraph'
  data: {
    translation?: string
    meanings?: Array<{
      translation: string
      partOfSpeech?: string
      examples?: string[]
    }>
    context?: string
    alternatives?: string[]
    grammar?: {
      structure: string
      explanation: string
    }
  }
  vocabulary?: VocabularyWord[]
  confidence?: number
  processingTime?: number
}

export type TranslationResult = SimpleTranslationResult | DetailedTranslationResult

// Vocabulary types
export interface VocabularyWord {
  id?: string
  word: string
  translation: string
  partOfSpeech?: string
  definition?: string
  examples?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  masteryLevel?: number
  frequency?: number
  tags?: string[]
  sourceText?: string
  createdAt?: string
  updatedAt?: string
}

export interface VocabularyStats {
  totalWords: number
  newWords: number
  learningWords: number
  masteredWords: number
  weeklyProgress: number
  streakDays: number
}

// Practice types
export interface PracticeQuestion {
  id: string
  type: 'flashcard' | 'multiple_choice' | 'fill_blanks' | 'listening'
  word: VocabularyWord
  question: string
  options?: string[]
  correctAnswer: string
  userAnswer?: string
  isCorrect?: boolean
  timeSpent?: number
}

export interface PracticeSession {
  id: string
  userId: string
  type: string
  difficulty: 'easy' | 'medium' | 'hard'
  questions: PracticeQuestion[]
  startedAt: string
  completedAt?: string
  score?: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number
  status: 'active' | 'completed' | 'abandoned'
}

export interface PracticeStats {
  totalSessions: number
  completedSessions: number
  averageScore: number
  totalTimeSpent: number
  streakDays: number
  weakAreas: string[]
  strongAreas: string[]
}

// Analytics types
export interface AnalyticsData {
  translations: {
    total: number
    thisWeek: number
    thisMonth: number
    byMode: Record<string, number>
  }
  vocabulary: {
    total: number
    learned: number
    mastered: number
    weeklyGrowth: number
  }
  practice: {
    totalSessions: number
    averageScore: number
    timeSpent: number
    streakDays: number
  }
  goals: {
    dailyTranslations: {
      target: number
      current: number
      streak: number
    }
    weeklyVocabulary: {
      target: number
      current: number
    }
  }
}

// UI Component types
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface LoadingState {
  isLoading: boolean
  error?: string | null
}

export interface FormState<T = any> extends LoadingState {
  data: T
  isDirty: boolean
  isValid: boolean
  errors: Record<string, string>
}

// Navigation types
export interface NavigationItem {
  label: string
  href: string
  icon?: string
  badge?: string
  isActive?: boolean
  children?: NavigationItem[]
}

// Theme types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  fontFamily: string
}

// Configuration types
export interface AppConfig {
  name: string
  version: string
  description: string
  url: string
  api: {
    baseUrl: string
    timeout: number
  }
  features: Record<string, boolean>
  limits: {
    maxFileSize: number
    maxTextLength: number
    rateLimit: number
  }
}

// Event types
export interface AppEvent<T = any> {
  type: string
  payload: T
  timestamp: string
  userId?: string
}

// Export utility type helpers
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

export type ValuesOf<T> = T[keyof T]

// Re-export PayloadCMS types
export type { 
  User as PayloadUser,
  Customer,
  Vocabulary,
  TranslationHistory,
  PracticeSession as PayloadPracticeSession,
  Achievement,
  UserAchievement,
  UserPreference,
} from '@/payload-types'
