'use client'

import React, { useState } from 'react'
import { SingleTermTranslation } from '@/features/translation/types/translator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  Languages,
  Lightbulb,
  Check,
  ClipboardCopy,
} from 'lucide-react'
import { OutputActions } from './outputActions'
import { Section } from '@/components/common/section'
import { getCleanTitle, formatContent, handleCopy } from '@/lib/utils'

interface SingleTermOutputProps {
  data: SingleTermTranslation
  expandedSections: string[]
  toggleSection: (id: string) => void
}

export const SingleTermOutput: React.FC<SingleTermOutputProps> = ({
  data,
  expandedSections,
  toggleSection,
}) => {
  const [copiedAll, setCopiedAll] = useState(false)
  const cleanTitle = getCleanTitle(data.title)
  const mainTranslationText = data.main_translation.replace(/📝\s*\*\*Terjemahan Utama:\*\*\s*/, '')

  const onCopyAll = async () => {
    const textToCopy = Object.values(data).join('\n\n')
    const success = await handleCopy(textToCopy)
    if (success) {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    }
  }

  return (
    <div className="p-4 bg-neutral-50 dark:bg-neutral-900">
      {/* Title section */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <Badge
              variant="outline"
              className="mb-2 text-primary-500 border-primary-500/20 bg-primary-500/5"
            >
              English Term
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-200">
              {cleanTitle}
            </h2>
          </div>
          <OutputActions
            textToCopy={cleanTitle} // Copy original term
            textToSpeak={cleanTitle}
            speakLang="en-US"
            copyTooltip="Salin teks asli"
            speakTooltip="Dengar teks asli"
          />
        </div>
      </div>

      {/* Main translation highlighted card */}
      <div className="bg-primary-500/5 p-4 rounded-lg border border-primary-500/20 mb-5">
        <div className="flex justify-between items-start">
          <div
            className="flex-1 text-neutral-800 dark:text-neutral-200"
            dangerouslySetInnerHTML={{ __html: formatContent(data.main_translation) }}
          />
          <OutputActions
            textToCopy={mainTranslationText}
            textToSpeak={mainTranslationText}
            copyTooltip="Salin terjemahan utama"
            speakTooltip="Dengar terjemahan utama"
          />
        </div>
      </div>

      {/* Collapsible sections */}
      <ScrollArea className="h-[450px] pr-4">
        <Section
          title="Makna Lengkap & Nuansa"
          content={data.meanings}
          icon={<BookOpen className="h-4 w-4" />}
          id="meanings"
          isExpanded={expandedSections.includes('meanings')}
          onToggle={toggleSection}
          isHighlighted={true}
        />
        <Section
          title="Analisis Linguistik"
          content={data.linguistic_analysis}
          icon={<Sparkles className="h-4 w-4" />}
          id="linguistic"
          isExpanded={expandedSections.includes('linguistic')}
          onToggle={toggleSection}
        />
        <Section
          title="Contoh Penggunaan Kontekstual"
          content={data.examples}
          icon={<BookOpen className="h-4 w-4" />}
          id="examples"
          isExpanded={expandedSections.includes('examples')}
          onToggle={toggleSection}
          isHighlighted={true}
        />
        <Section
          title="Kolokasi & Pola Umum"
          content={data.collocations}
          icon={<ArrowRight className="h-4 w-4" />}
          id="collocations"
          isExpanded={expandedSections.includes('collocations')}
          onToggle={toggleSection}
        />
        <Section
          title="Perbandingan Kata Serupa"
          content={data.comparisons}
          icon={<Languages className="h-4 w-4" />}
          id="comparisons"
          isExpanded={expandedSections.includes('comparisons')}
          onToggle={toggleSection}
        />
        <Section
          title="Tips Penggunaan & Pembelajaran"
          content={data.usage_tips}
          icon={<Lightbulb className="h-4 w-4" />}
          id="usage_tips"
          isExpanded={expandedSections.includes('usage_tips')}
          onToggle={toggleSection}
          isHighlighted={true}
        />
      </ScrollArea>

      {/* Action buttons */}
      <div className="flex justify-end mt-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onCopyAll}
                variant="outline"
                className="flex gap-2 border-[#FF5B9E] text-[#FF5B9E] hover:bg-[#FF5B9E]/10"
              >
                {copiedAll ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                <span>{copiedAll ? 'Disalin!' : 'Salin Semua'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Salin seluruh konten</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
