'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { History, ArrowRight, Copy, BookmarkPlus, Clock, Languages, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslationHistory } from '@/utils/hooks'

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

interface TranslationItem {
  id: string
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  mode: 'simple' | 'detailed'
  timestamp: string
  saved: boolean
}

export function RecentTranslations() {
  const { history, loading, updateTranslation } = useTranslationHistory()

  // Get recent translations (last 5)
  const recentTranslations = (history || [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((translation) => ({
      id: translation.id,
      originalText: translation.originalText,
      translatedText: translation.translatedText,
      sourceLanguage: translation.sourceLanguage,
      targetLanguage: translation.targetLanguage,
      mode: translation.mode as 'simple' | 'detailed',
      timestamp: formatTimeAgo(translation.createdAt),
      saved: translation.isFavorite,
    }))

  // Use only real data from database
  const displayTranslations = recentTranslations

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleSave = async (id: string) => {
    try {
      const translation = history.find((t) => t.id === id)
      if (translation) {
        await updateTranslation(id, { isFavorite: !translation.isFavorite })
        toast.success(translation.isFavorite ? 'Removed from favorites!' : 'Added to favorites!')
      }
    } catch (_error) {
      toast.error('Failed to save translation')
    }
  }

  const truncateText = (text: string, maxLength: number = 60) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-lg font-semibold text-neutral-800">
              Recent Translations
            </CardTitle>
          </div>
          <Link
            href="/dashboard/history"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            <span className="ml-2 text-sm text-neutral-600">Loading translations...</span>
          </div>
        ) : displayTranslations.length === 0 ? (
          <div className="text-center py-8">
            <Languages className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 mb-2">No translations yet</p>
            <p className="text-sm text-neutral-500">
              Start translating to see your recent translations here!
            </p>
          </div>
        ) : (
          displayTranslations.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between p-4 rounded-lg border border-neutral-100 hover:border-neutral-200 transition-colors"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {item.mode}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <Languages className="h-3 w-3" />
                    <span>
                      {item.sourceLanguage} → {item.targetLanguage}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    <Clock className="h-3 w-3" />
                    <span>{item.timestamp}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-neutral-800 font-medium">
                    {truncateText(item.originalText)}
                  </p>
                  <p className="text-sm text-neutral-600">{truncateText(item.translatedText)}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 ml-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(item.translatedText)}
                  className="h-8 w-8 p-0 hover:bg-neutral-100"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSave(item.id)}
                  className="h-8 w-8 p-0 hover:bg-neutral-100"
                >
                  <BookmarkPlus
                    className={`h-3 w-3 ${item.saved ? 'text-primary-600' : 'text-neutral-400'}`}
                  />
                </Button>
                {item.saved && (
                  <Badge variant="secondary" className="text-xs bg-primary-50 text-primary-700">
                    Saved
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}

        {!loading && displayTranslations.length > 0 && (
          <div className="pt-3 border-t border-neutral-100">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{displayTranslations.length} recent translations</span>
              <Link
                href="/dashboard/history"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View Full History →
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
