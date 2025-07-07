'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Languages,
  ArrowRight,
  Volume2,
  Copy,
  BookmarkPlus,
  Sparkles,
  FileText,
  Loader2,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { translateSimpleAction } from 'action/translate-simple.action'
import { translateDetailedAction } from 'action/translate-detailed.action'
import { TranslationResult, TranslationMode } from '@/types/translator'
import { SimpleTranslationResult, VocabularyItem } from '@/components/schema'
import { useTranslationHistory, useVocabulary } from '@/hooks/usePayloadData'
import { useAuth } from '@/contexts/AuthContext'
import { TranslationOutput } from '@/components/translationOutput'

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
  const { createWord } = useVocabulary()

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

  const handleSaveToVocabulary = async () => {
    if (!inputText.trim() || !translationResult || !customer) {
      toast.error('Please translate text first')
      return
    }

    try {
      const translatedText =
        typeof translationResult === 'string'
          ? translationResult
          : 'translation' in translationResult
            ? translationResult.translation
            : translationResult.type === 'single_term'
              ? translationResult.data.main_translation
              : translationResult.data.full_translation

      // Extract first word for vocabulary (for single terms)
      const word = inputText.trim().split(' ')[0].toLowerCase()

      await createWord({
        word: word,
        translation: translatedText.split('.')[0], // Take first sentence
        definition:
          typeof translationResult === 'object' && translationResult.type === 'single_term'
            ? translationResult.data.meanings
            : '',
        example:
          typeof translationResult === 'object' && translationResult.type === 'single_term'
            ? translationResult.data.examples
            : inputText,
        difficulty: 'medium',
        status: 'new',
        tags: ['dashboard'],
        customer: customer.id,
      })

      toast.success('Added to vocabulary!')
    } catch (error) {
      console.error('Save vocabulary error:', error)
      toast.error('Failed to save to vocabulary')
    }
  }

  const handleSaveVocabularyItems = async (vocabularyItems: VocabularyItem[]) => {
    if (!customer) {
      toast.error('User not logged in')
      return
    }

    console.log(vocabularyItems)

    try {
      for (const item of vocabularyItems) {
        await createWord({
          word: item.word,
          translation: item.translation,
          definition: item.context,
          example: inputText, // Use original text as example
          difficulty: item.difficulty,
          status: 'new',
          tags: [item.type, 'auto-extracted'],
          customer: customer.id,
        })
      }
    } catch (error) {
      console.error('Save vocabulary items error:', error)
      throw error
    }
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
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Languages className="h-6 w-6 text-primary-500" />
            Translation Center
          </CardTitle>

          {/* Mode Toggle */}
          <Tabs value={mode} onValueChange={(value) => setMode(value as TranslationMode)}>
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="simple" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Simple
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-700">Enter text</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSpeak(inputText)}
                disabled={!inputText}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              placeholder={
                mode === 'simple'
                  ? 'Type your text here for quick translation...'
                  : 'Enter text for detailed contextual translation...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] resize-none border-neutral-200 focus:border-primary-300"
            />
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{inputText.length} characters</span>
              <span>Max 500 characters</span>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-700">Translation</h3>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
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
                  disabled={!translationResult}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!translationResult}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveToVocabulary}
                  disabled={!translationResult}
                >
                  <BookmarkPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div
              className={`min-h-[120px] p-3 rounded-lg border ${
                translationResult
                  ? 'bg-neutral-50 border-neutral-200'
                  : 'bg-neutral-25 border-neutral-100'
              }`}
            >
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
                  onSaveVocabulary={handleSaveVocabularyItems}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
                  Translation will appear here
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-4 border-t border-neutral-100">
          <Button
            onClick={handleTranslate}
            disabled={!inputText.trim() || isTranslating}
            className="px-8"
          >
            {isTranslating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="h-4 w-4 mr-2" />
                Translate
              </>
            )}
          </Button>

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
        </div>
      </CardContent>
    </Card>
  )
}
