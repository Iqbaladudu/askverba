'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus, Download, Upload, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PracticeQuickActions } from './PracticeQuickActions'
import { useVocabulary } from '@/hooks/usePayloadData'

export function VocabularyHeader() {
  const { stats, loading } = useVocabulary() // Just get stats
  const handleExport = () => {
    // Export vocabulary to PDF/CSV
  }

  const handleImport = () => {
    // Import vocabulary from file
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* Title Section */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary-100 rounded-xl">
          <BookOpen className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">My Vocabulary</h1>
          <p className="text-neutral-600">Manage and practice your saved words</p>
        </div>
        <Badge variant="secondary" className="bg-primary-100 text-primary-700">
          {loading ? '...' : `${stats?.totalWords || 0} words`}
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleImport}>
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>

        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        <Button variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>

        <PracticeQuickActions />

        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Word
        </Button>
      </div>
    </div>
  )
}
