/**
 * Vocabulary server actions with Next.js best practices
 * Handles CRUD operations for vocabulary with proper validation and caching
 */

'use server'

// Note: revalidateTag should only be used in server components/routes
import { handleServerActionError, validateRequest } from '@/lib/api/error-handler'
import {
  VocabularyCreateSchema,
  VocabularyUpdateSchema,
  VocabularyQuerySchema,
  type VocabularyCreateRequest,
  type VocabularyUpdateRequest,
} from '@/lib/api/validation'
import {
  createVocabularyEntry,
  getUserVocabulary,
  getVocabularyStats,
  updateVocabularyEntry,
  deleteVocabularyEntry,
  getWordsForPractice,
} from '@/lib/services/vocabularyService'
import { getCurrentUser } from '@/lib/actions/auth.actions'

// Types
interface VocabularyActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    fromCache?: boolean
    processingTime?: number
  }
}

/**
 * Create new vocabulary entry
 */
export async function createVocabularyAction(
  data: Omit<VocabularyCreateRequest, 'customer'>,
): Promise<VocabularyActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error('Authentication required')
    }

    // Validate input
    const validatedData = validateRequest(VocabularyCreateSchema, {
      ...data,
      customer: user.id,
    })

    // Create vocabulary entry
    const result = await createVocabularyEntry(user.id, validatedData as VocabularyCreateRequest)

    // Note: Cache invalidation will be handled by the API route

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Create vocabulary error:', error)
    handleServerActionError(error)
  }
}

/**
 * Update vocabulary entry
 */
export async function updateVocabularyAction(
  id: string,
  data: Partial<VocabularyUpdateRequest>,
): Promise<VocabularyActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error('Authentication required')
    }

    // Validate input
    const validatedData = validateRequest(VocabularyUpdateSchema, {
      ...data,
      id,
      customer: user.id,
    })

    // Update vocabulary entry
    const result = await updateVocabularyEntry(id, validatedData as VocabularyUpdateRequest)

    // Note: Cache invalidation will be handled by the API route

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Update vocabulary error:', error)
    handleServerActionError(error)
  }
}

/**
 * Delete vocabulary entry
 */
export async function deleteVocabularyAction(id: string): Promise<VocabularyActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error('Authentication required')
    }

    // Delete vocabulary entry
    await deleteVocabularyEntry(id, user.id)

    // Note: Cache invalidation will be handled by the API route

    return {
      success: true,
    }
  } catch (error) {
    console.error('Delete vocabulary error:', error)
    handleServerActionError(error)
  }
}

/**
 * Get user vocabulary with filtering and pagination
 */
export async function getUserVocabularyAction(
  options: {
    page?: number
    limit?: number
    status?: 'new' | 'learning' | 'mastered'
    difficulty?: 'easy' | 'medium' | 'hard'
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {},
): Promise<VocabularyActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error('Authentication required')
    }

    // Validate query parameters
    const validatedOptions = validateRequest(VocabularyQuerySchema, {
      customerId: user.id,
      ...options,
    })

    // Get vocabulary data
    const result = await getUserVocabulary(user.id, validatedOptions as any)

    return {
      success: true,
      data: result,
      meta: {
        fromCache: result.fromCache,
      },
    }
  } catch (error) {
    console.error('Get vocabulary error:', error)
    handleServerActionError(error)
  }
}

/**
 * Get vocabulary statistics
 */
export async function getVocabularyStatsAction(): Promise<VocabularyActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error('Authentication required')
    }

    // Get vocabulary stats
    const stats = await getVocabularyStats(user.id)

    return {
      success: true,
      data: stats,
    }
  } catch (error) {
    console.error('Get vocabulary stats error:', error)
    handleServerActionError(error)
  }
}

/**
 * Get words for practice session
 */
export async function getWordsForPracticeAction(
  options: {
    limit?: number
    difficulty?: 'easy' | 'medium' | 'hard'
    status?: 'new' | 'learning' | 'mastered'
    excludeRecent?: boolean
  } = {},
): Promise<VocabularyActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error('Authentication required')
    }

    // Get practice words
    const words = await getWordsForPractice(user.id, options)

    return {
      success: true,
      data: words,
    }
  } catch (error) {
    console.error('Get practice words error:', error)
    handleServerActionError(error)
  }
}

/**
 * Bulk update vocabulary status
 */
export async function bulkUpdateVocabularyStatusAction(
  wordIds: string[],
  status: 'new' | 'learning' | 'mastered',
): Promise<VocabularyActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error('Authentication required')
    }

    // Validate input
    if (!Array.isArray(wordIds) || wordIds.length === 0) {
      throw new Error('Word IDs are required')
    }

    // Update each word
    const results = await Promise.allSettled(
      wordIds.map((id) => updateVocabularyEntry(id, { status })),
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    // Note: Cache invalidation will be handled by the API route

    return {
      success: true,
      data: {
        successful,
        failed,
        total: wordIds.length,
      },
    }
  } catch (error) {
    console.error('Bulk update vocabulary error:', error)
    handleServerActionError(error)
  }
}

/**
 * Search vocabulary entries
 */
export async function searchVocabularyAction(
  query: string,
  options: {
    limit?: number
    includeDefinition?: boolean
    includeExample?: boolean
  } = {},
): Promise<VocabularyActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error('Authentication required')
    }

    // Validate query
    if (!query || query.trim().length === 0) {
      throw new Error('Search query is required')
    }

    // Search vocabulary
    const result = await getUserVocabulary(user.id, {
      search: query.trim(),
      limit: options.limit || 20,
    })

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Search vocabulary error:', error)
    handleServerActionError(error)
  }
}
