'use client'

import React, { useState } from 'react'
import { BookOpen, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useVocabulary } from '@/hooks/usePayloadData'
import { AnkiExportModal } from '@/components/vocabulary/AnkiExportModal'

export function VocabularyHeader() {
  const { stats, loading } = useVocabulary()
  const [showExportModal, setShowExportModal] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-100 rounded-xl">
            <BookOpen className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Vocabulary Box</h1>
            <p className="text-neutral-600">Your saved words collection</p>
          </div>
          <Badge variant="secondary" className="bg-primary-100 text-primary-700">
            {loading ? '...' : `${stats?.totalWords || 0} words`}
          </Badge>
        </div>

        {!loading && stats && stats.totalWords > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export to Anki
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
