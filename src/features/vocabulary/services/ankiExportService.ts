import { Vocabulary } from '@/payload-types'

export interface AnkiExportOptions {
  format: 'csv' | 'txt'
  includeDefinition: boolean
  includeExample: boolean
  includePronunciation: boolean
  includeTags: boolean
  deckName: string
  cardType: 'basic' | 'basic-reverse' | 'cloze'
}

export interface AnkiCard {
  front: string
  back: string
  definition?: string
  example?: string
  pronunciation?: string
  tags?: string
  guid?: string
}

/**
 * Convert vocabulary items to Anki-compatible format
 */
export function convertToAnkiCards(
  vocabularyItems: Vocabulary[],
  options: AnkiExportOptions,
): AnkiCard[] {
  return vocabularyItems.map((vocab, index) => {
    const tags = []

    // Add difficulty as tag
    if (vocab.difficulty) {
      tags.push(vocab.difficulty)
    }

    // Add status as tag
    if (vocab.status) {
      tags.push(vocab.status)
    }

    // Add custom tags
    if (options.includeTags && vocab.tags) {
      vocab.tags.forEach((tagObj) => {
        if (tagObj.tag) {
          tags.push(tagObj.tag)
        }
      })
    }

    // Add language tags
    if (vocab.sourceLanguage) {
      tags.push(vocab.sourceLanguage.toLowerCase())
    }
    if (vocab.targetLanguage) {
      tags.push(vocab.targetLanguage.toLowerCase())
    }

    let front = vocab.word
    let back = vocab.translation

    // Add pronunciation to front if available
    if (options.includePronunciation && vocab.pronunciation) {
      front += ` [${vocab.pronunciation}]`
    }

    // Add definition to back if available
    if (options.includeDefinition && vocab.definition) {
      back += `<br><br><b>Definition:</b> ${vocab.definition}`
    }

    // Add example to back if available
    if (options.includeExample && vocab.example) {
      back += `<br><br><b>Example:</b> <i>${vocab.example}</i>`
    }

    return {
      front,
      back,
      definition: vocab.definition || '',
      example: vocab.example || '',
      pronunciation: vocab.pronunciation || '',
      tags: tags.join(' '),
      guid: `askverba-${vocab.id}-${index}`, // Unique identifier
    }
  })
}

/**
 * Generate CSV format for Anki import
 */
export function generateAnkiCSV(vocabularyItems: Vocabulary[], options: AnkiExportOptions): string {
  const cards = convertToAnkiCards(vocabularyItems, options)

  // CSV headers based on card type
  let headers: string[]

  switch (options.cardType) {
    case 'basic':
      headers = ['Front', 'Back']
      break
    case 'basic-reverse':
      headers = ['Front', 'Back', 'Reverse']
      break
    case 'cloze':
      headers = ['Text', 'Extra']
      break
    default:
      headers = ['Front', 'Back']
  }

  // Add optional fields
  if (options.includeDefinition) {
    headers.push('Definition')
  }
  if (options.includeExample) {
    headers.push('Example')
  }
  if (options.includePronunciation) {
    headers.push('Pronunciation')
  }
  if (options.includeTags) {
    headers.push('Tags')
  }

  // Generate CSV content
  const csvLines = [headers.join(',')]

  cards.forEach((card) => {
    const row: string[] = []

    // Basic fields
    switch (options.cardType) {
      case 'basic':
        row.push(escapeCSV(card.front), escapeCSV(card.back))
        break
      case 'basic-reverse':
        row.push(escapeCSV(card.front), escapeCSV(card.back), escapeCSV(card.back))
        break
      case 'cloze':
        // Convert to cloze format: {{c1::word}} means translation
        const clozeText = `{{c1::${card.front}}} means ${card.back}`
        row.push(escapeCSV(clozeText), escapeCSV(''))
        break
      default:
        row.push(escapeCSV(card.front), escapeCSV(card.back))
    }

    // Optional fields
    if (options.includeDefinition) {
      row.push(escapeCSV(card.definition || ''))
    }
    if (options.includeExample) {
      row.push(escapeCSV(card.example || ''))
    }
    if (options.includePronunciation) {
      row.push(escapeCSV(card.pronunciation || ''))
    }
    if (options.includeTags) {
      row.push(escapeCSV(card.tags || ''))
    }

    csvLines.push(row.join(','))
  })

  return csvLines.join('\n')
}

/**
 * Generate TXT format for Anki import (tab-separated)
 */
export function generateAnkiTXT(vocabularyItems: Vocabulary[], options: AnkiExportOptions): string {
  const cards = convertToAnkiCards(vocabularyItems, options)

  const txtLines: string[] = []

  cards.forEach((card) => {
    const fields: string[] = [card.front, card.back]

    // Add optional fields
    if (options.includeDefinition && card.definition) {
      fields.push(card.definition)
    }
    if (options.includeExample && card.example) {
      fields.push(card.example)
    }
    if (options.includePronunciation && card.pronunciation) {
      fields.push(card.pronunciation)
    }
    if (options.includeTags && card.tags) {
      fields.push(card.tags)
    }

    txtLines.push(fields.join('\t'))
  })

  return txtLines.join('\n')
}

/**
 * Escape CSV field content
 */
function escapeCSV(field: string): string {
  if (!field) return '""'

  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  const escaped = field.replace(/"/g, '""')

  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
    return `"${escaped}"`
  }

  return escaped
}

/**
 * Generate Anki import instructions
 */
export function generateImportInstructions(options: AnkiExportOptions): string {
  const instructions = [
    '# Anki Import Instructions',
    '',
    '## Steps to import:',
    '1. Open Anki desktop application',
    '2. Go to File → Import',
    `3. Select the downloaded ${options.format.toUpperCase()} file`,
    '4. Configure import settings:',
    `   - Deck: ${options.deckName}`,
    `   - Note type: ${options.cardType === 'basic' ? 'Basic' : options.cardType === 'basic-reverse' ? 'Basic (and reversed card)' : 'Cloze'}`,
    '   - Field separator: ' + (options.format === 'csv' ? 'Comma' : 'Tab'),
    '5. Map fields correctly:',
  ]

  // Add field mapping instructions
  let fieldIndex = 1
  instructions.push(`   - Field ${fieldIndex++}: Front`)
  instructions.push(`   - Field ${fieldIndex++}: Back`)

  if (options.cardType === 'basic-reverse') {
    instructions.push(`   - Field ${fieldIndex++}: Reverse`)
  }

  if (options.includeDefinition) {
    instructions.push(`   - Field ${fieldIndex++}: Definition`)
  }
  if (options.includeExample) {
    instructions.push(`   - Field ${fieldIndex++}: Example`)
  }
  if (options.includePronunciation) {
    instructions.push(`   - Field ${fieldIndex++}: Pronunciation`)
  }
  if (options.includeTags) {
    instructions.push(`   - Field ${fieldIndex++}: Tags`)
  }

  instructions.push('')
  instructions.push('6. Click Import to add cards to your deck')
  instructions.push('')
  instructions.push('## Tips:')
  instructions.push('- Make sure to select the correct note type before importing')
  instructions.push('- You can preview the import before confirming')
  instructions.push('- Tags will be automatically applied to imported cards')
  instructions.push('- Cards with the same GUID will be updated instead of duplicated')

  return instructions.join('\n')
}

/**
 * Create export package with file and instructions
 */
export function createExportPackage(
  vocabularyItems: Vocabulary[],
  options: AnkiExportOptions,
): { content: string; instructions: string; filename: string } {
  const content =
    options.format === 'csv'
      ? generateAnkiCSV(vocabularyItems, options)
      : generateAnkiTXT(vocabularyItems, options)

  const instructions = generateImportInstructions(options)

  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `askverba-vocabulary-${timestamp}.${options.format}`

  return {
    content,
    instructions,
    filename,
  }
}
