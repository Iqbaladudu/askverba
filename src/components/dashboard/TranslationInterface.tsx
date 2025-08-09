'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Languages, ArrowRight, Sparkles, FileText, Loader2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { translateSimpleAction } from '@/features/translation/actions/translate-simple.action'
import { translateDetailedAction } from '@/features/translation/actions/translate-detailed.action'
import { TranslationResult, TranslationMode } from '@/features/translation/types/translator'
import { SimpleTranslationResult } from '@/utils/schema'
import { useTranslationHistory } from '@/utils/hooks'
import { useAuth } from '@/features/auth/contexts'
import { TranslationOutput } from '@/components/translation'
import { ImportantVocabulary } from '@/components/dashboard/ImportantVocabulary'
import { OutputActions } from '@/components/translation/outputActions'

export function TranslationInterface() {
  const [mode, setMode] = useState<TranslationMode>('simple')
  const [inputText, setInputText] = useState('')
  const [translationResult, setTranslationResult] = useState<
    string | SimpleTranslationResult | TranslationResult | null
  >(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [sourceLanguage, setSourceLanguage] = useState('en')
  const [targetLanguage, setTargetLanguage] = useState('id')
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'meanings',
    'examples',
    'usage_tips',
  ])

  const getResultText = (
    tr: string | SimpleTranslationResult | TranslationResult | null,
  ): string => {
    if (!tr) return ''
    if (typeof tr === 'string') return tr
    if ('translation' in tr) return tr.translation
    if ('type' in tr) {
      return tr.type === 'single_term' ? tr.data.main_translation : tr.data.full_translation
    }
    return ''
  }

  const { customer } = useAuth()

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter text to translate')
      return
    }

    setIsTranslating(true)
    setTranslationResult(null)

    try {
      // Use the new service layer with caching and automatic database saving
      if (mode === 'simple') {
        const response = await translateSimpleAction(
          inputText,
          customer?.id, // Pass user ID for caching and history
          true, // Save to history automatically
        )

        setTranslationResult(response.result)

        const cacheInfo = response.fromCache ? ' (from cache)' : ''
        const timeInfo = response.processingTime ? ` (${response.processingTime}ms)` : ''
        toast.success(`Translation completed${cacheInfo}${timeInfo}`)
      } else {
        const response = await translateDetailedAction(
          inputText,
          customer?.id, // Pass user ID for caching and history
          true, // Save to history automatically
        )

        // Normalize detailed result to satisfy TranslationResult (ensure vocabulary exists)
        const result: any = response.result
        const normalizedResult: TranslationResult =
          result?.type === 'single_term' && result?.data && !('vocabulary' in result.data)
            ? {
                type: 'single_term',
                data: { ...result.data, vocabulary: [] },
              }
            : (result as TranslationResult)

        setTranslationResult(normalizedResult)
        setExpandedSections(['meanings', 'examples', 'usage_tips'])

        const cacheInfo = response.fromCache ? ' (from cache)' : ''
        const timeInfo = response.processingTime ? ` (${response.processingTime}ms)` : ''
        toast.success(`Translation completed${cacheInfo}${timeInfo}`)
      }
    } catch (error) {
      console.error('Translation error:', error)
      toast.error('Translation failed. Please try again.')
    } finally {
      setIsTranslating(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    )
  }

  const handleCopy = () => {
    const textToCopy = getResultText(translationResult)
    if (!textToCopy) return
    navigator.clipboard.writeText(textToCopy)
    toast.success('Copied to clipboard!')
  }

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = targetLanguage === 'id' ? 'id-ID' : 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-6">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-neutral-800">Translate Text</CardTitle>
              <p className="text-neutral-600">
                Get instant translations or detailed language analysis
              </p>
            </div>

            {/* Mode Toggle - Simplified */}
            <Tabs value={mode} onValueChange={(value) => setMode(value as TranslationMode)}>
              <TabsList className="grid w-fit grid-cols-2 mx-auto">
                <TabsTrigger value="simple" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Quick
                </TabsTrigger>
                <TabsTrigger value="detailed" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Detailed
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Mode Description */}
          <div className="mt-2">
            {mode === 'simple' ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Quick translations for everyday use
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Contextual translations with grammar explanations
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-600">From:</span>
              <Badge variant="outline" className="px-2.5 py-1 rounded-full">
                🇺🇸 English
              </Badge>
            </div>

            <ArrowRight className="h-5 w-5 text-neutral-400" />

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-600">To:</span>
              <Badge variant="outline" className="px-2.5 py-1 rounded-full">
                🇮🇩 Indonesian
              </Badge>
            </div>
          </div>

          {/* Translation Interface */}
          <div className="space-y-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder={
                    mode === 'simple'
                      ? 'Type or paste text here for instant translation...'
                      : 'Enter text for detailed analysis...'
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[120px] resize-none border border-neutral-300 focus:border-primary-500 transition-colors rounded-xl p-4"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault()
                      handleTranslate()
                    }
                  }}
                />

                {/* Character count */}
                <div className="absolute bottom-3 right-3 text-xs text-neutral-400">
                  {inputText.length}/500
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Press Ctrl+Enter for quick translate</span>
              </div>
            </div>

            {/* Translate Button */}
            <div className="flex justify-center gap-3">
              <Button
                onClick={handleTranslate}
                disabled={!inputText.trim() || isTranslating}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Translate
                  </>
                )}
              </Button>

              {(inputText || translationResult) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setInputText('')
                    setTranslationResult(null)
                  }}
                  disabled={isTranslating}
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Output Section - Only show when there's a result or translating */}
            {(translationResult || isTranslating) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-800">Result</h3>
                  {translationResult && (
                    <OutputActions
                      textToCopy={getResultText(translationResult)}
                      textToSpeak={getResultText(translationResult)}
                      speakLang={targetLanguage === 'id' ? 'id-ID' : 'en-US'}
                      copyTooltip="Copy result"
                      speakTooltip="Listen to result"
                    />
                  )}
                </div>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 min-h-[120px]">
                  {isTranslating ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                      <span className="ml-2 text-sm text-neutral-600">Translating...</span>
                    </div>
                  ) : translationResult ? (
                    <TranslationOutput
                      translationResult={translationResult}
                      translationMode={mode}
                      expandedSections={expandedSections}
                      toggleSection={toggleSection}
                    />
                  ) : null}
                </div>
              </div>
            )}

            {/* Important Vocabulary Section */}
            {inputText.trim() && (
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <ImportantVocabulary inputText={inputText} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
