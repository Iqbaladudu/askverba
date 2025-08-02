'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { translateSimpleAction } from '@/features/translation/actions/translate-simple.action'
import { translateDetailed } from '@/infrastructure/ai/translate'
import { TranslationResult, TranslationMode, IntegratedTranslatorProps } from '@/types/translator'
import { SimpleTranslationResult } from '@/core/schema'
import { TranslatorInput } from './TranslatorInput'
import { TranslationOutput } from './TranslationOutput'
import { GuestLimitationBanner } from '@/components/organisms'
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

  // Guest limitation tracking
  const [guestTranslationCount, setGuestTranslationCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('guestTranslationCount')
      return stored ? parseInt(stored, 10) : 0
    }
    return 0
  })

  // Character count
  const characterCount = inputText.length

  // Save guest translation count to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('guestTranslationCount', guestTranslationCount.toString())
    }
  }, [guestTranslationCount])

  // Reset guest count daily
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastReset = localStorage.getItem('lastGuestReset')
      const today = new Date().toDateString()

      if (lastReset !== today) {
        setGuestTranslationCount(0)
        localStorage.setItem('lastGuestReset', today)
        localStorage.setItem('guestTranslationCount', '0')
      }
    }
  }, [])

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

export default IntegratedTranslator
