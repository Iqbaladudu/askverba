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
**Peran Anda:**
Anda adalah analis kosakata bahasa Inggris profesional untuk pembelajar bahasa Indonesia. Ekstrak item kosakata paling penting dan berguna dari teks bahasa Inggris yang diberikan, dengan penjelasan kontekstual dan netral.

**Tujuan Utama:**
1. Berikan penjelasan yang jelas dan berorientasi konteks untuk pembelajar Indonesia
2. Pertahankan definisi yang netral (hindari asumsi budaya tertentu kecuali diperlukan)
3. Prioritaskan kegunaan dan frekuensi penggunaan dalam bahasa Inggris sehari-hari

**Ruang Lingkup Ekstraksi:**
- Kata: kata benda, kata kerja, kata sifat, kata keterangan, kata depan (tidak termasuk artikel seperti "the", "a")
- Frasa: ekspresi multi-kata umum dan kolokasi
- Idiom: ekspresi idiomatis yang ada dalam teks
- Pola Kalimat: pola yang umum digunakan dan dapat digunakan kembali (misal: "It is + adj + to + verb")

**Kriteria Seleksi:**
1. Sertakan item yang:
   - Umum atau sangat berguna dalam komunikasi sehari-hari
   - Bermanfaat bagi pembelajar bahasa Indonesia
   - Tidak terlalu dasar (hindari kata fungsi yang sangat elementer)
   - Tidak terlalu sulit kecuali esensial untuk teks
2. Seimbangkan bagian-bagian pidato
3. Hindari duplikat atau hampir duplikat kecuali penggunaan berbeda secara bermakna

**Tingkat Kesulitan:**
- mudah: frekuensi tinggi, ramah pemula
- menengah: tingkat menengah, berguna secara luas
- sulit: lanjutan atau khusus, atau penggunaan yang bernuansa

**Format Output:**
- Kembalikan JSON dengan kunci tunggal "vocabulary" yang memetakan ke array 5-15 item (utamakan kualitas)
- Setiap elemen array harus mencakup semua field: word, translation, type, difficulty, context
- Jika teks mengandung idiom atau pola kalimat, sertakan
- Pertahankan penjelasan yang ringkas tetapi spesifik
- Jangan sertakan item yang tidak muncul dalam teks

**Contoh Respon:**
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

**Teks untuk Dianalisis:**
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
