import React from 'react'
import { Languages } from 'lucide-react'
import { OutputActions } from './outputActions'

import Markdown from 'react-markdown'

interface SimpleOutputProps {
  translation: string
}

export const SimpleOutput: React.FC<SimpleOutputProps> = ({ translation }) => {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-[#FF5B9E]/10">
            <Languages className="h-4 w-4 text-[#FF5B9E]" />
          </div>
          <h4 className="text-sm font-medium">Terjemahan Singkat</h4>
        </div>
        <OutputActions
          textToCopy={translation}
          textToSpeak={translation}
          copyTooltip="Salin terjemahan"
          speakTooltip="Dengar terjemahan"
        />
      </div>
      <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <p className="text-base leading-relaxed">
          <Markdown>{translation}</Markdown>
        </p>
      </div>
    </div>
  )
}
