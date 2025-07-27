'use client'

import React from 'react'
import { Languages } from 'lucide-react'
import { SimpleTranslationResult } from '@/components/schema'
import { OutputActions } from './outputActions'

interface SimpleOutputWithVocabularyProps {
  result: SimpleTranslationResult
}

export function SimpleOutputWithVocabulary({ result }: SimpleOutputWithVocabularyProps) {
  return (
    <div className="p-4 bg-neutral-50 dark:bg-neutral-900 space-y-4">
      {/* Translation Section */}
      <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary-500/10">
              <Languages className="h-4 w-4 text-primary-500" />
            </div>
            <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Terjemahan Singkat
            </h4>
          </div>
          <OutputActions
            textToCopy={result.translation}
            textToSpeak={result.translation}
            copyTooltip="Salin terjemahan"
            speakTooltip="Dengar terjemahan"
          />
        </div>
        <div className="p-4">
          <p className="text-neutral-900 dark:text-neutral-100 leading-relaxed">
            {result.translation}
          </p>
        </div>
      </div>
    </div>
  )
}
