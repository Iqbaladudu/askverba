'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Languages, Sparkles, Zap, Settings, ArrowRight, Clock, Target, Brain } from 'lucide-react'
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
  ])
  const [translationCount, setTranslationCount] = useState<number>(0)
  const [showSettings, setShowSettings] = useState<boolean>(false)

  const characterCount = inputText.length

  // Function to translate text
  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    setTranslationResult(null)

    try {
      const result = await onTranslate(inputText, translationMode)
      setTranslationResult(result)
      setTranslationCount((prev) => prev + 1)

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
      }, 1500) // 1.5 second debounce for better UX

      setTypingTimeout(newTimeout)
    } else if (typingTimeout) {
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
    if (inputText.trim() && !autoTranslate) {
      // Only auto-translate on mode change if auto-translate is off
      // If auto-translate is on, the debounced handler will take care of it
      const timeoutId = setTimeout(() => {
        handleTranslate()
      }, 300)

      return () => clearTimeout(timeoutId)
    }
  }, [translationMode])

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const getModeInfo = (mode: TranslationMode) => {
    if (mode === 'simple') {
      return {
        icon: Zap,
        label: 'Quick Mode',
        description: 'Fast & efficient translation',
        color: 'bg-green-500',
        bgColor: 'bg-green-500/10',
      }
    }
    return {
      icon: Brain,
      label: 'Deep Mode',
      description: 'Comprehensive analysis & learning',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-500/10',
    }
  }

  const modeInfo = getModeInfo(translationMode)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-5xl mx-auto px-4"
    >
      <Card className="border-0 shadow-2xl overflow-hidden bg-white dark:bg-gray-950 rounded-3xl">
        {/* Enhanced Header */}
        <CardHeader className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[#FF5B9E]/5 dark:bg-[#FF5B9E]/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,91,158,0.1)_0%,_transparent_50%)]" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Main Title Section */}
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="relative"
                >
                  <div className="bg-[#FF5B9E] p-3 rounded-2xl shadow-lg">
                    <Languages className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-[#FF5B9E] rounded-2xl blur opacity-20" />
                </motion.div>

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                      AI Translator
                    </h1>
                    <Badge
                      variant="outline"
                      className="bg-[#FF5B9E]/10 border-[#FF5B9E]/20 text-[#FF5B9E] text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Powered by AI
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      English → Indonesian
                    </span>

                    {translationCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {translationCount} translation{translationCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mode Indicator & Settings */}
              <div className="flex items-center gap-4">
                {/* Current Mode Display */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${modeInfo.bgColor} border border-gray-200 dark:border-gray-700`}
                >
                  <div className={`p-1 rounded-full ${modeInfo.color}`}>
                    <modeInfo.icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium">{modeInfo.label}</span>
                </div>

                {/* Settings Toggle */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowSettings(!showSettings)}
                        className="rounded-full hover:bg-[#FF5B9E]/10"
                      >
                        <motion.div
                          animate={{ rotate: showSettings ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Settings className="h-5 w-5" />
                        </motion.div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Translation settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <Separator className="mb-4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Auto-translate Setting */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                      <div className="flex flex-col">
                        <Label
                          htmlFor="auto-translate"
                          className="text-base font-medium cursor-pointer"
                        >
                          Auto-translate
                        </Label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Translate as you type
                        </span>
                      </div>
                      <Switch
                        id="auto-translate"
                        checked={autoTranslate}
                        onCheckedChange={setAutoTranslate}
                      />
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                      <div className="flex flex-col">
                        <Label className="text-base font-medium">Quick Actions</Label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Keyboard shortcuts enabled
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs font-mono border">
                          Ctrl
                        </kbd>
                        <span className="text-gray-400">+</span>
                        <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs font-mono border">
                          Enter
                        </kbd>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardHeader>

        {/* Input Section */}
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

        {/* Results Section */}
        <AnimatePresence>
          {(translationResult || isLoading) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="border-t border-gray-200 dark:border-gray-800"
            >
              {isLoading ? (
                <div className="p-8">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-12 h-12 border-4 border-[#FF5B9E]/20 border-t-[#FF5B9E] rounded-full"
                    />
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {translationMode === 'simple'
                          ? 'Translating...'
                          : 'Analyzing & Translating...'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {translationMode === 'simple'
                          ? 'Getting your quick translation'
                          : 'Performing deep linguistic analysis'}
                      </p>
                    </div>
                  </div>
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

        {/* Empty State */}
        {!translationResult && !isLoading && !inputText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center"
          >
            <div className="max-w-md mx-auto">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-20 h-20 mx-auto mb-6 bg-[#FF5B9E]/10 rounded-full flex items-center justify-center"
              >
                <Languages className="w-10 h-10 text-[#FF5B9E]" />
              </motion.div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Ready to translate
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Type some English text above to get started with AI-powered translation and
                analysis.
              </p>

              <div className="flex flex-wrap gap-2 justify-center">
                {['Hello world', 'How are you?', 'Thank you very much'].map((example, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputText(example)}
                    className="text-xs hover:border-[#FF5B9E] hover:text-[#FF5B9E] transition-colors"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  )
}

export default IntegratedTranslator
