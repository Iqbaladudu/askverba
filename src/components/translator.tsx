'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Languages } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { translateSimpleAction } from 'action/translate-simple.action'
import { translateDetailed } from '@/lib/translate'
import { TranslationResult, TranslationMode, IntegratedTranslatorProps } from '@/types/translator'
import { TranslatorInput } from './translatorInput'
import { TranslationOutput } from './translationOutput'

// Default onTranslate function if none provided
const defaultOnTranslate = async (text: string, mode: TranslationMode) => {
  if (mode === 'simple') {
    return await translateSimpleAction(text)
  } else {
    return await translateDetailed(text)
  }
}

const IntegratedTranslator: React.FC<IntegratedTranslatorProps> = ({
  onTranslate = defaultOnTranslate,
  maxInputLength = 500,
}) => {
  const [inputText, setInputText] = useState<string>('')
  const [translationResult, setTranslationResult] = useState<string | TranslationResult | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [autoTranslate, setAutoTranslate] = useState<boolean>(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [translationMode, setTranslationMode] = useState<TranslationMode>('simple')
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'meanings',
    'examples',
    'usage_tips',
  ]) // Default expanded

  const characterCount = inputText.length

  // Function to translate text
  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    setTranslationResult(null) // Clear previous result immediately
    try {
      const result = await onTranslate(inputText, translationMode)
      setTranslationResult(result)
      // Reset expanded sections for new detailed results
      if (translationMode === 'detailed') {
        setExpandedSections(['meanings', 'examples', 'usage_tips'])
      }
    } catch (error) {
      console.error('Translation error:', error)
      // TODO: Show error state to user
    } finally {
      setIsLoading(false)
    }
  }, [inputText, translationMode, onTranslate])

  // Debounced input handler for auto-translate
  const handleDebouncedInput = (text: string) => {
    setInputText(text)

    if (autoTranslate && text.trim()) {
      if (typingTimeout) clearTimeout(typingTimeout)

      const newTimeout = setTimeout(() => {
        handleTranslate()
      }, 1000) // 1 second debounce

      setTypingTimeout(newTimeout)
    } else if (typingTimeout) {
      // Clear timeout if autoTranslate is off or text is empty
      clearTimeout(typingTimeout)
      setTypingTimeout(null)
    }
  }

  // Function to clear input and results
  const handleClear = () => {
    setInputText('')
    setTranslationResult(null)
    if (typingTimeout) clearTimeout(typingTimeout)
    setTypingTimeout(null)
  }

  // Helper to toggle expanded sections
  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    )
  }

  // Clear timeout when unmounting
  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout)
    }
  }, [typingTimeout])

  // Trigger translation when mode changes and input is present
  useEffect(() => {
    if (inputText.trim()) {
      handleTranslate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationMode]) // Only re-run when mode changes

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden bg-white dark:bg-gray-950 rounded-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF5B9E]/10 to-[#FFBD83]/10 p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-[#FF5B9E] to-[#FFBD83] p-1.5 rounded-lg">
                <Languages className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-medium">English ke Indonesia</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="ml-1 bg-[#FF5B9E]/10 text-[#FF5B9E] border-[#FF5B9E]/20"
                    >
                      Beta
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Fitur dalam pengembangan</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="auto-translate"
                checked={autoTranslate}
                onCheckedChange={setAutoTranslate}
              />
              <Label htmlFor="auto-translate" className="text-sm cursor-pointer">
                Terjemahkan otomatis
              </Label>
            </div>
          </div>
        </div>

        {/* Input section */}
        <TranslatorInput
          inputText={inputText}
          setInputText={handleDebouncedInput}
          characterCount={characterCount}
          maxInputLength={maxInputLength}
          translationMode={translationMode}
          setTranslationMode={setTranslationMode}
          handleTranslate={handleTranslate}
          handleClear={handleClear}
          isLoading={isLoading}
        />

        {/* Results section */}
        <AnimatePresence>
          <TranslationOutput
            translationResult={translationResult}
            translationMode={translationMode}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
        </AnimatePresence>
      </Card>
    </div>
  )
}

export default IntegratedTranslator
