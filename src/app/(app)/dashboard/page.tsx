'use client'

import React from 'react'
import { TranslationInterface } from '@/features/dashboard/components/TranslationInterface'
import { DashboardHistory } from '@/features/dashboard/components/DashboardHistory'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Main Translation Interface - Primary Focus */}
      <div className="max-w-5xl mx-auto">
        <TranslationInterface />
      </div>

      {/* History Section - Secondary Content */}
      <DashboardHistory />
    </div>
  )
}
