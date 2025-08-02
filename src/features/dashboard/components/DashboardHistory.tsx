'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { BookOpen, History, Clock, ArrowRight, Star } from 'lucide-react'
import { useVocabulary, useTranslationHistory } from '@/shared/hooks'
import Link from 'next/link'

export function DashboardHistory() {
  // Get recent data (limit to 10 items each)
  const { vocabulary: recentVocab, loading: vocabLoading } = useVocabulary()

  const { history: recentTranslations, loading: translationsLoading } = useTranslationHistory()

  // Limit to recent 10 items
  const limitedVocab = (recentVocab || []).slice(0, 10)
  const limitedTranslations = (recentTranslations || []).slice(0, 10)

  const renderVocabularyList = () => {
    if (vocabLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-neutral-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      )
    }

    if (!limitedVocab || limitedVocab.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">No vocabulary yet</h3>
          <p className="text-neutral-600 mb-4">
            Start building your vocabulary with detailed translations
          </p>
          <p className="text-sm text-neutral-500">
            Use the translation tool above and select "Detailed Analysis" mode
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {limitedVocab.map(
          (word: {
            id: string
            word: string
            translation: string
            difficulty?: string
            status?: string
            createdAt: string
          }) => (
            <div
              key={word.id}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold text-neutral-800 truncate">{word.word}</h4>
                  {word.status === 'mastered' && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                  )}
                </div>
                <p className="text-neutral-600 text-sm truncate">{word.translation}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    className={`text-xs font-medium px-2 py-1 ${
                      word.difficulty === 'easy'
                        ? 'bg-green-100 text-green-700'
                        : word.difficulty === 'hard'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {word.difficulty || 'medium'}
                  </Badge>
                  <span className="text-xs text-neutral-400">
                    {new Date(word.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    )
  }

  const renderTranslationsList = () => {
    if (translationsLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-neutral-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      )
    }

    if (!limitedTranslations || limitedTranslations.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <History className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">No translations yet</h3>
          <p className="text-neutral-600 mb-4">Your translation history will appear here</p>
          <p className="text-sm text-neutral-500">Start translating text using the tool above</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {limitedTranslations.map(
          (translation: {
            id: string
            originalText: string
            translatedText: string
            mode?: string
            createdAt: string
          }) => (
            <div
              key={translation.id}
              className="p-4 bg-white rounded-xl border border-neutral-200 hover:border-green-300 hover:shadow-sm transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm text-neutral-700 line-clamp-2 leading-relaxed">
                    {translation.originalText}
                  </p>
                  <div className="w-full h-px bg-neutral-200"></div>
                  <p className="text-neutral-800 font-medium line-clamp-2 leading-relaxed">
                    {translation.translatedText}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1">
                      {translation.mode === 'detailed' ? 'Detailed' : 'Quick'}
                    </Badge>
                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(translation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-neutral-800 mb-2">
                Your Learning History
              </CardTitle>
              <p className="text-neutral-600">Track your vocabulary and translation progress</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/vocabulary">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  All Vocabulary
                </Button>
              </Link>
              <Link href="/dashboard/practice">
                <Button size="sm" className="bg-primary-600 hover:bg-primary-700 text-white">
                  Practice Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Recent Vocabulary Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800">Recent Vocabulary</h3>
                </div>
                <Link href="/dashboard/vocabulary">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 self-start sm:self-auto"
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">{renderVocabularyList()}</div>
            </div>

            {/* Recent Translations Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <History className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800">Recent Translations</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 self-start sm:self-auto"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="space-y-3">{renderTranslationsList()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
