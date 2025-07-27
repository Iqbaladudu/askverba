import React from 'react'
import { motion } from 'framer-motion'
import { TranslationResult, TranslationMode } from '@/types/translator'
import { SimpleTranslationResult } from '@/components/schema'
import { SimpleOutput } from './simpleOutput'
import { SimpleOutputWithVocabulary } from './SimpleOutputWithVocabulary'
import { SingleTermOutput } from './singleTermOutput'
import { ParagraphOutput } from './paragraphOutput'

interface TranslationOutputProps {
  translationResult: string | SimpleTranslationResult | TranslationResult | null
  translationMode: TranslationMode
  expandedSections: string[]
  toggleSection: (id: string) => void
}

export const TranslationOutput: React.FC<TranslationOutputProps> = ({
  translationResult,
  translationMode,
  expandedSections,
  toggleSection,
}) => {
  if (!translationResult) {
    return null
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      {/* Simple translation display */}
      {translationMode === 'simple' && typeof translationResult === 'string' && (
        <SimpleOutput translation={translationResult} />
      )}

      {/* Simple translation with vocabulary display */}
      {translationMode === 'simple' &&
        typeof translationResult === 'object' &&
        'translation' in translationResult && (
          <SimpleOutputWithVocabulary result={translationResult as SimpleTranslationResult} />
        )}

      {/* Detailed translation display - Single Term */}
      {translationMode === 'detailed' &&
        typeof translationResult === 'object' &&
        translationResult !== null &&
        'type' in translationResult &&
        translationResult.type === 'single_term' && (
          <SingleTermOutput
            data={translationResult.data}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
        )}

      {/* Detailed translation display - Paragraph */}
      {translationMode === 'detailed' &&
        typeof translationResult === 'object' &&
        translationResult !== null &&
        'type' in translationResult &&
        translationResult.type === 'paragraph' && <ParagraphOutput data={translationResult.data} />}
    </motion.div>
  )
}
