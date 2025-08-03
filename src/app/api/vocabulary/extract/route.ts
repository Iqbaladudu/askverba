import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateObject } from 'ai'
import { xai } from '@ai-sdk/xai'
import { validateRequest } from '@/utils/api/error-handler'

// Schema for vocabulary extraction request
const VocabularyExtractionSchema = z.object({
  text: z.string().min(1, 'Text is required').max(2000, 'Text too long'),
  detailed: z.boolean().optional().default(false),
})

// Schema for vocabulary item
const vocabularyItemSchema = z.object({
  word: z.string(),
  translation: z.string(),
  type: z.enum(['noun', 'verb', 'adjective', 'phrase', 'idiom', 'adverb', 'preposition']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  context: z.string(),
})

// Schema for vocabulary extraction response
const vocabularyExtractionResponseSchema = z.object({
  vocabulary: z.array(vocabularyItemSchema),
})

// System prompt for vocabulary extraction
const VOCABULARY_EXTRACTION_PROMPT = `You are an expert English vocabulary analyzer. Your task is to extract the most important and useful vocabulary words from the given text for Indonesian learners of English.

EXTRACTION CRITERIA:
1. Focus on words that are:
   - Commonly used in everyday English
   - Useful for Indonesian learners
   - Not too basic (avoid words like "the", "and", "is")
   - Not too advanced unless they're essential to the text meaning

2. Include different word types:
   - Nouns (concrete and abstract)
   - Verbs (action and state)
   - Adjectives (descriptive)
   - Phrases (common expressions)
   - Idioms (if present)
   - Adverbs (important ones)
   - Prepositions (in phrases)

3. Difficulty levels:
   - easy: Basic words that beginners should know
   - medium: Intermediate words for developing learners
   - hard: Advanced words or specialized terms

4. For each word provide:
   - Accurate Indonesian translation
   - Clear context explaining usage
   - Appropriate word type classification
   - Realistic difficulty assessment

5. Extract 5-15 words maximum, prioritizing quality over quantity.

RESPONSE FORMAT:
Return a JSON object with a "vocabulary" array containing the extracted words.

Example response:
{
  "vocabulary": [
    {
      "word": "accomplish",
      "translation": "mencapai, menyelesaikan",
      "type": "verb",
      "difficulty": "medium",
      "context": "To successfully complete or achieve something, often requiring effort or skill"
    }
  ]
}

Extract vocabulary from the following text:`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const validatedData = validateRequest(VocabularyExtractionSchema, body)

    // Generate vocabulary extraction using AI
    const result = await generateObject({
      model: xai('grok-3-mini-fast-latest'),
      schema: vocabularyExtractionResponseSchema,
      system: VOCABULARY_EXTRACTION_PROMPT,
      prompt: validatedData.text,
      temperature: 0.3, // Lower temperature for more consistent results
    })

    // Validate the AI response
    const vocabulary = result.object.vocabulary || []

    // Filter and validate vocabulary items
    const validVocabulary = vocabulary.filter((item) => {
      return (
        item.word &&
        item.translation &&
        item.type &&
        item.difficulty &&
        item.context &&
        item.word.length > 1 &&
        item.translation.length > 1
      )
    })

    return NextResponse.json({
      success: true,
      vocabulary: validVocabulary,
      count: validVocabulary.length,
    })
  } catch (error) {
    console.error('Vocabulary extraction error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to extract vocabulary',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
