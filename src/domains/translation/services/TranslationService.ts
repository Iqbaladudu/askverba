/**
 * Translation Service
 * Core business logic for translation operations
 */

import { createLogger } from '@/core/utils/logger'
import { TranslationRepository } from '@/infrastructure/database/repositories/TranslationRepository'
import { 
  TranslationRequest, 
  TranslationResult, 
  SimpleTranslationResult, 
  DetailedTranslationResult,
  TranslationStats,
  TranslationCacheEntry,
  TranslationServiceConfig,
  DEFAULT_TRANSLATION_CONFIG
} from '../types'
import { ERROR_CODES } from '@/core/constants/errors'
import { ApiError } from '@/infrastructure/database/repositories/BaseRepository'

// AI Provider interface
export interface AIProvider {
  translateSimple(request: TranslationRequest): Promise<SimpleTranslationResult>
  translateDetailed(request: TranslationRequest): Promise<DetailedTranslationResult>
  isAvailable(): boolean
  getProviderName(): string
}

// Cache service interface
export interface CacheService {
  get(key: string): Promise<TranslationCacheEntry | null>
  set(key: string, value: TranslationResult, ttl: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}

export class TranslationService {
  private logger = createLogger('TranslationService')
  private config: TranslationServiceConfig

  constructor(
    private translationRepo: TranslationRepository,
    private aiProvider: AIProvider,
    private cacheService?: CacheService,
    config?: Partial<TranslationServiceConfig>
  ) {
    this.config = { ...DEFAULT_TRANSLATION_CONFIG, ...config }
  }

  /**
   * Translate text with caching and history saving
   */
  async translate(request: TranslationRequest): Promise<{
    result: TranslationResult
    fromCache: boolean
    processingTime: number
  }> {
    const startTime = Date.now()
    
    try {
      // Validate request
      this.validateTranslationRequest(request)

      // Check cache first
      const cacheKey = this.generateCacheKey(request)
      let result: TranslationResult | null = null
      let fromCache = false

      if (this.config.cacheEnabled && this.cacheService) {
        const cached = await this.cacheService.get(cacheKey)
        if (cached && new Date(cached.expiresAt) > new Date()) {
          result = cached.result
          fromCache = true
          this.logger.debug('Translation served from cache', { cacheKey })
        }
      }

      // If not in cache, perform translation
      if (!result) {
        if (!this.aiProvider.isAvailable()) {
          throw new ApiError(
            ERROR_CODES.TRANSLATION.SERVICE_UNAVAILABLE,
            'AI translation service is not available'
          )
        }

        if (request.mode === 'simple') {
          result = await this.aiProvider.translateSimple(request)
        } else {
          result = await this.aiProvider.translateDetailed(request)
        }

        // Cache the result
        if (this.config.cacheEnabled && this.cacheService) {
          await this.cacheService.set(cacheKey, result, this.config.cacheTTL)
        }

        this.logger.info('Translation completed', {
          mode: request.mode,
          sourceLanguage: request.sourceLanguage,
          targetLanguage: request.targetLanguage,
          textLength: request.text.length,
          provider: this.aiProvider.getProviderName()
        })
      }

      // Save to history if requested
      if (request.saveToHistory && request.userId) {
        await this.saveToHistory(request, result)
      }

      const processingTime = Date.now() - startTime

      return {
        result,
        fromCache,
        processingTime
      }
    } catch (error) {
      const processingTime = Date.now() - startTime
      this.logger.error('Translation failed', error as Error, {
        request: {
          mode: request.mode,
          sourceLanguage: request.sourceLanguage,
          targetLanguage: request.targetLanguage,
          textLength: request.text.length
        },
        processingTime
      })
      throw error
    }
  }

  /**
   * Get translation history for a user
   */
  async getTranslationHistory(
    userId: string,
    options: {
      page?: number
      limit?: number
      sourceLanguage?: string
      targetLanguage?: string
      mode?: 'simple' | 'detailed'
    } = {}
  ) {
    return await this.translationRepo.findByUserId(userId, options)
  }

  /**
   * Search translation history
   */
  async searchTranslationHistory(
    userId: string,
    searchText: string,
    options: {
      page?: number
      limit?: number
      sourceLanguage?: string
      targetLanguage?: string
    } = {}
  ) {
    return await this.translationRepo.searchByText(userId, searchText, options)
  }

  /**
   * Get translation statistics for a user
   */
  async getTranslationStats(userId: string): Promise<TranslationStats> {
    return await this.translationRepo.getTranslationStats(userId)
  }

  /**
   * Update translation feedback
   */
  async updateTranslationFeedback(
    translationId: string,
    feedback: {
      rating?: number
      isUseful?: boolean
      userCorrection?: string
      comments?: string
      reportedIssues?: string[]
    }
  ) {
    return await this.translationRepo.updateWithFeedback(translationId, feedback)
  }

  /**
   * Delete translation from history
   */
  async deleteTranslation(translationId: string, userId: string) {
    // Verify ownership
    const translation = await this.translationRepo.findById(translationId)
    if (!translation || translation.user !== userId) {
      throw new ApiError(
        ERROR_CODES.AUTH.FORBIDDEN,
        'You do not have permission to delete this translation'
      )
    }

    await this.translationRepo.delete(translationId)
    this.logger.info('Translation deleted', { translationId, userId })
  }

  /**
   * Export translation history
   */
  async exportTranslationHistory(
    userId: string,
    options: {
      format?: 'json' | 'csv'
      dateFrom?: string
      dateTo?: string
      languages?: string[]
    } = {}
  ) {
    const translations = await this.translationRepo.getTranslationsForExport(userId, options)
    
    if (options.format === 'csv') {
      return this.convertToCSV(translations)
    }
    
    return JSON.stringify(translations, null, 2)
  }

  /**
   * Clear translation cache
   */
  async clearCache() {
    if (this.cacheService) {
      await this.cacheService.clear()
      this.logger.info('Translation cache cleared')
    }
  }

  /**
   * Get popular language pairs
   */
  async getPopularLanguagePairs(limit: number = 10) {
    return await this.translationRepo.getPopularLanguagePairs(limit)
  }

  // Private methods

  private validateTranslationRequest(request: TranslationRequest) {
    if (!request.text || request.text.trim().length === 0) {
      throw new ApiError(
        ERROR_CODES.VALIDATION.REQUIRED_FIELD,
        'Text is required for translation'
      )
    }

    if (request.text.length > this.config.maxTextLength) {
      throw new ApiError(
        ERROR_CODES.TRANSLATION.TEXT_TOO_LONG,
        `Text exceeds maximum length of ${this.config.maxTextLength} characters`
      )
    }

    if (!request.sourceLanguage || !request.targetLanguage) {
      throw new ApiError(
        ERROR_CODES.VALIDATION.REQUIRED_FIELD,
        'Source and target languages are required'
      )
    }

    if (request.sourceLanguage === request.targetLanguage) {
      throw new ApiError(
        ERROR_CODES.VALIDATION.INVALID_FORMAT,
        'Source and target languages cannot be the same'
      )
    }

    if (!['simple', 'detailed'].includes(request.mode)) {
      throw new ApiError(
        ERROR_CODES.VALIDATION.INVALID_ENUM,
        'Translation mode must be either "simple" or "detailed"'
      )
    }
  }

  private generateCacheKey(request: TranslationRequest): string {
    const { text, sourceLanguage, targetLanguage, mode } = request
    const textHash = this.hashString(text)
    return `translation:${mode}:${sourceLanguage}:${targetLanguage}:${textHash}`
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  private async saveToHistory(request: TranslationRequest, result: TranslationResult) {
    try {
      await this.translationRepo.create({
        user: request.userId!,
        originalText: request.text,
        translatedText: result.translatedText,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        mode: request.mode,
        result: result as any,
        tags: [],
        isFavorite: false,
      })

      this.logger.debug('Translation saved to history', {
        userId: request.userId,
        mode: request.mode
      })
    } catch (error) {
      this.logger.error('Failed to save translation to history', error as Error)
      // Don't throw here - translation was successful, history saving is secondary
    }
  }

  private convertToCSV(translations: any[]): string {
    if (translations.length === 0) return ''

    const headers = [
      'Date',
      'Original Text',
      'Translated Text',
      'Source Language',
      'Target Language',
      'Mode',
      'Rating'
    ]

    const rows = translations.map(t => [
      new Date(t.createdAt).toISOString(),
      `"${t.originalText.replace(/"/g, '""')}"`,
      `"${t.translatedText.replace(/"/g, '""')}"`,
      t.sourceLanguage,
      t.targetLanguage,
      t.mode,
      t.feedback?.rating || ''
    ])

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }
}
