/**
 * Validation schemas for API endpoints
 * Centralized validation using Zod for type safety and consistency
 * Includes security-focused validation and sanitization
 */

import { z } from 'zod'

// Security validation helpers
const sanitizeString = (str: string): string => {
  // Remove potentially dangerous characters
  return str
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

const createSecureStringSchema = (minLength: number = 1, maxLength: number = 1000) => {
  return z
    .string()
    .min(minLength)
    .max(maxLength)
    .transform(sanitizeString)
    .refine((val) => val.length >= minLength, {
      message: `String must be at least ${minLength} characters after sanitization`,
    })
}

const createSecureEmailSchema = () => {
  return z
    .string()
    .email('Invalid email format')
    .max(254) // RFC 5321 limit
    .toLowerCase()
    .transform(sanitizeString)
}

const createSecurePasswordSchema = () => {
  return z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number',
    )
}

// Common validation schemas
export const IdSchema = z.string().min(1, 'ID is required')

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export const SortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Authentication schemas with enhanced security
export const LoginSchema = z.object({
  email: createSecureEmailSchema(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
})

export const RegisterSchema = z.object({
  name: createSecureStringSchema(2, 100),
  email: createSecureEmailSchema(),
  password: createSecurePasswordSchema(),
})

// Translation schemas with security validation
export const TranslationRequestSchema = z.object({
  text: createSecureStringSchema(1, 5000),
  mode: z.enum(['simple', 'detailed']),
  userId: z.string().optional(),
  saveToHistory: z.boolean().default(false),
})

export const TranslationHistoryQuerySchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  ...PaginationSchema.shape,
  ...SortSchema.shape,
  search: z.string().optional(),
  mode: z.enum(['simple', 'detailed']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

// Vocabulary schemas
export const VocabularyCreateSchema = z.object({
  customer: z.string().min(1, 'Customer ID is required'),
  word: createSecureStringSchema(1, 100),
  translation: createSecureStringSchema(1, 200),
  definition: createSecureStringSchema(0, 500).optional(),
  example: createSecureStringSchema(0, 500).optional(),
  pronunciation: createSecureStringSchema(0, 200).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  status: z.enum(['new', 'learning', 'mastered']).default('new'),
  sourceLanguage: createSecureStringSchema(1, 50).default('English'),
  targetLanguage: createSecureStringSchema(1, 50).default('Indonesian'),
  tags: z
    .array(
      z.object({
        tag: createSecureStringSchema(1, 50),
      }),
    )
    .max(10, 'Too many tags') // Limit number of tags
    .default([]),
})

export const VocabularyUpdateSchema = VocabularyCreateSchema.partial().extend({
  id: z.string().min(1, 'ID is required'),
})

export const VocabularyQuerySchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  ...PaginationSchema.shape,
  ...SortSchema.shape,
  status: z.enum(['new', 'learning', 'mastered']).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// Practice session schemas
export const PracticeWordSchema = z.object({
  vocabularyId: z.string().min(1, 'Vocabulary ID is required'),
  isCorrect: z.boolean(),
  timeSpent: z.number().min(0, 'Time spent must be positive'),
  attempts: z.number().min(1, 'Attempts must be at least 1'),
  userAnswer: z.string().optional(),
})

export const PracticeSessionCreateSchema = z.object({
  customer: z.string().min(1, 'Customer ID is required'),
  sessionType: z.enum(['flashcard', 'multiple_choice', 'typing', 'listening']),
  words: z.array(PracticeWordSchema).min(1, 'At least one word is required'),
  score: z.number().min(0).max(100, 'Score must be between 0 and 100'),
  timeSpent: z.number().min(0, 'Time spent must be positive'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  metadata: z
    .object({
      totalQuestions: z.number().min(1),
      correctAnswers: z.number().min(0),
      averageTimePerQuestion: z.number().min(0),
      streakCount: z.number().min(0),
    })
    .optional(),
})

export const PracticeSessionQuerySchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  ...PaginationSchema.shape,
  ...SortSchema.shape,
  sessionType: z.enum(['flashcard', 'multiple_choice', 'typing', 'listening']).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

// User progress schemas
export const UserProgressQuerySchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  ...PaginationSchema.shape,
  ...SortSchema.shape,
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

// Learning goals schemas
export const LearningGoalCreateSchema = z.object({
  customer: z.string().min(1, 'Customer ID is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  targetValue: z.number().min(1, 'Target value must be positive'),
  currentValue: z.number().min(0, 'Current value must be non-negative').default(0),
  unit: z.string().min(1, 'Unit is required').max(50, 'Unit too long'),
  category: z.enum(['vocabulary', 'practice', 'streak', 'accuracy', 'time']),
  deadline: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
})

export const LearningGoalUpdateSchema = LearningGoalCreateSchema.partial().extend({
  id: z.string().min(1, 'ID is required'),
})

export const LearningGoalQuerySchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  ...PaginationSchema.shape,
  ...SortSchema.shape,
  category: z.enum(['vocabulary', 'practice', 'streak', 'accuracy', 'time']).optional(),
  isActive: z.boolean().optional(),
})

// User preferences schemas
export const UserPreferencesSchema = z.object({
  customer: z.string().min(1, 'Customer ID is required'),
  language: z.string().default('id'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  notifications: z
    .object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      practice: z.boolean().default(true),
      achievements: z.boolean().default(true),
    })
    .default({}),
  practiceSettings: z
    .object({
      defaultDifficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
      sessionLength: z.number().min(5).max(60).default(20),
      autoSpeak: z.boolean().default(false),
      showHints: z.boolean().default(true),
    })
    .default({}),
  translationSettings: z
    .object({
      defaultMode: z.enum(['simple', 'detailed']).default('simple'),
      autoSave: z.boolean().default(true),
      showVocabulary: z.boolean().default(true),
    })
    .default({}),
})

// File upload schemas
export const FileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp']),
})

// Search schemas
export const SearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Query too long'),
  type: z.enum(['vocabulary', 'translations', 'all']).default('all'),
  customerId: z.string().min(1, 'Customer ID is required'),
  ...PaginationSchema.shape,
})

// Analytics schemas
export const AnalyticsQuerySchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  period: z.enum(['day', 'week', 'month', 'year']).default('week'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  metrics: z.array(z.enum(['translations', 'vocabulary', 'practice', 'accuracy'])).optional(),
})

// Export all schemas as a single object for easy importing
export const schemas = {
  // Common
  Id: IdSchema,
  Pagination: PaginationSchema,
  Sort: SortSchema,

  // Auth
  Login: LoginSchema,
  Register: RegisterSchema,

  // Translation
  TranslationRequest: TranslationRequestSchema,
  TranslationHistoryQuery: TranslationHistoryQuerySchema,

  // Vocabulary
  VocabularyCreate: VocabularyCreateSchema,
  VocabularyUpdate: VocabularyUpdateSchema,
  VocabularyQuery: VocabularyQuerySchema,

  // Practice
  PracticeWord: PracticeWordSchema,
  PracticeSessionCreate: PracticeSessionCreateSchema,
  PracticeSessionQuery: PracticeSessionQuerySchema,

  // User Progress
  UserProgressQuery: UserProgressQuerySchema,

  // Learning Goals
  LearningGoalCreate: LearningGoalCreateSchema,
  LearningGoalUpdate: LearningGoalUpdateSchema,
  LearningGoalQuery: LearningGoalQuerySchema,

  // User Preferences
  UserPreferences: UserPreferencesSchema,

  // File Upload
  FileUpload: FileUploadSchema,

  // Search
  Search: SearchSchema,

  // Analytics
  AnalyticsQuery: AnalyticsQuerySchema,
}

// Type exports for TypeScript
export type LoginRequest = z.infer<typeof LoginSchema>
export type RegisterRequest = z.infer<typeof RegisterSchema>
export type TranslationRequest = z.infer<typeof TranslationRequestSchema>
export type VocabularyCreateRequest = z.infer<typeof VocabularyCreateSchema>
export type VocabularyUpdateRequest = z.infer<typeof VocabularyUpdateSchema>
export type PracticeSessionCreateRequest = z.infer<typeof PracticeSessionCreateSchema>
export type LearningGoalCreateRequest = z.infer<typeof LearningGoalCreateSchema>
export type UserPreferencesRequest = z.infer<typeof UserPreferencesSchema>
