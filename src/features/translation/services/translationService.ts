'use server'

import { translateSimple, translateDetailed } from '@/infrastructure/ai/translate'
import { TranslationResult, SimpleTranslationResult } from '@/core/schema'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface TranslationRequest {
  text: string
  mode: 'simple' | 'detailed'
  userId?: string
  saveToHistory?: boolean
}

export interface TranslationResponse {
  result: SimpleTranslationResult | TranslationResult
  fromCache: boolean
  processingTime: number
  cached: boolean
}

/**
 * Main translation method
 */
export async function translateWithCache({
  text,
  mode,
  userId,
  saveToHistory = true,
}: TranslationRequest): Promise<TranslationResponse> {
  const startTime = Date.now()

  try {
    // 2. Perform translation
    console.log('Performing new translation')
    let result: SimpleTranslationResult | TranslationResult

    if (mode === 'simple') {
      result = await translateSimple(text)
    } else {
      result = await translateDetailed(text)
    }

    const processingTime = Date.now() - startTime

    // 3. Save to database history
    if (saveToHistory && userId) {
      await saveTranslationToHistory({
        originalText: text,
        result,
        mode,
        userId,
        fromCache: false,
        processingTime,
      })
    }

    return {
      result,
      fromCache: false,
      processingTime,
      cached: false,
    }
  } catch (error) {
    console.error('Translation service error:', error)
    throw new Error('Translation failed')
  }
}

/**
 * Save translation to database history
 */
async function saveTranslationToHistory({
  originalText,
  result,
  mode,
  userId,
  fromCache: _fromCache,
  processingTime,
}: {
  originalText: string
  result: SimpleTranslationResult | TranslationResult
  mode: 'simple' | 'detailed'
  userId: string
  fromCache: boolean
  processingTime: number
}): Promise<void> {
  try {
    const translatedText =
      'translation' in result
        ? result.translation // SimpleTranslationResult
        : result.type === 'single_term'
          ? result.data.main_translation
          : result.data.full_translation

    // Use Payload API directly in server action
    const payload = await getPayload({ config })

    await payload.create({
      collection: 'translation-history',
      data: {
        customer: userId,
        originalText,
        translatedText,
        sourceLanguage: 'English',
        targetLanguage: 'Indonesian',
        mode,
        characterCount: originalText.length,
        confidence: 95,
        isFavorite: false,
        detailedResult: typeof result === 'object' ? result : null,
        processingTime,
        aiModel: mode === 'simple' ? 'mistral-medium-2505' : 'magistral-medium-2507',
      },
    })
  } catch (error) {
    console.error('Failed to save translation history:', error)
    // Don't throw error here to avoid breaking the translation flow
  }
}

/**
 * Get user translation history with caching
 */
export async function getUserTranslationHistory(userId: string, options: any = {}): Promise<any> {
  try {
    // Fetch directly from database

    // Fetch from database using Payload API directly
    const payload = await getPayload({ config })

    const response = await payload.find({
      collection: 'translation-history',
      where: {
        customer: {
          equals: userId,
        },
      },
      limit: options.limit || 50,
      page: options.page || 1,
      sort: '-createdAt',
    })

    // Return response directly

    return { data: response, fromCache: false }
  } catch (error) {
    console.error('Failed to get user history:', error)
    throw error
  }
}

/**
 * Get popular translations
 */
export async function getPopularTranslations(): Promise<any> {
  try {
    // Fetch directly from database

    // This would require aggregation query to find most translated texts
    // For now, return empty array
    const popularTranslations: any[] = []

    // Return directly

    return { data: popularTranslations, fromCache: false }
  } catch (error) {
    console.error('Failed to get popular translations:', error)
    return { data: [], fromCache: false }
  }
}

/**
 * Clear user cache (useful when user updates preferences)
 */
export async function clearUserTranslationCache(userId: string): Promise<void> {
  // No cache to clear - direct database access
  console.log('Cache cleared for user:', userId)
}

/**
 * Get translation analytics
 */
export async function getTranslationCount(userId: string): Promise<number> {
  try {
    const payload = await getPayload({ config })

    const response = await payload.find({
      collection: 'translation-history',
      where: {
        customer: {
          equals: userId,
        },
      },
      limit: 0, // Just get count
    })

    return response.totalDocs || 0
  } catch (error) {
    console.error('Failed to get translation count:', error)
    return 0
  }
}
