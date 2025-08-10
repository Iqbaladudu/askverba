'use client'

import React from 'react'
import { VocabularyHeader } from '@/components/dashboard/vocabulary/VocabularyHeader'
import { VocabularyList } from '@/components/dashboard/vocabulary/VocabularyList'

export const metadata = {
  title: 'Vocabulary | AskVerba',
  description: 'Explore and practice vocabulary with AskVerba',
}

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
