import { VocabularyItem } from '@/core/schema'

// Types for single term translation
export interface SingleTermTranslation {
  title: string
  main_translation: string
  meanings: string
  linguistic_analysis: string
  examples: string
  collocations: string
  comparisons: string
  usage_tips: string
  vocabulary: VocabularyItem[]
}

// Types for paragraph translation
export interface ParagraphTranslation {
  title: string
  full_translation: string
  structure_analysis: string
  key_vocabulary: string
  cultural_context: string
  stylistic_notes: string
  alternative_translations: string
  learning_points: string
  vocabulary: VocabularyItem[]
}

// Union type for translation results
export type TranslationResult =
  | {
      type: 'single_term'
      data: SingleTermTranslation
    }
  | {
      type: 'paragraph'
      data: ParagraphTranslation
    }

// Translation mode selection
export type TranslationMode = 'simple' | 'detailed'

// Component props
export interface IntegratedTranslatorProps {
  onTranslate?: (text: string, mode: TranslationMode) => Promise<string | TranslationResult>
  maxInputLength?: number
}
