'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
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
export async function getUserVocabulary(userId: string): Promise<VocabularyResponse> {
  return getUserVocabularyWithOptions(userId, {})
}

/**
 * Get user vocabulary with options (pagination, search, filters)
 */
export async function getUserVocabularyWithOptions(
  userId: string,
  options: {
    page?: number
    limit?: number
    search?: string
    status?: string
    difficulty?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {},
): Promise<VocabularyResponse> {
  try {
    // Fetch from database
    const payload = await getPayload({ config })

    // Build query
    const where: any = {
      customer: {
        equals: userId,
      },
    }

    // Add search filter
    if (options.search) {
      where.or = [
        { word: { contains: options.search } },
        { translation: { contains: options.search } },
        { definition: { contains: options.search } },
      ]
    }

    // Add status filter
    if (options.status) {
      where.status = { equals: options.status }
    }

    // Add difficulty filter
    if (options.difficulty) {
      where.difficulty = { equals: options.difficulty }
    }

    // Build sort string
    const sortBy = options.sortBy || 'createdAt'
    const sortOrder = options.sortOrder === 'asc' ? '' : '-'
    const sort = `${sortOrder}${sortBy}`

    const response = await payload.find({
      collection: 'vocabulary',
      where,
      pagination: true,
      page: options.page || 1,
      limit: options.limit || 20,
      sort,
    })

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
      overrideAccess: true, // Bypass access control for stats
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
      lastPracticed:
        docs
          .filter((w) => w.lastPracticed)
          .sort(
            (a, b) => new Date(b.lastPracticed!).getTime() - new Date(a.lastPracticed!).getTime(),
          )[0]?.lastPracticed || undefined,
    }

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

    // Format tags array to match collection schema
    const formattedTags = data.tags
      ? Array.isArray(data.tags)
        ? data.tags.map((tag) => ({ tag: typeof tag === 'string' ? tag : tag.tag || '' }))
        : []
      : []

    const response = await payload.create({
      collection: 'vocabulary',
      data: {
        customer: userId,
        word: data.word || '',
        translation: data.translation || '',
        definition: data.definition || '',
        example: data.example || '',
        pronunciation: data.pronunciation || '',
        status: data.status || 'new',
        difficulty: data.difficulty || 'medium',
        practiceCount: 0,
        accuracy: 0,
        sourceLanguage: data.sourceLanguage || 'English',
        targetLanguage: data.targetLanguage || 'Indonesian',
        tags: formattedTags,
      },
    })

    // Data updated successfully

    return response
  } catch (error) {
    console.error('Failed to create vocabulary entry:', error)

    // Pass through specific error messages from PayloadCMS hooks
    if (error instanceof Error && error.message.includes('already exists')) {
      throw error // Re-throw the specific duplicate error
    }

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
      overrideAccess: true, // Bypass access control for updates
    })

    // Data updated successfully

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
      overrideAccess: true, // Bypass access control for deletes
    })

    // Data deleted successfully
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

    // Fetch words directly from database

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
      overrideAccess: true, // Bypass access control for practice words
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

    // Return words directly

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
