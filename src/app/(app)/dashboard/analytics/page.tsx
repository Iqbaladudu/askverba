import React from 'react'
import { AnalyticsHeader } from '@/components/dashboard/analytics/AnalyticsHeader'
import { AnalyticsOverview } from '@/components/dashboard/analytics/AnalyticsOverview'
import { LearningProgress } from '@/components/dashboard/analytics/LearningProgress'
import { ActivityHeatmap } from '@/components/dashboard/analytics/ActivityHeatmap'
import { PerformanceMetrics } from '@/components/dashboard/analytics/PerformanceMetrics'
import { GoalsTracking } from '@/components/dashboard/analytics/GoalsTracking'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <AnalyticsHeader />

      {/* Overview Stats */}
      <AnalyticsOverview />

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress Chart */}
        <LearningProgress />

        {/* Performance Metrics */}
        <PerformanceMetrics />
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap />

      {/* Goals Tracking */}
      <GoalsTracking />
    </div>
  )
}
