import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/features/auth/actions'
import { getUserVocabularyWithOptions } from '@/features/vocabulary'
import {
  createExportPackage,
  AnkiExportOptions,
} from '@/features/vocabulary/services/ankiExportService'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      format = 'csv',
      includeDefinition = true,
      includeExample = true,
      includePronunciation = true,
      includeTags = true,
      deckName = 'AskVerba Vocabulary',
      cardType = 'basic',
      limit = 50,
      filters = {},
    } = body

    // Validate format
    if (!['csv', 'txt'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format. Must be csv or txt' }, { status: 400 })
    }

    // Validate card type
    if (!['basic', 'basic-reverse', 'cloze'].includes(cardType)) {
      return NextResponse.json({ error: 'Invalid card type' }, { status: 400 })
    }

    // Get vocabulary items with limit (user-selected)
    const vocabularyResponse = await getUserVocabularyWithOptions(user.id, { limit })

    if (!vocabularyResponse.docs || vocabularyResponse.docs.length === 0) {
      return NextResponse.json({ error: 'No vocabulary items found' }, { status: 404 })
    }

    // Create export options
    const exportOptions: AnkiExportOptions = {
      format: format as 'csv' | 'txt',
      includeDefinition,
      includeExample,
      includePronunciation,
      includeTags,
      deckName,
      cardType: cardType as 'basic' | 'basic-reverse' | 'cloze',
    }

    // Generate export package
    const exportPackage = createExportPackage(vocabularyResponse.docs, exportOptions)

    // Return the export data
    return NextResponse.json({
      success: true,
      data: {
        content: exportPackage.content,
        instructions: exportPackage.instructions,
        filename: exportPackage.filename,
        totalCards: vocabularyResponse.docs.length,
        format: format,
        deckName: deckName,
      },
    })
  } catch (error) {
    console.error('Error exporting vocabulary to Anki:', error)
    return NextResponse.json({ error: 'Failed to export vocabulary' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get vocabulary stats for export preview (count)
    const vocabularyResponse = await getUserVocabularyWithOptions(user.id, { limit: 1 })

    return NextResponse.json({
      success: true,
      data: {
        totalWords: vocabularyResponse.totalDocs,
        availableFormats: ['csv', 'txt'],
        availableCardTypes: ['basic', 'basic-reverse', 'cloze'],
        defaultOptions: {
          format: 'csv',
          includeDefinition: true,
          includeExample: true,
          includePronunciation: true,
          includeTags: true,
          deckName: 'AskVerba Vocabulary',
          cardType: 'basic',
        },
      },
    })
  } catch (error) {
    console.error('Error getting export info:', error)
    return NextResponse.json({ error: 'Failed to get export information' }, { status: 500 })
  }
}
