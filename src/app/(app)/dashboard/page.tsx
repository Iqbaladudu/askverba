import React from 'react'
import { TranslationInterface } from '@/components/dashboard/TranslationInterface'
import { QuickStats } from '@/components/dashboard/QuickStats'
import { RecentVocabulary } from '@/components/dashboard/RecentVocabulary'
import { RecentTranslations } from '@/components/dashboard/RecentTranslations'
import { TranslationDebug } from '@/components/debug/TranslationDebug'
import { ApiTest } from '@/components/debug/ApiTest'
import { VocabularyTest } from '@/components/debug/VocabularyTest'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back to AskVerba!</h1>
        <p className="text-primary-100 text-lg">
          Continue your language learning journey with contextual translations
        </p>
      </div>

      {/* Main Translation Interface */}
      <TranslationInterface />

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="lg:col-span-1">
          <QuickStats />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <RecentVocabulary />
          <RecentTranslations />
        </div>
      </div>

      {/* Debug Section - Remove in production */}
      {/* <ApiTest />
      <TranslationDebug />
      <VocabularyTest /> */}
    </div>
  )
}
