import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateObject } from 'ai'
import { xai } from '@ai-sdk/xai'
import { validateRequest } from '@/utils/api/error-handler'
import { mistral } from '@/utils'

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
const VOCABULARY_EXTRACTION_PROMPT = `
You are an expert English vocabulary analyzer and translator. Your task is to:
1. Extract ALL meaningful vocabulary words from the given text (excluding only basic function words like "the", "and", "is", etc.).
2. Provide accurate Indonesian translations for each word.
3. Identify and analyze idioms (if present), including their literal and contextual meanings in Indonesian.
4. Classify each word based on type, difficulty, and context.

---

### EXTRACTION CRITERIA:

#### 1. General Vocabulary Extraction
- **Inclusion:** Extract ALL meaningful words (nouns, verbs, adjectives, adverbs, prepositions, phrases, etc.).
- **Exclusion:** Skip only basic function words (articles, conjunctions, auxiliary verbs like "the", "and", "is", "are", etc.).
- **Translation:** Provide precise Indonesian translations for each word.
- **Classification:**
  - **Type:** Noun, verb, adjective, adverb, preposition, phrase, idiom, etc.
  - **Difficulty:** easy (basic), medium (intermediate), hard (advanced).
  - **Context:** Brief explanation of usage or meaning in English.

#### 2. Idiom Analysis (If Present)
- **Identify idioms** in the text.
- **Provide:**
  - **Literal translation** (terjemahan harfiah).
  - **Contextual meaning** (arti sebenarnya dalam bahasa Indonesia).
  - **Example usage** (jika memungkinkan).
- **Difficulty:** Usually medium or hard due to cultural nuances.

---

### RESPONSE FORMAT:
Return a JSON object with:
1. A "vocabulary" array containing all extracted words.
2. An "idioms" array (if any idioms are found).

#### Example Response:
\`\`\`json
{
  "vocabulary": [
    {
      "word": "accomplish",
      "translation": "mencapai, menyelesaikan",
      "type": "verb",
      "difficulty": "medium",
      "context": "To successfully complete or achieve something, often requiring effort or skill."
    },
    {
      "word": "challenge",
      "translation": "tantangan",
      "type": "noun",
      "difficulty": "easy",
      "context": "A difficult task or situation that tests someone's abilities."
    }
  ],
  "idioms": [
    {
      "idiom": "break a leg",
      "literal_translation": "patah kaki",
      "contextual_meaning": "semoga sukses (digunakan untuk memberi semangat sebelum pertunjukan)",
      "difficulty": "medium",
      "example": "Before the performance, she said, 'Break a leg!'"
    }
  ]
}
\`\`\`

---

### TEXT TO ANALYZE:
[Masukkan teks yang ingin dianalisis di sini]

### INSTRUCTIONS:
1. Extract ALL meaningful words (except basic function words).
2. Provide translations for each word.
3. Identify and analyze idioms (if any).
4. Classify each word as shown in the example.
5. Return the response in the specified JSON format.
`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const validatedData = validateRequest(VocabularyExtractionSchema, body) as z.infer<
      typeof VocabularyExtractionSchema
    >

    // Generate vocabulary extraction using AI
    const result = await generateObject({
      model: mistral('mistral-medium-latest'),
      schema: vocabularyExtractionResponseSchema,
      system: VOCABULARY_EXTRACTION_PROMPT,
      prompt: validatedData.text,
      temperature: 0.5, // Lower temperature for more consistent results
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
