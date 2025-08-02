'use client'

import React from 'react'
import { VocabularyHeader } from '@/features/dashboard/components/vocabulary/VocabularyHeader'
import { VocabularyList } from '@/features/dashboard/components/vocabulary/VocabularyList'

export default function VocabularyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <VocabularyHeader />

      {/* Vocabulary List */}
      <VocabularyList />
    </div>
  )
}
