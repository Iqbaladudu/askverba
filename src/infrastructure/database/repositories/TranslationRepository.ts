/**
 * Translation Repository
 * Handles database operations for translation history
 */

import { BaseRepository, QueryOptions } from './BaseRepository'
import { TranslationHistory } from '@/payload-types'

export interface TranslationHistoryEntity extends TranslationHistory {
  id: string
  createdAt: string
  updatedAt: string
}

export interface TranslationSearchOptions extends QueryOptions {
  userId?: string
  sourceLanguage?: string
  targetLanguage?: string
  mode?: 'simple' | 'detailed'
  dateFrom?: string
  dateTo?: string
}

export class TranslationRepository extends BaseRepository<TranslationHistoryEntity> {
  constructor() {
    super('translation-history')
  }

  /**
   * Find translations by user ID
   */
  async findByUserId(
    userId: string, 
    options: Partial<TranslationSearchOptions> = {}
  ): Promise<TranslationHistoryEntity[]> {
    const result = await this.findMany({
      where: {
        user: { equals: userId },
        ...(options.sourceLanguage && { sourceLanguage: { equals: options.sourceLanguage } }),
        ...(options.targetLanguage && { targetLanguage: { equals: options.targetLanguage } }),
        ...(options.mode && { mode: { equals: options.mode } }),
        ...(options.dateFrom && { 
          createdAt: { 
            greater_than_equal: options.dateFrom 
          } 
        }),
        ...(options.dateTo && { 
          createdAt: { 
            less_than_equal: options.dateTo 
          } 
        }),
      },
      sort: options.sort || '-createdAt',
      limit: options.limit || 20,
      page: options.page || 1,
    })

    return result.docs
  }

  /**
   * Find recent translations by user
   */
  async findRecentByUserId(userId: string, limit: number = 10): Promise<TranslationHistoryEntity[]> {
    const result = await this.findMany({
      where: { user: { equals: userId } },
      sort: '-createdAt',
      limit,
    })

    return result.docs
  }

  /**
   * Search translations by text content
   */
  async searchByText(
    userId: string, 
    searchText: string, 
    options: Partial<TranslationSearchOptions> = {}
  ): Promise<TranslationHistoryEntity[]> {
    const result = await this.findMany({
      where: {
        user: { equals: userId },
        or: [
          { originalText: { contains: searchText } },
          { translatedText: { contains: searchText } },
        ],
        ...(options.sourceLanguage && { sourceLanguage: { equals: options.sourceLanguage } }),
        ...(options.targetLanguage && { targetLanguage: { equals: options.targetLanguage } }),
        ...(options.mode && { mode: { equals: options.mode } }),
      },
      sort: options.sort || '-createdAt',
      limit: options.limit || 20,
      page: options.page || 1,
    })

    return result.docs
  }

  /**
   * Get translation statistics for a user
   */
  async getTranslationStats(userId: string): Promise<{
    total: number
    byMode: Record<string, number>
    byLanguagePair: Record<string, number>
    recentCount: number
  }> {
    // Get all translations for the user
    const allTranslations = await this.findMany({
      where: { user: { equals: userId } },
      limit: 10000, // Large limit to get all
    })

    const translations = allTranslations.docs

    // Calculate statistics
    const total = translations.length
    
    const byMode = translations.reduce((acc, t) => {
      const mode = t.mode || 'simple'
      acc[mode] = (acc[mode] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byLanguagePair = translations.reduce((acc, t) => {
      const pair = `${t.sourceLanguage}-${t.targetLanguage}`
      acc[pair] = (acc[pair] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Count recent translations (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentCount = translations.filter(t => 
      new Date(t.createdAt) > sevenDaysAgo
    ).length

    return {
      total,
      byMode,
      byLanguagePair,
      recentCount,
    }
  }

  /**
   * Delete old translations (cleanup)
   */
  async deleteOldTranslations(userId: string, daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const deletedCount = await this.deleteMany({
      user: { equals: userId },
      createdAt: { less_than: cutoffDate.toISOString() },
    })

    this.logger.info('Deleted old translations', { 
      userId, 
      daysOld, 
      deletedCount 
    })

    return deletedCount
  }

  /**
   * Get popular language pairs
   */
  async getPopularLanguagePairs(limit: number = 10): Promise<Array<{
    pair: string
    count: number
    sourceLanguage: string
    targetLanguage: string
  }>> {
    // This would be more efficient with aggregation, but PayloadCMS doesn't support it directly
    // So we'll fetch all and aggregate in memory (consider caching this result)
    const allTranslations = await this.findMany({
      limit: 10000, // Large limit
    })

    const pairCounts = allTranslations.docs.reduce((acc, t) => {
      const pair = `${t.sourceLanguage}-${t.targetLanguage}`
      if (!acc[pair]) {
        acc[pair] = {
          pair,
          count: 0,
          sourceLanguage: t.sourceLanguage,
          targetLanguage: t.targetLanguage,
        }
      }
      acc[pair].count++
      return acc
    }, {} as Record<string, { pair: string; count: number; sourceLanguage: string; targetLanguage: string }>)

    return Object.values(pairCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  /**
   * Check if translation exists (for duplicate detection)
   */
  async findDuplicate(
    userId: string,
    originalText: string,
    sourceLanguage: string,
    targetLanguage: string,
    mode: string
  ): Promise<TranslationHistoryEntity | null> {
    return await this.findOne({
      user: { equals: userId },
      originalText: { equals: originalText },
      sourceLanguage: { equals: sourceLanguage },
      targetLanguage: { equals: targetLanguage },
      mode: { equals: mode },
    })
  }

  /**
   * Update translation with feedback
   */
  async updateWithFeedback(
    id: string,
    feedback: {
      rating?: number
      isUseful?: boolean
      userCorrection?: string
    }
  ): Promise<TranslationHistoryEntity> {
    return await this.update(id, {
      feedback: feedback as any,
      updatedAt: new Date().toISOString(),
    })
  }

  /**
   * Get translations for export
   */
  async getTranslationsForExport(
    userId: string,
    options: {
      format?: 'json' | 'csv'
      dateFrom?: string
      dateTo?: string
      languages?: string[]
    } = {}
  ): Promise<TranslationHistoryEntity[]> {
    const whereClause: Record<string, unknown> = {
      user: { equals: userId },
    }

    if (options.dateFrom) {
      whereClause.createdAt = { 
        ...whereClause.createdAt as Record<string, unknown>,
        greater_than_equal: options.dateFrom 
      }
    }

    if (options.dateTo) {
      whereClause.createdAt = { 
        ...whereClause.createdAt as Record<string, unknown>,
        less_than_equal: options.dateTo 
      }
    }

    if (options.languages && options.languages.length > 0) {
      whereClause.or = [
        { sourceLanguage: { in: options.languages } },
        { targetLanguage: { in: options.languages } },
      ]
    }

    const result = await this.findMany({
      where: whereClause,
      sort: '-createdAt',
      limit: 10000, // Large limit for export
    })

    return result.docs
  }
}
