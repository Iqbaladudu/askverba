/**
 * Integration Test for Vocabulary and Practice Features with Redis
 * This file contains test functions to verify the production-ready integration
 */

import { getUserVocabulary, getVocabularyStats, createVocabularyEntry } from './services/vocabularyService'
import { createPracticeSession, getPracticeStats } from './services/practiceService'
import { TranslationCache } from './redis'

// Test user ID (replace with actual user ID for testing)
const TEST_USER_ID = 'test-user-123'

/**
 * Test vocabulary service integration
 */
export async function testVocabularyIntegration() {
  console.log('🧪 Testing Vocabulary Service Integration...')
  
  try {
    // Test 1: Get vocabulary with caching
    console.log('📚 Testing vocabulary retrieval...')
    const vocabularyResponse = await getUserVocabulary(TEST_USER_ID, {
      limit: 10,
      page: 1,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    
    console.log('✅ Vocabulary retrieved:', {
      totalDocs: vocabularyResponse.totalDocs,
      fromCache: vocabularyResponse.fromCache,
      docsCount: vocabularyResponse.docs.length
    })

    // Test 2: Get vocabulary stats with caching
    console.log('📊 Testing vocabulary stats...')
    const stats = await getVocabularyStats(TEST_USER_ID)
    
    console.log('✅ Stats retrieved:', {
      totalWords: stats.totalWords,
      masteredWords: stats.masteredWords,
      averageAccuracy: stats.averageAccuracy
    })

    // Test 3: Create new vocabulary entry
    console.log('➕ Testing vocabulary creation...')
    const newWord = await createVocabularyEntry(TEST_USER_ID, {
      word: 'integration',
      translation: 'integrasi',
      definition: 'The process of combining or coordinating separate elements',
      example: 'The integration of new technology improved efficiency.',
      difficulty: 'medium',
      status: 'new'
    })
    
    console.log('✅ Vocabulary entry created:', newWord.id)

    // Test 4: Test cache invalidation
    console.log('🔄 Testing cache invalidation...')
    const updatedVocabulary = await getUserVocabulary(TEST_USER_ID, {
      limit: 10,
      page: 1
    })
    
    console.log('✅ Cache invalidated, fresh data retrieved:', {
      fromCache: updatedVocabulary.fromCache,
      totalDocs: updatedVocabulary.totalDocs
    })

    return { success: true, message: 'Vocabulary integration tests passed' }
  } catch (error) {
    console.error('❌ Vocabulary integration test failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Test practice service integration
 */
export async function testPracticeIntegration() {
  console.log('🧪 Testing Practice Service Integration...')
  
  try {
    // Test 1: Create practice session
    console.log('🎯 Testing practice session creation...')
    const sessionData = {
      sessionType: 'flashcard' as const,
      words: [
        {
          vocabularyId: 'test-vocab-1',
          isCorrect: true,
          timeSpent: 5000,
          attempts: 1
        },
        {
          vocabularyId: 'test-vocab-2',
          isCorrect: false,
          timeSpent: 8000,
          attempts: 2
        }
      ],
      score: 75,
      timeSpent: 13000,
      difficulty: 'medium' as const,
      metadata: {
        totalQuestions: 2,
        correctAnswers: 1,
        averageTimePerQuestion: 6500,
        streakCount: 1
      }
    }

    const session = await createPracticeSession(TEST_USER_ID, sessionData)
    console.log('✅ Practice session created:', session.id)

    // Test 2: Get practice stats with caching
    console.log('📈 Testing practice stats...')
    const practiceStats = await getPracticeStats(TEST_USER_ID)
    
    console.log('✅ Practice stats retrieved:', {
      totalSessions: practiceStats.totalSessions,
      averageScore: practiceStats.averageScore,
      currentStreak: practiceStats.currentStreak
    })

    return { success: true, message: 'Practice integration tests passed' }
  } catch (error) {
    console.error('❌ Practice integration test failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Test Redis caching functionality
 */
export async function testRedisCaching() {
  console.log('🧪 Testing Redis Caching...')
  
  try {
    // Test 1: Cache vocabulary data
    console.log('💾 Testing vocabulary caching...')
    const testVocabulary = [
      { id: '1', word: 'test', translation: 'tes' },
      { id: '2', word: 'cache', translation: 'cache' }
    ]
    
    await TranslationCache.cacheUserVocabulary(TEST_USER_ID, testVocabulary)
    console.log('✅ Vocabulary cached successfully')

    // Test 2: Retrieve cached vocabulary
    const cachedVocabulary = await TranslationCache.getUserVocabulary(TEST_USER_ID)
    console.log('✅ Vocabulary retrieved from cache:', cachedVocabulary?.length || 0, 'items')

    // Test 3: Cache vocabulary stats
    console.log('📊 Testing stats caching...')
    const testStats = {
      totalWords: 100,
      masteredWords: 25,
      learningWords: 50,
      newWords: 25,
      averageAccuracy: 85
    }
    
    await TranslationCache.cacheVocabularyStats(TEST_USER_ID, testStats)
    const cachedStats = await TranslationCache.getVocabularyStats(TEST_USER_ID)
    console.log('✅ Stats cached and retrieved:', cachedStats?.totalWords || 0, 'total words')

    // Test 4: Cache practice words
    console.log('🎯 Testing practice words caching...')
    const practiceOptions = { limit: 20, difficulty: 'medium' }
    const testPracticeWords = [
      { id: '1', word: 'practice', difficulty: 'medium' },
      { id: '2', word: 'cache', difficulty: 'medium' }
    ]
    
    await TranslationCache.cachePracticeWords(TEST_USER_ID, practiceOptions, testPracticeWords)
    const cachedPracticeWords = await TranslationCache.getPracticeWords(TEST_USER_ID, practiceOptions)
    console.log('✅ Practice words cached and retrieved:', cachedPracticeWords?.length || 0, 'words')

    // Test 5: Clear user cache
    console.log('🧹 Testing cache clearing...')
    await TranslationCache.clearUserCache(TEST_USER_ID)
    console.log('✅ User cache cleared successfully')

    return { success: true, message: 'Redis caching tests passed' }
  } catch (error) {
    console.error('❌ Redis caching test failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Run all integration tests
 */
export async function runAllIntegrationTests() {
  console.log('🚀 Starting Production Integration Tests...')
  console.log('=' .repeat(50))
  
  const results = []
  
  // Test vocabulary integration
  const vocabularyResult = await testVocabularyIntegration()
  results.push({ test: 'Vocabulary Integration', ...vocabularyResult })
  
  console.log('\n' + '=' .repeat(50))
  
  // Test practice integration
  const practiceResult = await testPracticeIntegration()
  results.push({ test: 'Practice Integration', ...practiceResult })
  
  console.log('\n' + '=' .repeat(50))
  
  // Test Redis caching
  const redisResult = await testRedisCaching()
  results.push({ test: 'Redis Caching', ...redisResult })
  
  console.log('\n' + '=' .repeat(50))
  console.log('📋 Test Results Summary:')
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} ${result.test}`)
    if (!result.success) {
      console.log(`   Error: ${result.error}`)
    }
  })
  
  const allPassed = results.every(r => r.success)
  console.log('\n' + '=' .repeat(50))
  console.log(allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed')
  
  return {
    allPassed,
    results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  }
}

/**
 * Performance test for caching
 */
export async function testCachePerformance() {
  console.log('⚡ Testing Cache Performance...')
  
  const iterations = 10
  let cacheHitTime = 0
  let cacheMissTime = 0
  
  // Test cache miss (first call)
  const startMiss = Date.now()
  await getUserVocabulary(TEST_USER_ID, { limit: 50 })
  cacheMissTime = Date.now() - startMiss
  
  // Test cache hits (subsequent calls)
  for (let i = 0; i < iterations; i++) {
    const startHit = Date.now()
    await getUserVocabulary(TEST_USER_ID, { limit: 50 })
    cacheHitTime += Date.now() - startHit
  }
  
  const avgCacheHitTime = cacheHitTime / iterations
  
  console.log('📊 Performance Results:')
  console.log(`   Cache Miss: ${cacheMissTime}ms`)
  console.log(`   Cache Hit (avg): ${avgCacheHitTime.toFixed(2)}ms`)
  console.log(`   Performance Improvement: ${(cacheMissTime / avgCacheHitTime).toFixed(2)}x faster`)
  
  return {
    cacheMissTime,
    avgCacheHitTime,
    performanceImprovement: cacheMissTime / avgCacheHitTime
  }
}
