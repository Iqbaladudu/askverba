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
const VOCABULARY_EXTRACTION_PROMPT = `You are an expert English vocabulary analyzer for Indonesian learners. Extract the most important and useful vocabulary items from the given English text, with contextual and neutral explanations.

GOALS
- Provide clear, context-driven explanations for Indonesian learners.
- Keep definitions neutral (avoid culture-specific assumptions unless necessary).
- Prioritize usefulness and frequency in everyday English.

EXTRACTION SCOPE
Extract a mix of:
- Words: nouns, verbs, adjectives, adverbs, prepositions (not articles like "the", "a").
- Phrases: common multi-word expressions and collocations.
- Idioms: any idiomatic expressions present.
- Sentence patterns: commonly used and reusable patterns (e.g., "It is + adj + to + verb", "be supposed to", "used to + verb").

SELECTION CRITERIA
1) Include items that are:
   - Common or highly useful in everyday communication
   - Helpful for Indonesian learners
   - Not too basic (avoid very elementary function words)
   - Not too advanced unless essential to the text
2) Balance parts of speech.
3) Avoid duplicates or near-duplicates unless usage differs meaningfully.

DIFFICULTY LEVELS
- easy: high-frequency, beginner-friendly
- medium: intermediate, broadly useful
- hard: advanced or specialized, or nuanced usage

FOR EACH ITEM PROVIDE
- word: the word/phrase/idiom/pattern exactly as it appears (for patterns, use a clear template)
- translation: accurate Indonesian gloss or closest natural equivalent
- type: one of ["noun","verb","adjective","adverb","preposition","phrase","idiom","sentence_pattern"]
- difficulty: "easy" | "medium" | "hard"
- context: concise, neutral explanation of meaning and typical usage in context, including:
  - what it means in the given text
  - how it's commonly used (register, typical collocations)
  - notes on grammar/structure if relevant (e.g., "followed by -ing", "takes object", "fixed phrase")

OUTPUT REQUIREMENTS
- Return JSON with a single key "vocabulary" mapping to an array of 5–15 items (prioritize quality).
- Each array element must include all fields: word, translation, type, difficulty, context.
- If the text contains idioms or sentence patterns, include them.
- Keep explanations concise but specific; avoid overly technical linguistics jargon.
- Do not include items that do not appear in the text, except to generalize a sentence pattern that is clearly exemplified.
- No links; no extra commentary outside the JSON.

Example response:
{
  "vocabulary": [
    {
      "word": "accomplish",
      "translation": "mencapai; menyelesaikan",
      "type": "verb",
      "difficulty": "medium",
      "context": "To successfully complete something after effort; often used with goals/tasks (e.g., accomplish a goal)."
    },
    {
      "word": "be supposed to",
      "translation": "seharusnya; diharapkan untuk",
      "type": "sentence_pattern",
      "difficulty": "medium",
      "context": "Pattern indicating expectation/obligation (subject + be supposed to + verb). Neutral register; common in spoken English."
    }
  ]
}

Extract vocabulary from the following text:`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const validatedData = validateRequest(VocabularyExtractionSchema, body) as z.infer<
      typeof VocabularyExtractionSchema
    >

    // Generate vocabulary extraction using AI
    const result = await generateObject({
      model: mistral('mistral-large-latest'),
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
