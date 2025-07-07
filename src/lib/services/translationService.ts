'use server'

import { translateSimple, translateDetailed } from '@/lib/translate'
import { TranslationCache } from '@/lib/redis'
import { TranslationResult, SimpleTranslationResult } from '@/components/schema'
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
 * Main translation method with caching
 */
export async function translateWithCache({
  text,
  mode,
  userId,
  saveToHistory = true,
}: TranslationRequest): Promise<TranslationResponse> {
  const startTime = Date.now()

  try {
    // 1. Check cache first
    const cachedResult = await TranslationCache.getCachedTranslation(text, mode)

    if (cachedResult) {
      console.log('Translation served from cache')

      // Still save to user history if requested
      if (saveToHistory && userId) {
        await saveTranslationToHistory({
          originalText: text,
          result: cachedResult,
          mode,
          userId,
          fromCache: true,
          processingTime: Date.now() - startTime,
        })
      }

      return {
        result: cachedResult,
        fromCache: true,
        processingTime: Date.now() - startTime,
        cached: true,
      }
    }

    // 2. Perform translation
    console.log('Performing new translation')
    let result: SimpleTranslationResult | TranslationResult

    if (mode === 'simple') {
      result = await translateSimple(text)
    } else {
      result = await translateDetailed(text)
    }

    const processingTime = Date.now() - startTime

    // 3. Cache the result
    await TranslationCache.cacheTranslation(text, mode, result)

    // 4. Save to database history
    if (saveToHistory && userId) {
      await saveTranslationToHistory({
        originalText: text,
        result,
        mode,
        userId,
        fromCache: false,
        processingTime,
      })

      // Increment user translation count
      await TranslationCache.incrementTranslationCount(userId)

      // Clear user cache to refresh data
      await TranslationCache.clearUserCache(userId)
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
        aiModel: mode === 'simple' ? 'grok-3-mini-fast-latest' : 'mistral-large-2402',
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
    // Check cache first
    const cached = await TranslationCache.getUserTranslations(userId)
    if (cached && !options.forceRefresh) {
      return { data: cached, fromCache: true }
    }

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

    // Cache the result
    if (response.docs) {
      await TranslationCache.cacheUserTranslations(userId, response.docs)
    }

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
    // Check cache first
    const cached = await TranslationCache.getPopularTranslations()
    if (cached) {
      return { data: cached, fromCache: true }
    }

    // This would require aggregation query to find most translated texts
    // For now, return empty array
    const popularTranslations: any[] = []

    // Cache the result
    await TranslationCache.cachePopularTranslations(popularTranslations)

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
  await TranslationCache.clearUserCache(userId)
}

/**
 * Get translation analytics
 */
export async function getTranslationCount(userId: string): Promise<number> {
  try {
    return await TranslationCache.incrementTranslationCount(userId)
  } catch (error) {
    console.error('Failed to get translation count:', error)
    return 0
  }
}
