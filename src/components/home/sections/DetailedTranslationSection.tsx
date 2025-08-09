'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { OutputActions } from '@/components/translation/outputActions'
import 'katex/dist/katex.min.css'
import { handleCopy } from '@/lib/utils'
import type {} from '@/features/translation/types/translator'
import {
  Brain,
  Lightbulb,
  BookOpen,
  Target,
  Info,
  Loader2,
  Sparkles,
  ArrowRight,
  Copy,
} from 'lucide-react'
// Demo-only: translation action disabled on landing page
import Markdown from 'react-markdown'

type UIDetailedResult = {
  original: string
  translated: string
  language: string
  context: { formality: string; tone: string; usage: string }
  insights: string[]
  alternatives: string[]
  grammar: { structure: string; notes: string[] }
}

export const DetailedTranslationSection: React.FC = () => {
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<UIDetailedResult | null>(null)

  const combinedText = React.useMemo(() => {
    if (!result) return ''
    const ctx = `Context:\n- Formality: ${result.context.formality}\n- Tone: ${result.context.tone}\n- Usage: ${result.context.usage}`
    const insights = result.insights.length ? `\n\nInsights:\n${result.insights.join('\n')}` : ''
    const alternatives = result.alternatives.length
      ? `\n\nAlternatives:\n${result.alternatives.join('\n')}`
      : ''
    return `Original:\n${result.original}\n\nTranslation (${result.language}):\n${result.translated}\n\n${ctx}${insights}${alternatives}`
  }, [result])

  const handleAnalyze = async () => {
    // Demo-only: no network calls on landing page; show visual preview only.
    if (!inputText.trim()) return

    setIsLoading(true)

    await new Promise((r) => setTimeout(r, 700))

    // Simple, readable demo payload for visual purposes
    setResult({
      original: inputText,
      translated: 'Ini adalah pratinjau demo dari hasil terjemahan dengan analisis konteks.',
      language: 'Indonesian',
      context: { formality: 'Neutral', tone: 'Friendly', usage: 'Casual greeting' },
      insights: [
        'Menggunakan sapaan yang sopan dan ramah',
        'Struktur kalimat sederhana dan mudah dipahami',
      ],
      alternatives: ['Terjemahan alternatif 1', 'Terjemahan alternatif 2'],
      grammar: { structure: 'S + V + O', notes: ['Nada informal', 'Konteks perkenalan'] },
    })

    setIsLoading(false)
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-900 dark:to-blue-900/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Section Header */}
          <div className="text-center mb-10 sm:mb-16">
            <motion.div>
              <Badge
                variant="outline"
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-5 bg-blue-500/10 border-blue-500/20 text-blue-600 rounded-full text-xs sm:text-sm"
              >
                <Brain className="w-4 h-4" />
                AI Context Analysis
              </Badge>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6"
            >
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Deep Context
              </span>{' '}
              Translation
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Go beyond simple translation. Understand cultural context, formality levels, and
              linguistic nuances with AI-powered analysis.
            </motion.p>
          </div>

          {/* Translation Interface */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 sm:p-8 md:p-10 shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
          >
            {/* Input Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Advanced Translation & Analysis
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Get detailed insights about formality, tone, cultural context, and
                        alternative translations
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-4">
                <Textarea
                  placeholder="Enter a longer text, paragraph, or complex sentence for detailed analysis...

Example: 'I'm really excited to meet you today. The weather is beautiful, isn't it?'"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[100px] sm:min-h-[120px] text-base sm:text-lg p-4 sm:p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 resize-none"
                  maxLength={500}
                />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <span className="text-sm text-gray-500">{inputText.length}/500 characters</span>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      onClick={handleAnalyze}
                      disabled={!inputText.trim() || isLoading}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Analyze & Translate
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6 }}
                  aria-live="polite"
                  role="status"
                  className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="grid lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                    {/* Translation Results */}
                    <div className="space-y-6">
                      {/* Original & Translation */}
                      <Card className="group hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg flex-wrap">
                            <Target className="w-5 h-5 text-blue-600" />
                            <div className="flex gap-1">
                              <OutputActions
                                textToCopy={combinedText}
                                textToSpeak={result.translated}
                                speakLang="id-ID"
                                copyTooltip="Salin semua hasil"
                                speakTooltip="Dengar terjemahan"
                              />
                            </div>
                            Translation Result
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Original
                              </span>
                              <div className="flex gap-1">
                                <OutputActions
                                  textToCopy={result.original}
                                  textToSpeak={result.original}
                                  speakLang="en-US"
                                  copyTooltip="Salin teks asli"
                                  speakTooltip="Dengar teks asli"
                                />
                              </div>
                            </div>
                            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                              <Markdown>{result.original}</Markdown>
                            </div>
                          </div>

                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                {result.language} Translation
                              </span>
                              <div className="flex gap-1">
                                <OutputActions
                                  textToCopy={result.translated}
                                  textToSpeak={result.translated}
                                  speakLang="id-ID"
                                  copyTooltip="Salin terjemahan"
                                  speakTooltip="Dengar terjemahan"
                                />
                              </div>
                            </div>
                            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-blue-900 dark:text-blue-100">
                              <Markdown>{result.translated}</Markdown>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Context Analysis */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            Context Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                Formality
                              </div>
                              <div className="text-yellow-900 dark:text-yellow-100 font-semibold">
                                {result.context.formality}
                              </div>
                            </div>
                            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="text-sm font-medium text-green-700 dark:text-green-300">
                                Tone
                              </div>
                              <div className="text-green-900 dark:text-green-100 font-semibold">
                                {result.context.tone}
                              </div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                Usage
                              </div>
                              <div className="text-purple-900 dark:text-purple-100 font-semibold">
                                {result.context.usage}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Insights & Alternatives */}
                    <div className="space-y-6">
                      {/* Cultural Insights */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                            Cultural Insights (Markdown)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                            <Markdown>{result.insights.join('\n')}</Markdown>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Alternative Translations */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Sparkles className="w-5 h-5 text-[#FF5B9E]" />
                            Alternative Translations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {result.alternatives.map((alt, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-3 bg-[#FF5B9E]/5 border border-[#FF5B9E]/20 rounded-lg hover:bg-[#FF5B9E]/10 transition-colors cursor-pointer group"
                                onClick={() => handleCopy(alt)}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-900 dark:text-white text-sm">
                                    {alt}
                                  </span>
                                  <Copy className="w-4 h-4 text-gray-400 group-hover:text-[#FF5B9E] transition-colors" />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
