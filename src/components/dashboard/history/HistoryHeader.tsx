'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { History, Download, Trash2, Search, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useTranslationHistory } from '@/utils/hooks'

interface HistoryHeaderProps {
  onAdvancedSearch?: () => void
  onToggleFilters?: () => void
}

export function HistoryHeader({ onAdvancedSearch, onToggleFilters }: HistoryHeaderProps) {
  // Get real stats from database/Redis
  const { stats, loading, history } = useTranslationHistory()

  const handleExport = async () => {
    try {
      if (!history || history.length === 0) {
        alert('No translation history to export')
        return
      }

      // Create CSV content
      const csvHeaders = ['Date', 'Original Text', 'Translation', 'Mode', 'Language']
      const csvRows = history.map((item) => [
        new Date(item.createdAt).toLocaleDateString(),
        `"${item.originalText.replace(/"/g, '""')}"`,
        `"${item.translatedText.replace(/"/g, '""')}"`,
        item.mode || 'simple',
        item.targetLanguage || 'Indonesian',
      ])

      const csvContent = [csvHeaders, ...csvRows].map((row) => row.join(',')).join('\n')

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `translation-history-${new Date().toISOString().split('T')[0]}.csv`,
      )
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export translation history')
    }
  }

  const handleClearHistory = async () => {
    if (
      !confirm(
        'Are you sure you want to clear all translation history? This action cannot be undone.',
      )
    ) {
      return
    }

    try {
      // This would need to be implemented in the API
      console.log('Clearing translation history...')
      alert('Clear history functionality needs to be implemented in the API')
    } catch (error) {
      console.error('Clear history failed:', error)
      alert('Failed to clear translation history')
    }
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* Title Section */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 rounded-xl">
          <History className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Translation History</h1>
          <p className="text-neutral-600">View and manage your translation history</p>
        </div>
        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
          {loading
            ? 'Loading...'
            : `${stats?.totalTranslations?.toLocaleString() || 0} translations`}
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onAdvancedSearch}>
          <Search className="h-4 w-4 mr-2" />
          Advanced Search
        </Button>

        <Button variant="outline" size="sm" onClick={onToggleFilters}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>

        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        <Button variant="outline" size="sm" onClick={handleClearHistory}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear History
        </Button>
      </div>
    </div>
  )
}
