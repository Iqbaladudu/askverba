'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Volume2, Star, ArrowRight, Clock, Loader2 } from 'lucide-react'
import { useVocabulary } from '@/shared/hooks'
import { useAuth } from '@/features/auth/contexts'

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hours ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} days ago`

  return date.toLocaleDateString()
}

interface VocabularyItem {
  id: string
  word: string
  translation: string
  pronunciation: string
  difficulty: 'easy' | 'medium' | 'hard'
  addedAt: string
  mastered: boolean
}

export function RecentVocabulary() {
  const { customer } = useAuth()
  const { vocabulary, loading, updateWord } = useVocabulary()

  // Get recent vocabulary (last 5)
  const recentWords = (vocabulary || [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((word) => ({
      id: word.id,
      word: word.word,
      translation: word.translation,
      pronunciation: '', // PayloadCMS doesn't have pronunciation field
      difficulty: word.difficulty as 'easy' | 'medium' | 'hard',
      addedAt: formatTimeAgo(word.createdAt),
      mastered: word.status === 'mastered',
    }))

  // Use only real data from database
  const displayWords = recentWords

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'hard':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-neutral-100 text-neutral-700'
    }
  }

  const handleSpeak = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  const handleToggleMastery = async (id: string) => {
    try {
      const word = words.find((w) => w.id === id)
      if (word) {
        const newStatus = word.status === 'mastered' ? 'learning' : 'mastered'
        await updateWord(id, { status: newStatus })
      }
    } catch (error) {
      console.error('Failed to update word status:', error)
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary-500" />
            Recent Vocabulary
          </CardTitle>
          <Link href="/dashboard/vocabulary">
            <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            <span className="ml-2 text-sm text-neutral-600">Loading vocabulary...</span>
          </div>
        ) : displayWords.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 mb-2">No vocabulary words yet</p>
            <p className="text-sm text-neutral-500">
              Start learning vocabulary by using detailed translation mode!
            </p>
          </div>
        ) : (
          displayWords.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 hover:border-neutral-200 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-neutral-800">{item.word}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSpeak(item.word)}
                      className="h-6 w-6 p-0 hover:bg-neutral-100"
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleMastery(item.id)}
                      className="h-6 w-6 p-0 hover:bg-neutral-100"
                    >
                      <Star
                        className={`h-4 w-4 ${item.mastered ? 'text-yellow-500 fill-current' : 'text-neutral-300'}`}
                      />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getDifficultyColor(item.difficulty)}>
                      {item.difficulty}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium">Translation:</span> {item.translation}
                  </p>
                  <p className="text-xs text-neutral-500">
                    <span className="font-medium">Pronunciation:</span> {item.pronunciation}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    <Clock className="h-3 w-3" />
                    <span>Added {item.addedAt}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {!loading && displayWords.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
            <p className="text-sm">No vocabulary words yet</p>
            <p className="text-xs text-neutral-400 mt-1">
              Start translating to build your vocabulary
            </p>
          </div>
        )}

        {!loading && (
          <div className="pt-3 border-t border-neutral-100">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{displayWords.length} recent words</span>
              <Link
                href="/dashboard/vocabulary/practice"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Practice Now →
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
