'use client'

import React from 'react'

import { AnalyticsHeader } from './AnalyticsHeader'
import { AnalyticsOverview } from './AnalyticsOverview'
import { LearningProgress } from './LearningProgress'
import { ActivityHeatmap } from './ActivityHeatmap'
import { PerformanceMetrics } from './PerformanceMetrics'
import { GoalsTracking } from './GoalsTracking'

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
