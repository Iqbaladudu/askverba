'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Copy,
  Star,
  MoreHorizontal,
  Clock,
  Languages,
  Volume2,
  BookmarkPlus,
  Trash2,
  Edit,
  Share,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useTranslationHistory } from '@/hooks/usePayloadData'
import { SeedDataButton } from './SeedDataButton'

interface TranslationHistory {
  id: string
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  mode: 'simple' | 'detailed'
  timestamp: string
  isFavorite: boolean
  characterCount: number
  confidence: number
}

type FilterType = 'all' | 'favorites' | 'recent' | 'long'
type SortType = 'newest' | 'oldest' | 'alphabetical' | 'length'

interface HistoryListProps {
  filters?: {
    search: string
    filter: FilterType
    sort: SortType
  }
}

export function HistoryList({ filters }: HistoryListProps) {
  const { history, loading, error, toggleFavorite, updateTranslation, deleteTranslation, refetch } =
    useTranslationHistory({
      limit: 20,
    })

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-0 shadow-sm animate-pulse">
            <CardContent className="p-4">
              <div className="h-32 bg-neutral-200 rounded"></div>
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
          <p className="text-neutral-600">Error loading history: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!history || history.length === 0) {
    return (
      <div className="space-y-4">
        {/* Seed Data Button for Development */}
        <SeedDataButton />

        {/* Empty State */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <BookmarkPlus className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 mb-2">No translation history yet</p>
            <p className="text-sm text-neutral-500">Start translating to see your history here!</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Transform API data to match component interface
  let historyItems: TranslationHistory[] = history.map((item: any) => ({
    id: item.id,
    originalText: item.originalText,
    translatedText: item.translatedText,
    sourceLanguage: item.sourceLanguage,
    targetLanguage: item.targetLanguage,
    mode: item.mode,
    timestamp: item.createdAt,
    isFavorite: item.isFavorite,
    characterCount: item.characterCount || item.originalText.length,
    confidence: item.confidence || 95,
  }))

  // Apply filters
  if (filters) {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      historyItems = historyItems.filter(
        (item) =>
          item.originalText.toLowerCase().includes(searchLower) ||
          item.translatedText.toLowerCase().includes(searchLower),
      )
    }

    // Category filter
    if (filters.filter !== 'all') {
      switch (filters.filter) {
        case 'favorites':
          historyItems = historyItems.filter((item) => item.isFavorite)
          break
        case 'recent':
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          historyItems = historyItems.filter((item) => new Date(item.timestamp) >= sevenDaysAgo)
          break
        case 'long':
          historyItems = historyItems.filter((item) => item.characterCount > 200)
          break
      }
    }

    // Sort
    switch (filters.sort) {
      case 'newest':
        historyItems.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        break
      case 'oldest':
        historyItems.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )
        break
      case 'alphabetical':
        historyItems.sort((a, b) => a.originalText.localeCompare(b.originalText))
        break
      case 'length':
        historyItems.sort((a, b) => b.characterCount - a.characterCount)
        break
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleToggleFavorite = async (id: string) => {
    try {
      const item = historyItems.find((h) => h.id === id)
      if (item) {
        await toggleFavorite(id, !item.isFavorite)
        toast.success('Updated favorites')
      }
    } catch (error) {
      toast.error('Failed to update favorite')
    }
  }

  const handleSpeak = (text: string, language: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'English' ? 'en-US' : 'id-ID'
      speechSynthesis.speak(utterance)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTranslation(id)
      toast.success('Translation deleted')
    } catch (error) {
      toast.error('Failed to delete translation')
    }
  }

  const handleSaveToVocabulary = (text: string) => {
    toast.info('Saved to vocabulary!')
  }

  const getModeColor = (mode: string) => {
    return mode === 'detailed'
      ? 'bg-purple-100 text-purple-700 border-purple-200'
      : 'bg-blue-100 text-blue-700 border-blue-200'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-green-600'
    if (confidence >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-4">
      {historyItems.map((item) => (
        <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm text-neutral-600">
                      {item.sourceLanguage} → {item.targetLanguage}
                    </span>
                  </div>
                  <Badge className={getModeColor(item.mode)}>{item.mode}</Badge>
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(item.timestamp)}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFavorite(item.id)}
                    className={`h-8 w-8 p-0 ${item.isFavorite ? 'text-yellow-500' : 'text-neutral-400'}`}
                  >
                    <Star className={`h-4 w-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleCopy(item.originalText + '\n' + item.translatedText)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Both
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSaveToVocabulary(item.originalText)}>
                        <BookmarkPlus className="h-4 w-4 mr-2" />
                        Save to Vocabulary
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Translation
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
              </div>

              {/* Translation Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Original Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-neutral-700">
                      Original ({item.sourceLanguage})
                    </h4>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSpeak(item.originalText, item.sourceLanguage)}
                        className="h-6 w-6 p-0"
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(item.originalText)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <p className="text-sm text-neutral-800">{item.originalText}</p>
                  </div>
                </div>

                {/* Translated Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-neutral-700">
                      Translation ({item.targetLanguage})
                    </h4>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSpeak(item.translatedText, item.targetLanguage)}
                        className="h-6 w-6 p-0"
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(item.translatedText)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
                    <p className="text-sm text-neutral-800">{item.translatedText}</p>
                  </div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-4">
                  <span>{item.characterCount} characters</span>
                  <span className={`font-medium ${getConfidenceColor(item.confidence)}`}>
                    {item.confidence}% confidence
                  </span>
                </div>

                {/* <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Translate Again
                  </Button>
                  <Button size="sm" className="h-7 text-xs">
                    Use as Template
                  </Button>
                </div> */}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Empty State */}
      {historyItems.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Languages className="h-16 w-16 mx-auto mb-4 text-neutral-300" />
            <h3 className="text-lg font-medium text-neutral-700 mb-2">No translation history</h3>
            <p className="text-neutral-500 mb-4">
              Your translation history will appear here as you use the translator
            </p>
            <Button>Start Translating</Button>
          </CardContent>
        </Card>
      )}

      {/* Load More */}
      {historyItems.length > 0 && (
        <div className="text-center pt-4">
          <Button variant="outline">Load More Translations</Button>
        </div>
      )}
    </div>
  )
}
