'use client'

import React from 'react'
import { VocabularyHeader } from '@/components/dashboard/vocabulary/VocabularyHeader'
import { VocabularyList } from '@/components/dashboard/vocabulary/VocabularyList'

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
