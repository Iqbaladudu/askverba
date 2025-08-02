'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Languages, ArrowRight, Volume2, Copy, Sparkles, FileText, Loader2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { translateSimpleAction } from '@/features/translation/actions/translate-simple.action'
import { translateDetailedAction } from '@/features/translation/actions/translate-detailed.action'
import { TranslationResult, TranslationMode } from '@/types/translator'
import { SimpleTranslationResult } from '@/core/schema'
import { useTranslationHistory } from '@/shared/hooks'
import { useAuth } from '@/features/auth/contexts'
import { TranslationOutput } from '@/features/translation/components'
import { ImportantVocabulary } from '@/features/dashboard/components/ImportantVocabulary'

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

  const { customer } = useAuth()
  const { createTranslation } = useTranslationHistory()

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter text to translate')
      return
    }

    setIsTranslating(true)
    setTranslationResult(null)

    try {
      let response: {
        result: string | TranslationResult
        fromCache?: boolean
        processingTime?: number
      }

      // Use the new service layer with caching and automatic database saving
      if (mode === 'simple') {
        response = await translateSimpleAction(
          inputText,
          customer?.id, // Pass user ID for caching and history
          true, // Save to history automatically
        )
      } else {
        response = await translateDetailedAction(
          inputText,
          customer?.id, // Pass user ID for caching and history
          true, // Save to history automatically
        )
      }

      setTranslationResult(response.result)

      // Set expanded sections for detailed mode
      if (mode === 'detailed') {
        setExpandedSections(['meanings', 'examples', 'usage_tips'])
      }

      // Show success message with cache info
      const cacheInfo = response.fromCache ? ' (from cache)' : ''
      const timeInfo = response.processingTime ? ` (${response.processingTime}ms)` : ''
      toast.success(`Translation completed${cacheInfo}${timeInfo}`)
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
    const textToCopy =
      typeof translationResult === 'string'
        ? translationResult
        : translationResult?.type === 'single_term'
          ? translationResult.data.main_translation
          : translationResult?.data.full_translation || ''

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
            <Badge variant="outline" className="px-3 py-1">
              🇺🇸 English
            </Badge>
          </div>

          <ArrowRight className="h-5 w-5 text-neutral-400" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-600">To:</span>
            <Badge variant="outline" className="px-3 py-1">
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
                className="min-h-[120px] resize-none border border-neutral-300 focus:border-primary-500 transition-colors rounded-lg p-4"
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const textToSpeak =
                          typeof translationResult === 'string'
                            ? translationResult
                            : translationResult?.type === 'single_term'
                              ? translationResult.data.main_translation
                              : translationResult?.data.full_translation || ''
                        handleSpeak(textToSpeak)
                      }}
                    >
                      <Volume2 className="h-4 w-4 mr-1" />
                      Listen
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
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
  )
}
