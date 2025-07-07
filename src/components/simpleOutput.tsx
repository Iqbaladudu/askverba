import React from 'react'
import { Languages } from 'lucide-react'
import { OutputActions } from './outputActions'

import Markdown from 'react-markdown'

interface SimpleOutputProps {
  translation: string
}

export const SimpleOutput: React.FC<SimpleOutputProps> = ({ translation }) => {
  return (
    <div className="p-4 bg-neutral-50 dark:bg-neutral-900">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary-500/10">
            <Languages className="h-4 w-4 text-primary-500" />
          </div>
          <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Terjemahan Singkat
          </h4>
        </div>
        <OutputActions
          textToCopy={translation}
          textToSpeak={translation}
          copyTooltip="Salin terjemahan"
          speakTooltip="Dengar terjemahan"
        />
      </div>
      <div className="bg-white dark:bg-neutral-950 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
        <p className="text-base leading-relaxed text-neutral-800 dark:text-neutral-200">
          <Markdown>{translation}</Markdown>
        </p>
      </div>
    </div>
  )
}
