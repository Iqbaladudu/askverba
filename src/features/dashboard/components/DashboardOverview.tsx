'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, History, Brain, TrendingUp, ArrowRight, Clock, Star, Target } from 'lucide-react'
import { useVocabulary, useTranslationHistory } from '@/shared/hooks'

export function DashboardOverview() {
  const { vocabulary, stats: vocabStats, loading: vocabLoading } = useVocabulary()
  const { history, loading: historyLoading } = useTranslationHistory()

  // Get recent items (simplified)
  const recentVocab = (vocabulary || []).slice(0, 3)
  const recentTranslations = (history || []).slice(0, 3)

  const quickActions = [
    {
      title: 'Vocabulary',
      description: `${vocabStats?.totalWords || 0} words saved`,
      icon: BookOpen,
      href: '/dashboard/vocabulary',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Practice',
      description: 'Test your knowledge',
      icon: Brain,
      href: '/dashboard/practice',
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      iconColor: 'text-purple-600',
      badge: 'Beta',
    },
    {
      title: 'History',
      description: `${history?.length || 0} translations`,
      icon: History,
      href: '/dashboard/history',
      color: 'bg-green-50 text-green-600 border-green-200',
      iconColor: 'text-green-600',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Quick Actions */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-neutral-800">Explore Your Learning Tools</h2>
          <p className="text-neutral-600">
            Access your vocabulary, practice sessions, and learning history
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card
                className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden relative ${action.color} hover:scale-[1.02] sm:hover:scale-105 active:scale-[0.98]`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 sm:p-8 relative">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        <action.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${action.iconColor}`} />
                      </div>
                      {action.badge && (
                        <Badge className="bg-white/90 text-neutral-700 font-semibold px-2 sm:px-3 py-1 shadow-sm text-xs sm:text-sm">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-bold text-neutral-800 group-hover:text-neutral-900 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    <div className="flex items-center text-neutral-600 group-hover:text-neutral-800 transition-colors">
                      <span className="text-xs sm:text-sm font-medium">Explore now</span>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Vocabulary */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-800">Recent Vocabulary</h3>
                  <p className="text-sm text-neutral-600">Your latest learned words</p>
                </div>
              </div>
              <Link href="/dashboard/vocabulary">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  View all
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            {vocabLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-neutral-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentVocab.length === 0 ? (
              <div className="text-center py-6 text-neutral-500">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
                <p className="text-sm">No vocabulary yet</p>
                <p className="text-xs text-neutral-400">Start with detailed translation</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentVocab.map(
                  (word: {
                    id: string
                    word: string
                    translation: string
                    difficulty?: string
                    status?: string
                  }) => (
                    <div
                      key={word.id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-white/60 rounded-xl border border-blue-100 hover:bg-white/80 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-neutral-800 text-sm sm:text-base truncate">
                          {word.word}
                        </p>
                        <p className="text-xs sm:text-sm text-neutral-600 truncate">
                          {word.translation}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-3">
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
                        {word.status === 'mastered' && (
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Translations */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-800 flex items-center gap-2">
                <History className="h-4 w-4 text-green-600" />
                Recent Translations
              </h3>
              <Link href="/dashboard/history">
                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                  View All
                </Button>
              </Link>
            </div>

            {historyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-neutral-100 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : recentTranslations.length === 0 ? (
              <div className="text-center py-6 text-neutral-500">
                <History className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
                <p className="text-sm">No translations yet</p>
                <p className="text-xs text-neutral-400">Start translating above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTranslations.map(
                  (translation: {
                    id: string
                    originalText: string
                    translatedText: string
                    mode?: string
                    createdAt: string
                  }) => (
                    <div
                      key={translation.id}
                      className="p-3 sm:p-4 bg-white/60 rounded-xl border border-green-100 hover:bg-white/80 transition-colors"
                    >
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm text-neutral-800 line-clamp-2 leading-relaxed">
                          {translation.originalText}
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-neutral-600 line-clamp-2 leading-relaxed">
                          {translation.translatedText}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1">
                            {translation.mode || 'simple'}
                          </Badge>
                          <span className="text-xs text-neutral-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(translation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress - Simple */}
      {vocabStats && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-primary-50 to-primary-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-500 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-800">Learning Progress</h3>
                  <p className="text-sm text-primary-600">
                    {vocabStats.totalWords || 0} words learned • Keep it up!
                  </p>
                </div>
              </div>
              <Link href="/dashboard/practice">
                <Button size="sm" className="bg-primary-600 hover:bg-primary-700">
                  <Target className="h-4 w-4 mr-2" />
                  Practice Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
