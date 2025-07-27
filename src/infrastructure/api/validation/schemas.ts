/**
 * API Validation Schemas
 * Centralized Zod schemas for API request validation
 */

import { z } from 'zod'

// Common validation patterns
const emailSchema = z.string().email('Invalid email address')
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters long')
const uuidSchema = z.string().uuid('Invalid UUID format')
const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
})

// Language codes
const languageCodeSchema = z.enum([
  'en',
  'es',
  'fr',
  'de',
  'it',
  'pt',
  'ru',
  'ja',
  'ko',
  'zh',
  'ar',
  'hi',
  'tr',
  'pl',
  'nl',
  'sv',
  'da',
  'no',
  'fi',
])

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
  subscribeNewsletter: z.boolean().optional(),
})

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
})

export const passwordResetSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Translation schemas
export const translationRequestSchema = z
  .object({
    text: z.string().min(1, 'Text is required').max(5000, 'Text cannot exceed 5000 characters'),
    sourceLanguage: languageCodeSchema,
    targetLanguage: languageCodeSchema,
    mode: z.enum(['simple', 'detailed']),
    saveToHistory: z.boolean().default(false),
    context: z.string().max(500).optional(),
  })
  .refine((data) => data.sourceLanguage !== data.targetLanguage, {
    message: 'Source and target languages cannot be the same',
    path: ['targetLanguage'],
  })

export const translationHistoryQuerySchema = z.object({
  ...paginationSchema.shape,
  sourceLanguage: languageCodeSchema.optional(),
  targetLanguage: languageCodeSchema.optional(),
  mode: z.enum(['simple', 'detailed']).optional(),
  search: z.string().max(100).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sort: z.enum(['createdAt', '-createdAt', 'updatedAt', '-updatedAt']).default('-createdAt'),
})

export const translationFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  isUseful: z.boolean(),
  userCorrection: z.string().max(1000).optional(),
  comments: z.string().max(500).optional(),
  reportedIssues: z.array(z.string()).optional(),
})

// Vocabulary schemas
export const vocabularyCreateSchema = z.object({
  word: z.string().min(1, 'Word is required').max(100),
  translation: z.string().min(1, 'Translation is required').max(100),
  partOfSpeech: z.string().min(1, 'Part of speech is required').max(50),
  definition: z.string().min(1, 'Definition is required').max(500),
  examples: z.array(z.string().max(200)).max(5),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  frequency: z.enum(['rare', 'uncommon', 'common', 'very_common']),
  sourceLanguage: languageCodeSchema,
  targetLanguage: languageCodeSchema,
  tags: z.array(z.string().max(30)).max(10).optional(),
  notes: z.string().max(500).optional(),
})

export const vocabularyUpdateSchema = vocabularyCreateSchema.partial()

export const vocabularyQuerySchema = z.object({
  ...paginationSchema.shape,
  search: z.string().max(100).optional(),
  sourceLanguage: languageCodeSchema.optional(),
  targetLanguage: languageCodeSchema.optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  partOfSpeech: z.string().max(50).optional(),
  tags: z.array(z.string()).optional(),
  sort: z
    .enum(['word', '-word', 'createdAt', '-createdAt', 'difficulty', '-difficulty'])
    .default('-createdAt'),
})

// Search schemas
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100),
  type: z.enum(['translations', 'vocabulary', 'all']).default('all'),
  ...paginationSchema.shape,
  filters: z.record(z.unknown()).optional(),
})

// Common parameter schemas
export const idParamSchema = z.object({
  id: uuidSchema,
})

export const slugParamSchema = z.object({
  slug: z.string().min(1).max(100),
})

// Query parameter helpers
export const parseQueryParams = <T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): T => {
  const params: Record<string, unknown> = {}

  for (const [key, value] of searchParams.entries()) {
    // Handle arrays (e.g., ?tags=tag1&tags=tag2)
    if (params[key]) {
      if (Array.isArray(params[key])) {
        ;(params[key] as unknown[]).push(value)
      } else {
        params[key] = [params[key], value]
      }
    } else {
      // Try to parse as number or boolean
      if (value === 'true') {
        params[key] = true
      } else if (value === 'false') {
        params[key] = false
      } else if (!isNaN(Number(value)) && value !== '') {
        params[key] = Number(value)
      } else {
        params[key] = value
      }
    }
  }

  return schema.parse(params)
}

// Validation middleware helper
export const validateBody = <T>(schema: z.ZodSchema<T>) => {
  return async (request: Request): Promise<T> => {
    try {
      const body = await request.json()
      return schema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error
      }
      throw new Error('Invalid JSON body')
    }
  }
}

export default {
  // Auth
  loginSchema,
  registerSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  changePasswordSchema,

  // Translation
  translationRequestSchema,
  translationHistoryQuerySchema,
  translationFeedbackSchema,

  // Vocabulary
  vocabularyCreateSchema,
  vocabularyUpdateSchema,
  vocabularyQuerySchema,

  // Common
  paginationSchema,
  idParamSchema,
  slugParamSchema,
  searchQuerySchema,

  // Helpers
  parseQueryParams,
  validateBody,
}
