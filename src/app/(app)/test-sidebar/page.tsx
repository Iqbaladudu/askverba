'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar'
import { useVocabulary } from '@/shared/hooks'
import { useAuth } from '@/features/auth/contexts'

export default function TestSidebarPage() {
  const { customer } = useAuth()
  const {
    vocabulary,
    stats: vocabStats,
    loading: vocabLoading,
    error: vocabError,
  } = useVocabulary()

  if (!customer) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Sidebar Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to test the sidebar with real data.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white">
        <DashboardSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sidebar Data Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This page shows the sidebar with real data and displays the raw data for comparison.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vocabulary Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Loading:</strong> {vocabLoading ? 'Yes' : 'No'}
                </p>
                <p>
                  <strong>Error:</strong> {vocabError || 'None'}
                </p>
                <p>
                  <strong>Total Words:</strong> {vocabStats?.totalWords || 0}
                </p>
                <p>
                  <strong>Recent Words:</strong> {vocabulary?.length || 0}
                </p>
                {vocabulary && vocabulary.length > 0 && (
                  <div>
                    <p>
                      <strong>Latest Words:</strong>
                    </p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      {vocabulary.slice(0, 3).map((word, index) => (
                        <li key={index}>
                          {word.word} → {word.translation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Loading:</strong> {progressLoading ? 'Yes' : 'No'}
                </p>
                <p>
                  <strong>Error:</strong> {progressError || 'None'}
                </p>
                <p>
                  <strong>Current Streak:</strong> {progress?.currentStreak || 0}
                </p>
                <p>
                  <strong>Average Accuracy:</strong> {progress?.averageAccuracy || 0}%
                </p>
                <p>
                  <strong>Total Sessions:</strong> {progress?.totalSessions || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Practice Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Loading:</strong> {practiceLoading ? 'Yes' : 'No'}
                </p>
                <p>
                  <strong>Error:</strong> {practiceError || 'None'}
                </p>
                <p>
                  <strong>Current Streak:</strong> {practiceStats?.currentStreak || 0}
                </p>
                <p>
                  <strong>Average Score:</strong> {practiceStats?.averageScore || 0}%
                </p>
                <p>
                  <strong>Total Practices:</strong> {practiceStats?.totalPractices || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Raw Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Vocabulary Stats:</h4>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-40">
                  {JSON.stringify(vocabStats, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Progress Data:</h4>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-40">
                  {JSON.stringify(progress, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Practice Stats:</h4>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-40">
                  {JSON.stringify(practiceStats, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
