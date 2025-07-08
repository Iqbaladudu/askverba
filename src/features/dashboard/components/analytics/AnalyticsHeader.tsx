'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Download, 
  Calendar,
  TrendingUp,
  Filter
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function AnalyticsHeader() {
  const handleExport = () => {
    console.log('Exporting analytics report...')
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* Title Section */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-xl">
          <BarChart3 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Learning Analytics</h1>
          <p className="text-neutral-600">
            Track your progress and performance insights
          </p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          <TrendingUp className="h-3 w-3 mr-1" />
          +15% this week
        </Badge>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Time Period Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-neutral-500" />
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 3 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Metric Filter */}
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>

        {/* Export Button */}
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  )
}
