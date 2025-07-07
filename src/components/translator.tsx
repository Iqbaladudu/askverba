'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { translateSimpleAction } from 'action/translate-simple.action'
import { translateDetailed } from '@/lib/translate'
import { TranslationResult, TranslationMode, IntegratedTranslatorProps } from '@/types/translator'
import { SimpleTranslationResult } from '@/components/schema'
import { TranslatorInput } from './translatorInput'
import { TranslationOutput } from './translationOutput'

const defaultOnTranslate = async (text: string, mode: TranslationMode) => {
  if (mode === 'simple') {
    const response = await translateSimpleAction(text)
    return response.result
  } else {
    return await translateDetailed(text)
  }
}

const IntegratedTranslator: React.FC<IntegratedTranslatorProps> = ({
  onTranslate = defaultOnTranslate,
  maxInputLength = 500,
}) => {
  const [inputText, setInputText] = useState<string>('')
  const [translationResult, setTranslationResult] = useState<
    string | SimpleTranslationResult | TranslationResult | null
  >(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [autoTranslate, setAutoTranslate] = useState<boolean>(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [translationMode, setTranslationMode] = useState<TranslationMode>('simple')
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'meanings',
    'examples',
    'usage_tips',
  ])
  const [translationCount, setTranslationCount] = useState<number>(0)
  const [showSettings, setShowSettings] = useState<boolean>(false)

  const characterCount = inputText.length

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return
    setIsLoading(true)
    setTranslationResult(null)
    try {
      const result = await onTranslate(inputText, translationMode)
      setTranslationResult(result)
      setTranslationCount((prev) => prev + 1)
      if (translationMode === 'detailed') {
        setExpandedSections(['meanings', 'examples', 'usage_tips'])
      }
    } catch (error) {
      // TODO: Show error state to user
    } finally {
      setIsLoading(false)
    }
  }, [inputText, translationMode, onTranslate])

  const handleDebouncedInput = (text: string) => {
    setInputText(text)
    if (autoTranslate && text.trim()) {
      if (typingTimeout) clearTimeout(typingTimeout)
      const newTimeout = setTimeout(() => {
        handleTranslate()
      }, 1200)
      setTypingTimeout(newTimeout)
    } else if (typingTimeout) {
      clearTimeout(typingTimeout)
      setTypingTimeout(null)
    }
  }

  const handleClear = () => {
    setInputText('')
    setTranslationResult(null)
    if (typingTimeout) clearTimeout(typingTimeout)
    setTypingTimeout(null)
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    )
  }

  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout)
    }
  }, [typingTimeout])

  useEffect(() => {
    if (inputText.trim() && !autoTranslate) {
      const timeoutId = setTimeout(() => {
        handleTranslate()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [translationMode])

  return (
    <div className="container mx-auto px-4 max-w-4xl py-8">
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        Terjemahan hanya tersedia dari <b>Inggris ke Indonesia</b>. Fitur ini masih dalam tahap{' '}
        <b>beta</b>.
      </div>
      <Card className="border-0 shadow-lg rounded-2xl bg-white dark:bg-gray-950">
        <CardContent className="p-0">
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
        </CardContent>
        <AnimatePresence>
          {(translationResult || isLoading) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 dark:border-gray-800"
            >
              {isLoading ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Translating...
                </div>
              ) : (
                <TranslationOutput
                  translationResult={translationResult}
                  translationMode={translationMode}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  )
}

export default IntegratedTranslator
