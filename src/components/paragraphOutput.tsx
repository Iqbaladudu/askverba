import React, { useState } from 'react'
import { ParagraphTranslation } from '@/types/translator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  BookOpen,
  Sparkles,
  GraduationCap,
  Lightbulb,
  Languages,
  Check,
  ClipboardCopy,
} from 'lucide-react'
import { OutputActions } from './outputActions'
import { getCleanTitle, handleCopy } from '@/lib/utils'
import Markdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css' // `rehype-katex` does not import the CSS for you

interface ParagraphOutputProps {
  data: ParagraphTranslation
}

export const ParagraphOutput: React.FC<ParagraphOutputProps> = ({ data }) => {
  const [copiedAll, setCopiedAll] = useState(false)
  const cleanTitle = getCleanTitle(data.title)
  const fullTranslationText = data.full_translation.replace(
    /📝\s*\*\*Terjemahan Utuh \(Alami & Akurat\):\*\*\s*/,
    '',
  )

  const onCopyAll = async () => {
    const textToCopy = Object.values(data).join('\n\n')
    const success = await handleCopy(textToCopy)
    if (success) {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    }
  }

  const renderTabContent = (
    title: string,
    content: string,
    icon: React.ReactNode,
    iconBgClass: string,
    iconColorClass: string,
  ) => (
    <Card className="border border-gray-200 dark:border-gray-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-1.5 rounded-md ${iconBgClass}`}>
            {React.cloneElement(icon as React.ReactElement, {
              className: `h-4 w-4 ${iconColorClass}`,
            })}
          </div>
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {content}
        </Markdown>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      {/* Title section */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="max-w-[90%]">
            <Badge
              variant="outline"
              className="mb-2 text-[#FF5B9E] border-[#FF5B9E]/20 bg-[#FF5B9E]/5"
            >
              English Text
            </Badge>
            <h2 className="text-base sm:text-lg font-bold line-clamp-2">{cleanTitle}</h2>
          </div>
          <OutputActions
            textToCopy={cleanTitle}
            textToSpeak={cleanTitle}
            speakLang="en-US"
            copyTooltip="Salin teks asli"
            speakTooltip="Dengar teks asli"
          />
        </div>
      </div>

      {/* Main translation highlighted card */}
      <div className="bg-gradient-to-r from-[#FF5B9E]/5 to-[#FFBD83]/5 p-4 rounded-lg border border-[#FF5B9E]/20 mb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="font-medium text-[#FF5B9E] mb-2">Terjemahan Utuh</h4>
            {/* Use dangerouslySetInnerHTML to render the HTML string */}
            <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {fullTranslationText}
            </Markdown>
          </div>
          <div className="ml-2">
            <OutputActions
              textToCopy={fullTranslationText}
              textToSpeak={fullTranslationText}
              copyTooltip="Salin terjemahan"
              speakTooltip="Dengar terjemahan"
            />
          </div>
        </div>
      </div>

      {/* Tabs for different analysis sections */}
      <Tabs defaultValue="key_vocabulary" className="w-full">
        <TabsList className="grid grid-cols-2 w-full md:grid-cols-4 p-2 bg-gray-50 dark:bg-gray-900 md:border rounded-md h-auto ">
          <TabsTrigger
            value="key_vocabulary"
            className="data-[state=active]:bg-[#FF5B9E]/10 data-[state=active]:text-[#FF5B9E] rounded-md h-10"
          >
            Kosakata Kunci
          </TabsTrigger>
          <TabsTrigger
            value="structure"
            className="data-[state=active]:bg-[#FF5B9E]/10 data-[state=active]:text-[#FF5B9E] rounded-md h-10"
          >
            Struktur
          </TabsTrigger>
          <TabsTrigger
            value="cultural"
            className="data-[state=active]:bg-[#FF5B9E]/10 data-[state=active]:text-[#FF5B9E] rounded-md h-10"
          >
            Konteks
          </TabsTrigger>
          <TabsTrigger
            value="learning"
            className="data-[state=active]:bg-[#FF5B9E]/10 data-[state=active]:text-[#FF5B9E] rounded-md h-10"
          >
            Pembelajaran
          </TabsTrigger>
        </TabsList>

        <TabsContent value="key_vocabulary" className="mt-4">
          {renderTabContent(
            'Kosakata & Frasa Kunci',
            data.key_vocabulary,
            <BookOpen />,
            'bg-[#FF5B9E]/10',
            'text-[#FF5B9E]',
          )}
        </TabsContent>

        <TabsContent value="structure" className="mt-4">
          {renderTabContent(
            'Analisis Struktur & Tata Bahasa',
            data.structure_analysis,
            <Sparkles />,
            'bg-[#FF5B9E]/10',
            'text-[#FF5B9E]',
          )}
        </TabsContent>

        <TabsContent value="cultural" className="mt-4 space-y-4">
          {renderTabContent(
            'Konteks Budaya & Situasional',
            data.cultural_context,
            <GraduationCap />,
            'bg-[#FF5B9E]/10',
            'text-[#FF5B9E]',
          )}
          {renderTabContent(
            'Catatan Stilistik & Nada',
            data.stylistic_notes,
            <Lightbulb />,
            'bg-[#FFBD83]/10',
            'text-[#FFBD83]',
          )}
        </TabsContent>

        <TabsContent value="learning" className="mt-4 space-y-4">
          {renderTabContent(
            'Poin Pembelajaran Utama',
            data.learning_points,
            <GraduationCap />,
            'bg-[#FF5B9E]/10',
            'text-[#FF5B9E]',
          )}
          {renderTabContent(
            'Alternatif Terjemahan',
            data.alternative_translations,
            <Languages />,
            'bg-[#FFBD83]/10',
            'text-[#FFBD83]',
          )}
        </TabsContent>
      </Tabs>

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
