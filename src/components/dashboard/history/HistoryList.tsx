'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Clock, Languages, Trash2, BookmarkPlus, Info } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslationHistory } from '@/utils/hooks'
import { useDebounce } from '@/utils/hooks'
import { OutputActions } from '@/components/translation/outputActions'
import Markdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

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

interface HistoryListProps {
  filters?: {
    search?: string
  }
}

export function HistoryList({ filters }: HistoryListProps) {
  const [currentPage, setCurrentPage] = React.useState(1)

  // Debounce search term
  const debouncedSearch = useDebounce(filters?.search || '', 500)

  // Simple API options
  const apiOptions = React.useMemo(() => {
    const options: any = {
      page: currentPage,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }

    if (debouncedSearch) {
      options.search = debouncedSearch
    }

    return options
  }, [currentPage, debouncedSearch])

  const { history, loading, error, pagination, toggleFavorite, deleteTranslation } =
    useTranslationHistory(apiOptions)

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  // Handle page change
  const handlePageChange = React.useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

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
  const historyItems: TranslationHistory[] = history.map((item: any) => ({
    id: item.id,
    originalText: item.originalText,
    translatedText: item.translatedText,
    sourceLanguage: item.sourceLanguage,
    targetLanguage: item.targetLanguage,
    mode: item.mode,
    timestamp: item.createdAt,
    isFavorite: item.isFavorite,
    characterCount: item.characterCount || item.originalText?.length || 0,
    confidence: item.confidence || 95,
  }))

  // Note: Filtering and sorting are now handled server-side for better performance

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
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

  const handleDelete = async (id: string) => {
    try {
      await deleteTranslation(id)
      toast.success('Translation deleted')
    } catch (error) {
      toast.error('Failed to delete translation')
    }
  }

  const getModeColor = (mode: string) => {
    return mode === 'detailed'
      ? 'bg-purple-100 text-purple-700 border-purple-200'
      : 'bg-blue-100 text-blue-700 border-blue-200'
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

                <div className="flex items-center gap-2">
                  <OutputActions
                    textToCopy={item.translatedText}
                    textToSpeak={item.translatedText}
                    speakLang={
                      item.targetLanguage?.toLowerCase().startsWith('indones') ? 'id-ID' : 'en-US'
                    }
                    copyTooltip="Copy translation"
                    speakTooltip="Listen"
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFavorite(item.id)}
                    className={`h-8 w-8 p-0 ${item.isFavorite ? 'text-yellow-500' : 'text-neutral-400'}`}
                  >
                    <Star className={`h-4 w-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="h-8 w-8 p-0 text-neutral-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Translation Content */}
              <div className="space-y-3">
                {/* Original Text */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-2">
                    Original ({item.sourceLanguage})
                  </h4>
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <p className="text-sm text-neutral-800">{item.originalText}</p>
                  </div>
                </div>

                {/* Translated Text */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-2">
                    Translation ({item.targetLanguage})
                  </h4>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    {/* Meta details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-neutral-600">
                      <div className="flex items-center gap-2">
                        <Info className="h-3.5 w-3.5 text-neutral-400" />
                        <span>{item.characterCount} chars</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Info className="h-3.5 w-3.5 text-neutral-400" />
                        <span>confidence {item.confidence}%</span>
                      </div>
                    </div>

                    {item.mode === 'simple' && (
                      <p className="text-sm text-neutral-800">{item.translatedText}</p>
                    )}

                    {item.mode === 'detailed' && (
                      <Markdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
                        {item.translatedText}
                      </Markdown>
                    )}
                  </div>
                </div>
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

      {/* Simple Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
