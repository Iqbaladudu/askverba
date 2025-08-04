'use client'

import React, { useState } from 'react'
import { BookOpen, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useVocabulary } from '@/utils/hooks'
import { AnkiExportModal } from '@/components/vocabulary/AnkiExportModal'

export function VocabularyHeader() {
  const { stats, loading } = useVocabulary()
  const [showExportModal, setShowExportModal] = useState(false)

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-3 bg-primary-100 rounded-xl flex-shrink-0">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-800 truncate">Vocabulary Box</h1>
            <p className="text-sm sm:text-base text-neutral-600 truncate">Your saved words collection</p>
          </div>
          <Badge variant="secondary" className="bg-primary-100 text-primary-700 text-xs sm:text-sm flex-shrink-0">
            {loading ? '...' : `${stats?.totalWords || 0} words`}
          </Badge>
        </div>

        {!loading && stats && stats.totalWords > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowExportModal(true)}
            className="flex items-center justify-center gap-2 disabled:text-gray w-full sm:w-auto text-sm sm:text-base"
            disabled={true}
          >
            <Download className="h-4 w-4" />
            <span>Export to Anki</span>
          </Button>
        )}
      </div>

      <AnkiExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        totalWords={stats?.totalWords || 0}
      />
    </>
  )
}
