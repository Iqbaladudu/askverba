'use client'

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
import { handleSpeak } from '@/core/utils'

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
                  variant={isAtLimit ? 'destructive' : isNearLimit ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {characterCount}/{maxInputLength}
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSpeak(inputText)}
                        className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                      >
                        <Volume2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Listen to pronunciation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Text Input */}
        <div className="relative">
          <Textarea
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type or paste English text here..."
            className="min-h-[120px] resize-none border-2 border-gray-200 dark:border-gray-700 focus:border-[#FF5B9E] dark:focus:border-[#FF5B9E] rounded-xl text-base leading-relaxed bg-white dark:bg-gray-950 transition-all duration-300 shadow-sm focus:shadow-md"
            maxLength={maxInputLength}
            disabled={isLoading}
          />
          <AnimatePresence>
            {inputText && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                disabled={isLoading}
              >
                <Eraser className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Translation Mode Selection */}
      <div className="mt-6 space-y-4">
        <Label className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Translation Mode
        </Label>

        <RadioGroup
          value={translationMode}
          onValueChange={(value) => setTranslationMode(value as TranslationMode)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {modes.map((mode) => {
            const IconComponent = mode.icon
            const isSelected = translationMode === mode.value

            return (
              <motion.div
                key={mode.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative rounded-xl border-2 transition-all duration-300 ${
                  isSelected
                    ? 'border-[#FF5B9E] bg-[#FF5B9E]/5 dark:bg-[#FF5B9E]/10 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-950'
                }`}
              >
                <Label
                  htmlFor={mode.value}
                  className="flex items-start gap-4 p-4 cursor-pointer h-full"
                >
                  <RadioGroupItem
                    value={mode.value}
                    id={mode.value}
                    className="mt-1 border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:border-[#FF5B9E] data-[state=checked]:bg-[#FF5B9E]"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${mode.color} bg-opacity-10 dark:bg-opacity-20`}
                      >
                        <IconComponent
                          className={`h-5 w-5 ${
                            mode.value === 'simple' ? 'text-green-600' : 'text-purple-600'
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {mode.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {mode.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {mode.features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Label>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-[#FF5B9E] rounded-full flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                  </motion.div>
                )}
              </motion.div>
            )
          })}
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
                  <FileText className="h-5 w-5" />
                  <span>Translate</span>
                  <Badge variant="secondary" className="ml-2 text-xs bg-white/20">
                    ⌘ + ↵
                  </Badge>
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
                size="lg"
                className="px-4 py-6 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl"
                disabled={isLoading}
              >
                <Mic className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Voice input (coming soon)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
