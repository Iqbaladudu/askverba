/**
 * Optimized translation server actions with Next.js best practices
 * Handles both simple and detailed translations with proper validation
 */

'use server'

import { translateWithCache } from '@/features/translation'
import { SimpleTranslationResult } from '@/core/schema'
import { handleServerActionError, validateRequest } from '@/infrastructure/api/error-handler'
import { TranslationRequestSchema } from '@/infrastructure/api/validation'
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
 * Simple translation action with validation and error handling
 */
export async function translateSimpleAction(
  text: string,
  userId?: string,
  saveToHistory: boolean = false,
): Promise<TranslationResponse<SimpleTranslationResult>> {
  try {
    // Validate input
    validateRequest(TranslationRequestSchema, {
      text,
      mode: 'simple' as const,
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
      mode: 'simple',
      userId: currentUserId,
      saveToHistory,
    })

    // Note: Cache invalidation will be handled by the API route when saving to history

    return {
      result: response.result as SimpleTranslationResult,
      fromCache: response.fromCache,
      processingTime: response.processingTime,
      success: true,
    }
  } catch (error) {
    console.error('translateSimple error:', error)
    handleServerActionError(error)
  }
}
