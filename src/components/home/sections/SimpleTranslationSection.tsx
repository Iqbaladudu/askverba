'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Languages,
  Sparkles,
  Copy,
  Volume2,
  Loader2,
  CheckCircle,
  Zap,
} from 'lucide-react'
import { VocabularyBox, type VocabItem } from './VocabularyBox'

type UIResult = {
  original: string
  translated: string
  language: string
}

export const SimpleTranslationSection: React.FC = () => {
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<UIResult | null>(null)
  const [vocabulary, setVocabulary] = useState<VocabItem[]>([])
  const [copied, setCopied] = useState<'original' | 'translated' | false>(false)

  const handleTranslate = async () => {
    if (!inputText.trim()) return
    setIsLoading(true)
    setVocabulary([])
    await new Promise((r) => setTimeout(r, 500))
    setResult({
      original: inputText,
      translated: 'This is a demo preview of how translations will look in the app.',
      language: 'Indonesian',
    })
    setIsLoading(false)
  }

  const handleCopy = async (text: string, type: 'original' | 'translated') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <section className="py-14 sm:py-20 lg:py-24 bg-gradient-to-br from-white via-gray-50 to-[#FF5B9E]/5 dark:from-gray-900 dark:via-gray-800 dark:to-[#FF5B9E]/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* Section Header */}
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-5 bg-[#FF5B9E]/10 border-[#FF5B9E]/20 text-[#FF5B9E] rounded-full font-medium tracking-wide"
              >
                <Zap className="w-4 h-4" />
                Quick Translation
              </Badge>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            >
              <span className="bg-gradient-to-r from-[#FF5B9E] to-blue-600 bg-clip-text text-transparent">
                Instant
              </span>{' '}
              Translation
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto"
            >
              Get accurate translations in seconds. Perfect for quick phrases, sentences, or
              everyday conversations.
            </motion.p>
          </div>

          {/* Translation Interface */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 sm:p-10 shadow-xl border border-gray-200/60 dark:border-gray-700/60"
          >
            {/* Input Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <Languages className="w-5 h-5 text-[#FF5B9E]" />
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  English to Indonesian
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Type something in English..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
                  className="flex-1 h-12 text-base px-5 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-[#FF5B9E] focus:ring-2 focus:ring-[#FF5B9E]/10 transition-all duration-300"
                  maxLength={100}
                  aria-label="Text to translate"
                />
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={handleTranslate}
                    disabled={!inputText.trim() || isLoading}
                    className="w-full sm:w-auto h-12 px-6 bg-gradient-to-r from-[#FF5B9E] to-[#E54A8C] hover:from-[#E54A8C] hover:to-[#D63384] text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                    aria-label="Translate"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Translate
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Results Section */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  transition={{ duration: 0.5 }}
                  aria-live="polite"
                  className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
                    {/* Original Text */}
                    <Card className="group hover:shadow-lg transition-all duration-300 bg-white/95 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-700/60 rounded-xl">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 text-base">
                            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                            Original (English)
                          </h3>
                          <div className="flex gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSpeak(result.original)}
                              className="opacity-70 hover:opacity-100 transition-opacity duration-200"
                              aria-label="Speak original"
                            >
                              <Volume2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopy(result.original, 'original')}
                              className="opacity-70 hover:opacity-100 transition-opacity duration-200"
                              aria-label="Copy original"
                            >
                              {copied === 'original' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className="text-base text-gray-900 dark:text-white leading-relaxed break-words">
                          {result.original}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Translated Text */}
                    <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-[#FF5B9E]/10 via-white/90 to-blue-50/10 dark:from-[#FF5B9E]/10 dark:via-gray-900/90 dark:to-blue-900/10 border border-[#FF5B9E]/20 rounded-xl">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 text-base">
                            <span className="w-2.5 h-2.5 bg-[#FF5B9E] rounded-full"></span>
                            Translation ({result.language})
                          </h3>
                          <div className="flex gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSpeak(result.translated)}
                              className="opacity-70 hover:opacity-100 transition-opacity duration-200"
                              aria-label="Speak translation"
                            >
                              <Volume2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopy(result.translated, 'translated')}
                              className="opacity-70 hover:opacity-100 transition-opacity duration-200"
                              aria-label="Copy translation"
                            >
                              {copied === 'translated' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className="text-base text-gray-900 dark:text-white leading-relaxed font-medium break-words">
                          {result.translated}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Vocabulary Box Demo (hidden in landing demo) */}
                  {false && vocabulary.length > 0 && (
                    <div className="mt-8 md:col-span-2">
                      <VocabularyBox items={vocabulary} title="Key Vocabulary" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
