import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  CornerDownLeft,
  Eraser,
  Volume2,
  Loader2,
  Sparkles,
  Zap,
  FileText,
  Brain,
  Mic,
  Type,
} from 'lucide-react'
import { TranslationMode } from '@/types/translator'
import { handleSpeak } from '@/lib/utils'

interface TranslatorInputProps {
  inputText: string
  setInputText: (text: string) => void
  characterCount: number
  maxInputLength: number
  translationMode: TranslationMode
  setTranslationMode: (mode: TranslationMode) => void
  handleTranslate: () => void
  handleClear: () => void
  isLoading: boolean
}

export const TranslatorInput: React.FC<TranslatorInputProps> = ({
  inputText,
  setInputText,
  characterCount,
  maxInputLength,
  translationMode,
  setTranslationMode,
  handleTranslate,
  handleClear,
  isLoading,
}) => {
  const isNearLimit = characterCount > maxInputLength * 0.8
  const isAtLimit = characterCount >= maxInputLength

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      if (inputText.trim() && !isLoading) {
        handleTranslate()
      }
    }
  }

  const modes = [
    {
      value: 'simple' as const,
      label: 'Quick',
      description: 'Fast translation',
      icon: Zap,
      color: 'bg-green-500',
      features: ['Instant results', 'Simple output'],
    },
    {
      value: 'detailed' as const,
      label: 'Deep',
      description: 'Comprehensive analysis',
      icon: Brain,
      color: 'bg-purple-500',
      features: ['Cultural context', 'Learning insights', 'Grammar analysis'],
    },
  ]

  return (
    <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50">
      {/* Input Section */}
      <div className="space-y-4">
        {/* Input Label */}
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Type className="w-4 h-4" />
            Enter English Text
          </Label>
          <AnimatePresence>
            {inputText && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Badge
                  variant="outline"
                  className={`text-xs transition-colors ${
                    isAtLimit
                      ? 'border-red-300 text-red-600 bg-red-50 dark:border-red-600 dark:text-red-400 dark:bg-red-950/20'
                      : isNearLimit
                        ? 'border-yellow-300 text-yellow-600 bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:bg-yellow-950/20'
                        : 'border-gray-300 text-gray-600 bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:bg-gray-800'
                  }`}
                >
                  {characterCount}/{maxInputLength}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Textarea */}
        <div className="relative group">
          <Textarea
            placeholder="Type something interesting in English...
Try: 'The weather is beautiful today' or 'How are you doing?'"
            className={`min-h-[140px] w-full p-4 text-base border-2 rounded-2xl resize-none transition-all duration-300 bg-white dark:bg-gray-900 ${
              isLoading
                ? 'border-[#FF5B9E]/50 shadow-lg'
                : inputText
                  ? 'border-[#FF5B9E]/30 shadow-md focus:border-[#FF5B9E] focus:shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 focus:border-[#FF5B9E] hover:border-gray-300 dark:hover:border-gray-600'
            } focus:ring-4 focus:ring-[#FF5B9E]/10 placeholder:text-gray-400 dark:placeholder:text-gray-500`}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            maxLength={maxInputLength}
            disabled={isLoading}
          />

          {/* Voice Input Hint */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-[#FF5B9E]/10 hover:text-[#FF5B9E] transition-colors"
                    onClick={() => handleSpeak(inputText, 'en-US')}
                    disabled={!inputText || isLoading}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Listen to text (Ctrl/⌘ + Enter to translate)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Translation Mode Selector */}
      <div className="mt-6 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#FF5B9E]" />
          <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Translation Mode
          </Label>
        </div>

        <RadioGroup
          value={translationMode}
          onValueChange={(value) => setTranslationMode(value as TranslationMode)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {modes.map((mode) => (
            <motion.div
              key={mode.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative"
            >
              <div
                className={`relative overflow-hidden rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 ${
                  translationMode === mode.value
                    ? 'border-[#FF5B9E] bg-[#FF5B9E]/5 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-[#FF5B9E]/50 hover:bg-[#FF5B9E]/5'
                }`}
                onClick={() => setTranslationMode(mode.value)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setTranslationMode(mode.value)
                }}
                role="button"
                aria-pressed={translationMode === mode.value}
              >
                <div className="flex items-start space-x-3">
                  <RadioGroupItem
                    value={mode.value}
                    id={`mode-${mode.value}`}
                    className="mt-1 text-[#FF5B9E] border-[#FF5B9E]/50"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-lg ${mode.color}`}>
                        <mode.icon className="w-4 h-4 text-white" />
                      </div>
                      <Label
                        htmlFor={`mode-${mode.value}`}
                        className="text-base font-semibold cursor-pointer"
                      >
                        {mode.label}
                      </Label>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {mode.description}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {mode.features.map((feature, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs px-2 py-0.5 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Selection indicator */}
                <AnimatePresence>
                  {translationMode === mode.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-3 right-3"
                    >
                      <div className="w-3 h-3 bg-[#FF5B9E] rounded-full"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </RadioGroup>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 mt-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 min-w-[200px]"
        >
          <Button
            onClick={handleTranslate}
            disabled={!inputText.trim() || isLoading}
            size="lg"
            className="w-full bg-[#FF5B9E] hover:bg-[#E54A8C] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Translating...</span>
                </motion.div>
              ) : (
                <motion.div
                  key="translate"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <span>Translate</span>
                  <CornerDownLeft className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={!inputText || isLoading}
                size="lg"
                className="px-6 py-6 border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50 dark:hover:border-red-600 dark:hover:text-red-400 dark:hover:bg-red-950/10 transition-all duration-300 rounded-xl disabled:opacity-50"
              >
                <Eraser className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear text</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Keyboard Shortcut Hint */}
      <AnimatePresence>
        {inputText && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Press{' '}
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                Ctrl
              </kbd>{' '}
              +{' '}
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                Enter
              </kbd>{' '}
              to translate quickly
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TranslatorInput
