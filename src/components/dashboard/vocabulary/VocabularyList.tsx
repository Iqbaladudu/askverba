'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Volume2, Star, Edit, Trash2, MoreHorizontal, TrendingUp, BookmarkPlus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useVocabulary } from '@/hooks/usePayloadData'
import { PracticeProgressBadge } from './PracticeProgressBadge'
import {
  PracticeFilter,
  filterVocabularyByPractice,
  sortVocabularyByPracticePriority,
} from './PracticeFilter'

interface VocabularyItem {
  id: string
  word: string
  translation: string
  pronunciation: string
  definition: string
  example: string
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'new' | 'learning' | 'mastered'
  addedAt: string
  lastPracticed: string | null // Keep raw date for PracticeProgressBadge
  lastPracticedFormatted: string // Formatted version for display
  practiceCount: number
  accuracy: number
  tags?:
    | {
        tag?: string | null
        id?: string | null
      }[]
    | null
}

export function VocabularyList() {
  const { vocabulary, loading, error, updateWord, deleteWord } = useVocabulary()
  const [practiceFilter, setPracticeFilter] = useState('all')

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-0 shadow-sm animate-pulse">
            <CardContent className="p-4">
              <div className="h-24 bg-neutral-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center">
          <p className="text-neutral-600">Error loading vocabulary: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!vocabulary || vocabulary.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center">
          <BookmarkPlus className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600 mb-2">No vocabulary words yet</p>
          <p className="text-sm text-neutral-500">Start learning by translating some text!</p>
        </CardContent>
      </Card>
    )
  }

  // Transform API data to match component interface
  const transformedItems: VocabularyItem[] = vocabulary.map((item: any) => ({
    id: item.id,
    word: item.word,
    translation: item.translation,
    pronunciation: item.pronunciation || '',
    definition: item.definition || '',
    example: item.example || '',
    difficulty: item.difficulty,
    status: item.status,
    addedAt: new Date(item.createdAt).toLocaleDateString(),
    lastPracticed: item.lastPracticed || null, // Keep raw date
    lastPracticedFormatted: item.lastPracticed
      ? formatTimeAgo(new Date(item.lastPracticed))
      : 'Never',
    practiceCount: item.practiceCount || 0,
    accuracy: item.accuracy || 0,
    tags: item.tags || [],
  }))

  // Apply practice filtering and sorting
  const filteredItems = filterVocabularyByPractice(transformedItems, practiceFilter)
  const vocabularyItems = sortVocabularyByPracticePriority(filteredItems)

  // Helper function to format time ago
  function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`

    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks} weeks ago`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'hard':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'learning':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'new':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200'
    }
  }

  const handleSpeak = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  const handleEdit = (id: string) => {
    toast.info('Edit functionality coming soon!')
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteWord(id)
      toast.success('Word removed from vocabulary')
    } catch (error) {
      toast.error('Failed to delete word')
    }
  }

  const handlePractice = async (id: string) => {
    try {
      // Update practice count and last practiced date
      const word = vocabularyItems.find((item) => item.id === id)
      if (word) {
        await updateWord(id, {
          practiceCount: (word.practiceCount || 0) + 1,
          lastPracticed: new Date().toISOString(),
        })

        // Navigate to practice page with specific word
        window.location.href = `/dashboard/practice?word=${id}`
        toast.success('Starting practice session!')
      }
    } catch (error) {
      console.error('Practice error:', error)
      toast.error('Failed to start practice session')
    }
  }

  const handleStatusChange = async (id: string, newStatus: 'new' | 'learning' | 'mastered') => {
    try {
      await updateWord(id, { status: newStatus })
      toast.success(`Status updated to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="space-y-4">
      {/* Practice Filter */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600">
          Showing {vocabularyItems.length} words
          {practiceFilter !== 'all' && (
            <span className="ml-2 text-primary-600 font-medium">(filtered by practice status)</span>
          )}
        </div>
        {/* <PracticeFilter currentFilter={practiceFilter} onFilterChange={setPracticeFilter} /> */}
      </div>

      {vocabularyItems.map((item) => (
        <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              {/* Main Content */}
              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-neutral-800">{item.word}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSpeak(item.word)}
                      className="h-8 w-8 p-0 hover:bg-neutral-100"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    {item.status === 'mastered' && (
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(item.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePractice(item.id)}>
                        <BookmarkPlus className="h-4 w-4 mr-2" />
                        Practice
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Pronunciation and Translation */}
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-neutral-500 font-mono">{item.pronunciation}</span>
                    <span className="text-primary-600 font-medium">{item.translation}</span>
                  </div>
                </div>

                {/* Definition and Example */}
                <div className="space-y-2">
                  <p className="text-sm text-neutral-700">
                    <span className="font-medium">Definition:</span> {item.definition}
                  </p>
                  <p className="text-sm text-neutral-600 italic">
                    <span className="font-medium not-italic">Example:</span> &quot;{item.example}
                    &quot;
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {item.tags?.map(
                    (tagObj: { tag?: string | null; id?: string | null }, index: number) =>
                      tagObj.tag && (
                        <Badge key={tagObj.id || index} variant="outline" className="text-xs">
                          {tagObj.tag}
                        </Badge>
                      ),
                  )}
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="lg:w-64 space-y-4">
                {/* Status and Difficulty */}
                <div className="flex lg:flex-col gap-2">
                  <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                  <Badge className={getDifficultyColor(item.difficulty)}>{item.difficulty}</Badge>
                </div>

                {/* Practice Progress */}
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <PracticeProgressBadge
                    practiceCount={item.practiceCount || 0}
                    accuracy={item.accuracy || 0}
                    lastPracticed={item.lastPracticed}
                    status={item.status}
                  />

                  <div className="mt-3 pt-3 border-t border-neutral-200">
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <TrendingUp className="h-3 w-3" />
                      <span>Added: {new Date(item.addedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button size="sm" className="w-full" onClick={() => handlePractice(item.id)}>
                  Practice Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Empty State */}
      {vocabularyItems.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <BookmarkPlus className="h-16 w-16 mx-auto mb-4 text-neutral-300" />
            <h3 className="text-lg font-medium text-neutral-700 mb-2">No vocabulary words yet</h3>
            <p className="text-neutral-500 mb-4">
              Start translating text to automatically build your vocabulary
            </p>
            <Button>
              <BookmarkPlus className="h-4 w-4 mr-2" />
              Add Your First Word
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Load More */}
      {vocabularyItems.length > 0 && (
        <div className="text-center pt-4">
          <Button variant="outline">Load More Words</Button>
        </div>
      )}
    </div>
  )
}
