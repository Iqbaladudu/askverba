'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { TranslationCache } from '@/lib/redis'
import { Vocabulary } from '@/payload-types'

export interface VocabularyOptions {
  limit?: number
  page?: number
  status?: 'new' | 'learning' | 'mastered'
  difficulty?: 'easy' | 'medium' | 'hard'
  search?: string
  sortBy?: 'word' | 'createdAt' | 'lastPracticed' | 'accuracy'
  sortOrder?: 'asc' | 'desc'
}

export interface VocabularyStats {
  totalWords: number
  masteredWords: number
  learningWords: number
  newWords: number
  averageAccuracy: number
  totalPracticeCount: number
  lastPracticed?: string
}

export interface VocabularyResponse {
  docs: Vocabulary[]
  totalDocs: number
  limit: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  fromCache: boolean
}

/**
 * Get user vocabulary with caching
 */
export async function getUserVocabulary(
  userId: string,
  options: VocabularyOptions = {},
): Promise<VocabularyResponse> {
  try {
    const {
      limit = 50,
      page = 1,
      status,
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options

    console.log('vocabularyService: getUserVocabulary called with:', { userId, options })

    // Create cache key based on options
    const cacheKey = `vocabulary:${userId}:${JSON.stringify(options)}`

    // Temporarily bypass cache for debugging
    console.log('vocabularyService: Bypassing cache for debugging')

    // Check cache first (only for simple queries without search)
    // if (!search) {
    //   const cached = await TranslationCache.getUserVocabulary(userId)
    //   if (cached && Array.isArray(cached)) {
    //     console.log('vocabularyService: Found cached data:', cached.length, 'items')
    //     // Apply filters to cached data
    //     let filteredData = cached

    //     if (status) {
    //       filteredData = filteredData.filter((item: any) => item.status === status)
    //     }

    //     if (difficulty) {
    //       filteredData = filteredData.filter((item: any) => item.difficulty === difficulty)
    //     }

    //     // Apply sorting
    //     filteredData.sort((a: any, b: any) => {
    //       const aValue = a[sortBy] || ''
    //       const bValue = b[sortBy] || ''

    //       if (sortOrder === 'asc') {
    //         return aValue > bValue ? 1 : -1
    //       } else {
    //         return aValue < bValue ? 1 : -1
    //       }
    //     })

    //     // Apply pagination
    //     const startIndex = (page - 1) * limit
    //     const endIndex = startIndex + limit
    //     const paginatedData = filteredData.slice(startIndex, endIndex)

    //     return {
    //       docs: paginatedData,
    //       totalDocs: filteredData.length,
    //       limit,
    //       page,
    //       totalPages: Math.ceil(filteredData.length / limit),
    //       hasNextPage: endIndex < filteredData.length,
    //       hasPrevPage: page > 1,
    //       fromCache: true,
    //     }
    //   }
    // }

    // Fetch from database
    const payload = await getPayload({ config })

    // Build query
    const where: any = {
      customer: {
        equals: userId,
      },
    }

    if (status) {
      where.status = { equals: status }
    }

    if (difficulty) {
      where.difficulty = { equals: difficulty }
    }

    if (search) {
      where.or = [
        { word: { contains: search } },
        { translation: { contains: search } },
        { definition: { contains: search } },
      ]
    }

    // Build sort
    const sort = `${sortOrder === 'desc' ? '-' : ''}${sortBy}`

    console.log('vocabularyService: Querying database with:', { where, limit, page, sort })

    const response = await payload.find({
      collection: 'vocabulary',
      where,
      limit,
      page,
      sort,
    })

    console.log('vocabularyService: Database response:', {
      docsCount: response.docs?.length || 0,
      totalDocs: response.totalDocs,
      docs: response.docs,
    })

    // Cache the result (only if no search to avoid cache pollution)
    if (!search && response.docs) {
      await TranslationCache.cacheUserVocabulary(userId, response.docs)
    }

    return {
      docs: response.docs,
      totalDocs: response.totalDocs,
      limit: response.limit,
      page: response.page || 1,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPrevPage: response.hasPrevPage,
      fromCache: false,
    }
  } catch (error) {
    console.error('Failed to get user vocabulary:', error)
    throw new Error('Failed to fetch vocabulary')
  }
}

/**
 * Get vocabulary statistics with caching
 */
export async function getVocabularyStats(userId: string): Promise<VocabularyStats> {
  try {
    // Check cache first
    const cached = await TranslationCache.getVocabularyStats(userId)
    if (cached) {
      return cached
    }

    // Fetch from database
    const payload = await getPayload({ config })

    const response = await payload.find({
      collection: 'vocabulary',
      where: {
        customer: {
          equals: userId,
        },
      },
      limit: 1000, // Get all for stats calculation
    })

    const docs = response.docs || []

    const stats: VocabularyStats = {
      totalWords: docs.length,
      masteredWords: docs.filter((w) => w.status === 'mastered').length,
      learningWords: docs.filter((w) => w.status === 'learning').length,
      newWords: docs.filter((w) => w.status === 'new').length,
      averageAccuracy:
        docs.length > 0
          ? Math.round(docs.reduce((sum, w) => sum + (w.accuracy || 0), 0) / docs.length)
          : 0,
      totalPracticeCount: docs.reduce((sum, w) => sum + (w.practiceCount || 0), 0),
      lastPracticed: docs
        .filter((w) => w.lastPracticed)
        .sort(
          (a, b) => new Date(b.lastPracticed!).getTime() - new Date(a.lastPracticed!).getTime(),
        )[0]?.lastPracticed,
    }

    // Cache the stats
    await TranslationCache.cacheVocabularyStats(userId, stats)

    return stats
  } catch (error) {
    console.error('Failed to get vocabulary stats:', error)
    throw new Error('Failed to fetch vocabulary statistics')
  }
}

/**
 * Create new vocabulary entry
 */
export async function createVocabularyEntry(
  userId: string,
  data: Partial<Vocabulary>,
): Promise<Vocabulary> {
  try {
    const payload = await getPayload({ config })

    const response = await payload.create({
      collection: 'vocabulary',
      data: {
        ...data,
        customer: userId,
        status: data.status || 'new',
        difficulty: data.difficulty || 'medium',
        practiceCount: 0,
        accuracy: 0,
      },
    })

    // Clear user cache to refresh data
    await TranslationCache.clearUserCache(userId)

    return response
  } catch (error) {
    console.error('Failed to create vocabulary entry:', error)
    throw new Error('Failed to create vocabulary entry')
  }
}

/**
 * Update vocabulary entry
 */
export async function updateVocabularyEntry(
  userId: string,
  id: string,
  data: Partial<Vocabulary>,
): Promise<Vocabulary> {
  try {
    const payload = await getPayload({ config })

    const response = await payload.update({
      collection: 'vocabulary',
      id,
      data,
    })

    // Clear user cache to refresh data
    await TranslationCache.clearUserCache(userId)

    return response
  } catch (error) {
    console.error('Failed to update vocabulary entry:', error)
    throw new Error('Failed to update vocabulary entry')
  }
}

/**
 * Delete vocabulary entry
 */
export async function deleteVocabularyEntry(userId: string, id: string): Promise<void> {
  try {
    const payload = await getPayload({ config })

    await payload.delete({
      collection: 'vocabulary',
      id,
    })

    // Clear user cache to refresh data
    await TranslationCache.clearUserCache(userId)
  } catch (error) {
    console.error('Failed to delete vocabulary entry:', error)
    throw new Error('Failed to delete vocabulary entry')
  }
}

/**
 * Get words for practice with intelligent selection
 */
export async function getWordsForPractice(
  userId: string,
  options: {
    limit?: number
    difficulty?: 'easy' | 'medium' | 'hard'
    status?: 'new' | 'learning' | 'mastered'
    prioritizeWeak?: boolean
  } = {},
): Promise<Vocabulary[]> {
  try {
    const { limit = 20, difficulty, status, prioritizeWeak = true } = options

    // Check cache first
    const cached = await TranslationCache.getPracticeWords(userId, options)
    if (cached) {
      return cached
    }

    const payload = await getPayload({ config })

    // Build query for practice words
    const where: any = {
      customer: {
        equals: userId,
      },
    }

    if (difficulty) {
      where.difficulty = { equals: difficulty }
    }

    if (status) {
      where.status = { equals: status }
    }

    // Get words with spaced repetition algorithm
    let sort = '-createdAt' // Default to newest first

    if (prioritizeWeak) {
      // Prioritize words that need practice:
      // 1. Never practiced (lastPracticed is null)
      // 2. Low accuracy
      // 3. Haven't been practiced recently
      sort = 'lastPracticed,accuracy,-createdAt'
    }

    const response = await payload.find({
      collection: 'vocabulary',
      where,
      limit: limit * 2, // Get more to allow for intelligent selection
      sort,
    })

    let words = response.docs || []

    // Apply intelligent selection if we have more words than needed
    if (words.length > limit && prioritizeWeak) {
      // Score words based on practice priority
      words = words
        .map((word) => ({
          ...word,
          practiceScore: calculatePracticeScore(word),
        }))
        .sort((a, b) => (b as any).practiceScore - (a as any).practiceScore)
        .slice(0, limit)
    } else {
      words = words.slice(0, limit)
    }

    // Cache the result
    await TranslationCache.cachePracticeWords(userId, options, words)

    return words
  } catch (error) {
    console.error('Failed to get practice words:', error)
    throw new Error('Failed to get practice words')
  }
}

/**
 * Calculate practice priority score for a word
 */
function calculatePracticeScore(word: Vocabulary): number {
  let score = 0

  // Never practiced gets highest priority
  if (!word.lastPracticed) {
    score += 100
  } else {
    // Time since last practice (more time = higher priority)
    const daysSinceLastPractice = Math.floor(
      (Date.now() - new Date(word.lastPracticed).getTime()) / (1000 * 60 * 60 * 24),
    )
    score += Math.min(daysSinceLastPractice * 5, 50)
  }

  // Low accuracy gets higher priority
  const accuracy = word.accuracy || 0
  score += (100 - accuracy) * 0.3

  // New words get medium priority
  if (word.status === 'new') {
    score += 30
  }

  // Learning words get high priority
  if (word.status === 'learning') {
    score += 40
  }

  // Mastered words get lower priority
  if (word.status === 'mastered') {
    score -= 20
  }

  return score
}
