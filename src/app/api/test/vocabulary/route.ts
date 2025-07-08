import { NextRequest, NextResponse } from 'next/server'
import { createVocabularyEntry } from '@/lib/services/vocabularyService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, vocabularyItems } = body

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    if (!vocabularyItems || !Array.isArray(vocabularyItems)) {
      return NextResponse.json({ error: 'Vocabulary items array is required' }, { status: 400 })
    }

    console.log('Testing vocabulary creation with:', { customerId, vocabularyItems })

    const results = []
    const errors = []

    // Test creating each vocabulary item
    for (let i = 0; i < vocabularyItems.length; i++) {
      const item = vocabularyItems[i]
      try {
        console.log(`Creating vocabulary item ${i + 1}:`, item)
        
        const result = await createVocabularyEntry(customerId, {
          word: item.word,
          translation: item.translation,
          definition: item.context, // Map context to definition
          example: 'Test example text', // Use test example
          difficulty: item.difficulty,
          status: 'new',
          tags: [item.type, 'test-auto-extracted'], // Will be formatted by service
        })

        results.push(result)
        console.log(`Successfully created vocabulary item ${i + 1}:`, result.id)
      } catch (error) {
        console.error(`Failed to create vocabulary item ${i + 1}:`, error)
        errors.push({
          item,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      created: results.length,
      errors: errors.length,
      results,
      errors,
      message: `Created ${results.length} vocabulary items, ${errors.length} errors`
    })
  } catch (error) {
    console.error('Test vocabulary creation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to test vocabulary creation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
