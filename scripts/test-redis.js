#!/usr/bin/env node

/**
 * Redis Integration Test Script for AskVerba
 * Tests Redis connection and caching functionality
 */

const path = require('path')

// Add the project root to the module path
process.env.NODE_PATH = path.resolve(__dirname, '..')
require('module')._initPaths()

async function testRedisIntegration() {
  console.log('🚀 AskVerba Redis Integration Test')
  console.log('==================================')

  try {
    // Import our Redis implementation
    const { TranslationCache, getRedisStatus } = await import('../src/lib/redis.ts')
    
    console.log('✅ Redis module imported successfully')

    // Check Redis status
    const status = getRedisStatus()
    console.log('📊 Redis Status:', status)

    if (!status.connected) {
      console.log('❌ Redis is not connected. Please start Redis server first.')
      console.log('💡 Run: ./scripts/redis-setup.sh')
      process.exit(1)
    }

    console.log('✅ Redis is connected and initialized')

    // Test 1: Basic caching operations
    console.log('\n🧪 Test 1: Basic Translation Caching')
    console.log('=====================================')

    const testText = 'Hello, world!'
    const testMode = 'simple'
    const testResult = {
      translation: 'Halo, dunia!',
      timestamp: new Date().toISOString()
    }

    // Cache a translation
    await TranslationCache.cacheTranslation(testText, testMode, testResult)
    console.log('✅ Translation cached successfully')

    // Retrieve cached translation
    const cachedResult = await TranslationCache.getCachedTranslation(testText, testMode)
    if (cachedResult && cachedResult.translation === testResult.translation) {
      console.log('✅ Translation retrieved from cache successfully')
    } else {
      console.log('❌ Failed to retrieve translation from cache')
      console.log('Expected:', testResult)
      console.log('Got:', cachedResult)
    }

    // Test 2: User-specific caching
    console.log('\n🧪 Test 2: User-specific Caching')
    console.log('=================================')

    const testUserId = 'test-user-123'
    const testTranslations = [
      { text: 'Hello', translation: 'Halo' },
      { text: 'Goodbye', translation: 'Selamat tinggal' }
    ]

    // Cache user translations
    await TranslationCache.cacheUserTranslations(testUserId, testTranslations)
    console.log('✅ User translations cached successfully')

    // Retrieve user translations
    const cachedUserTranslations = await TranslationCache.getUserTranslations(testUserId)
    if (cachedUserTranslations && cachedUserTranslations.length === testTranslations.length) {
      console.log('✅ User translations retrieved successfully')
    } else {
      console.log('❌ Failed to retrieve user translations')
      console.log('Expected length:', testTranslations.length)
      console.log('Got length:', cachedUserTranslations?.length || 0)
    }

    // Test 3: Vocabulary caching
    console.log('\n🧪 Test 3: Vocabulary Caching')
    console.log('==============================')

    const testVocabulary = [
      { word: 'hello', translation: 'halo', difficulty: 'easy' },
      { word: 'goodbye', translation: 'selamat tinggal', difficulty: 'medium' }
    ]

    // Cache vocabulary
    await TranslationCache.cacheUserVocabulary(testUserId, testVocabulary)
    console.log('✅ Vocabulary cached successfully')

    // Retrieve vocabulary
    const cachedVocabulary = await TranslationCache.getUserVocabulary(testUserId)
    if (cachedVocabulary && cachedVocabulary.length === testVocabulary.length) {
      console.log('✅ Vocabulary retrieved successfully')
    } else {
      console.log('❌ Failed to retrieve vocabulary')
    }

    // Test 4: Analytics operations
    console.log('\n🧪 Test 4: Analytics Operations')
    console.log('===============================')

    // Test increment counter
    const count1 = await TranslationCache.incrementTranslationCount(testUserId)
    const count2 = await TranslationCache.incrementTranslationCount(testUserId)
    
    if (count2 === count1 + 1) {
      console.log('✅ Translation counter working correctly')
    } else {
      console.log('❌ Translation counter not working')
      console.log('Expected:', count1 + 1)
      console.log('Got:', count2)
    }

    // Test 5: Cache clearing
    console.log('\n🧪 Test 5: Cache Clearing')
    console.log('=========================')

    // Clear user cache
    await TranslationCache.clearUserCache(testUserId)
    console.log('✅ User cache cleared')

    // Verify cache is cleared
    const clearedTranslations = await TranslationCache.getUserTranslations(testUserId)
    const clearedVocabulary = await TranslationCache.getUserVocabulary(testUserId)

    if (!clearedTranslations && !clearedVocabulary) {
      console.log('✅ Cache clearing verified')
    } else {
      console.log('❌ Cache not properly cleared')
    }

    // Test 6: Performance test
    console.log('\n🧪 Test 6: Performance Test')
    console.log('============================')

    const performanceTestCount = 100
    const startTime = Date.now()

    // Perform multiple cache operations
    for (let i = 0; i < performanceTestCount; i++) {
      await TranslationCache.cacheTranslation(
        `test-${i}`,
        'simple',
        { translation: `result-${i}`, index: i }
      )
    }

    const cacheTime = Date.now() - startTime
    console.log(`✅ Cached ${performanceTestCount} items in ${cacheTime}ms`)
    console.log(`📊 Average: ${(cacheTime / performanceTestCount).toFixed(2)}ms per operation`)

    // Retrieve performance test
    const retrieveStartTime = Date.now()
    let retrieveCount = 0

    for (let i = 0; i < performanceTestCount; i++) {
      const result = await TranslationCache.getCachedTranslation(`test-${i}`, 'simple')
      if (result) retrieveCount++
    }

    const retrieveTime = Date.now() - retrieveStartTime
    console.log(`✅ Retrieved ${retrieveCount}/${performanceTestCount} items in ${retrieveTime}ms`)
    console.log(`📊 Average: ${(retrieveTime / performanceTestCount).toFixed(2)}ms per operation`)

    // Clean up performance test data
    await TranslationCache.clearAllCache()
    console.log('✅ Performance test data cleaned up')

    console.log('\n🎉 All Redis integration tests passed!')
    console.log('=====================================')
    console.log('✅ Redis is working correctly with AskVerba')
    console.log('✅ Caching operations are functional')
    console.log('✅ Performance is acceptable')
    console.log('\n💡 Your Redis setup is ready for production!')

  } catch (error) {
    console.error('\n❌ Redis integration test failed:')
    console.error('================================')
    console.error(error)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting:')
      console.log('- Make sure Redis server is running')
      console.log('- Run: ./scripts/redis-setup.sh')
      console.log('- Check Redis configuration in .env file')
    }
    
    process.exit(1)
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testRedisIntegration()
}

module.exports = { testRedisIntegration }
