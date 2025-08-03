import { translateWithCache } from '@/features/translation'
import { TranslationResult } from '@/utils/schema'
import { handleServerActionError, validateRequest } from '@/utils/api/error-handler'
import { TranslationRequestSchema } from '@/utils/api/validation'
import { getCurrentUser } from '@/features/auth/actions'

// Types
interface TranslationResponse<T = unknown> {
  result: T
  fromCache?: boolean
  processingTime?: number
  success: boolean
  error?: string
}

/**
 * Detailed translation action with validation and error handling
 */
export async function translateDetailedAction(
  text: string,
  userId?: string,
  saveToHistory: boolean = false,
): Promise<TranslationResponse<TranslationResult>> {
  try {
    // Validate input
    validateRequest(TranslationRequestSchema, {
      text,
      mode: 'detailed' as const,
      userId,
      saveToHistory,
    })

    // Get current user if not provided
    let currentUserId = userId
    if (!currentUserId && saveToHistory) {
      const user = await getCurrentUser()
      currentUserId = user?.id
    }

    const response = await translateWithCache({
      text,
      mode: 'detailed',
      userId: currentUserId,
      saveToHistory,
    })

    // Note: Cache invalidation will be handled by the API route when saving to history

    return {
      result: response.result as TranslationResult,
      fromCache: response.fromCache,
      processingTime: response.processingTime,
      success: true,
    }
  } catch (error) {
    console.error('translateDetailed error:', error)
    handleServerActionError(error)
  }
}
