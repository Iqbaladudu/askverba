'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useVocabulary } from '@/utils/hooks'

export function QuickStats() {
  const { stats: vocabStats, loading: vocabLoading } = useVocabulary()

  const loading = vocabLoading

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-800">Quick Stats</h2>
        <Card className="border-0 shadow-sm animate-pulse">
          <CardContent className="p-4">
            <div className="h-16 bg-neutral-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-800">Quick Stats</h2>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Words Saved</p>
                <p className="text-2xl font-bold text-blue-800">{vocabStats?.totalWords || 0}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-200 text-blue-800">
              words
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
