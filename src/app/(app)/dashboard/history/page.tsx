'use client'

import React, { useState } from 'react'
import { HistoryList } from '@/components/dashboard/history/HistoryList'

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-6">
      {/* Minimalist Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Translation History</h1>
          <p className="text-neutral-600">Your recent translations</p>
        </div>
      </div>

      {/* Simple Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search translations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* History List */}
      <HistoryList filters={{ search: searchTerm }} />
    </div>
  )
}
