'use client'

import React from 'react'
import { PracticeCenter } from '@/features/practice/components/PracticeCenter'

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <PracticeCenter />
      </div>
    </div>
  )
}
