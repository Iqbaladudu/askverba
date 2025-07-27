import React from 'react'
import { Languages } from 'lucide-react'
import { OutputActions } from './outputActions'

import Markdown from 'react-markdown'

interface SimpleOutputProps {
  translation: string
}

export const SimpleOutput: React.FC<SimpleOutputProps> = ({ translation }) => {
  return (
    <div className="p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-500/10 flex-shrink-0">
            <Languages className="h-5 w-5 text-primary-500" />
          </div>
          <h4 className="text-base sm:text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            Quick Translation
          </h4>
        </div>
        <OutputActions
          textToCopy={translation}
          textToSpeak={translation}
          copyTooltip="Salin terjemahan"
          speakTooltip="Dengar terjemahan"
        />
      </div>
      <div className="bg-white dark:bg-neutral-950 p-4 sm:p-6 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <p className="text-base leading-relaxed text-neutral-800 dark:text-neutral-200">
          <Markdown>{translation}</Markdown>
        </p>
      </div>
    </div>
  )
}
