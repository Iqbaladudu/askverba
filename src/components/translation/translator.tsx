'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { translateSimpleAction } from '@/features/translation/actions/translate-simple.action'
import { translateDetailed } from '@/utils/ai/translate'
import { TranslationResult, TranslationMode, IntegratedTranslatorProps } from '@/features/translation/types/translator'
import { SimpleTranslationResult } from '@/utils/schema'
import { TranslatorInput } from './translatorInput'
import { TranslationOutput } from './translationOutput'
import { GuestLimitationBanner } from './GuestLimitationBanner'
import { useAuth } from '@/features/auth/contexts'

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
  const { isAuthenticated } = useAuth()
  const [inputText, setInputText] = useState<string>('')
  const [translationResult, setTranslationResult] = useState<
    string | SimpleTranslationResult | TranslationResult | null
  >(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [autoTranslate] = useState<boolean>(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [translationMode, setTranslationMode] = useState<TranslationMode>('simple')
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'meanings',
    'examples',
    'usage_tips',
  ])
  const [guestTranslationCount, setGuestTranslationCount] = useState<number>(0)

  const characterCount = inputText.length

  // Load guest translation count from localStorage on mount
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      const today = new Date().toDateString()
      const storedData = localStorage.getItem('askverba_guest_translations')

      if (storedData) {
        try {
          const { date, count } = JSON.parse(storedData)
          if (date === today) {
            setGuestTranslationCount(count)
          } else {
            // Reset count for new day
            localStorage.setItem(
              'askverba_guest_translations',
              JSON.stringify({ date: today, count: 0 }),
            )
            setGuestTranslationCount(0)
          }
        } catch {
          // Invalid data, reset
          localStorage.setItem(
            'askverba_guest_translations',
            JSON.stringify({ date: today, count: 0 }),
          )
          setGuestTranslationCount(0)
        }
      } else {
        // First time, initialize
        localStorage.setItem(
          'askverba_guest_translations',
          JSON.stringify({ date: today, count: 0 }),
        )
      }
    }
  }, [isAuthenticated])

  // Save guest translation count to localStorage when it changes
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined' && guestTranslationCount > 0) {
      const today = new Date().toDateString()
      localStorage.setItem(
        'askverba_guest_translations',
        JSON.stringify({
          date: today,
          count: guestTranslationCount,
        }),
      )
    }
  }, [guestTranslationCount, isAuthenticated])

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return

    // Check guest limitations
    const maxGuestTranslations = 30
    if (!isAuthenticated && guestTranslationCount >= maxGuestTranslations) {
      // TODO: Show limit reached message
      return
    }

    setIsLoading(true)
    setTranslationResult(null)
    try {
      const result = await onTranslate(inputText, translationMode)
      setTranslationResult(result)

      // Increment guest translation count if not authenticated
      if (!isAuthenticated) {
        setGuestTranslationCount((prev) => prev + 1)
      }

      if (translationMode === 'detailed') {
        setExpandedSections(['meanings', 'examples', 'usage_tips'])
      }
    } catch (_error) {
      // TODO: Show error state to user
    } finally {
      setIsLoading(false)
    }
  }, [inputText, translationMode, onTranslate, isAuthenticated, guestTranslationCount])

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

      {/* Guest Limitation Banner */}
      {!isAuthenticated && (
        <div className="mb-6">
          <GuestLimitationBanner translationCount={guestTranslationCount} maxTranslations={30} />
        </div>
      )}

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

export { IntegratedTranslator as Translator }
export default IntegratedTranslator
