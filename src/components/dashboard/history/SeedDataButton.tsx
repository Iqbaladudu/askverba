'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Database, Loader2, Check, AlertCircle } from 'lucide-react'
import { useAuth } from '@/features/auth/contexts'

export function SeedDataButton() {
  const { customer } = useAuth()
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedStatus, setSeedStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  // Only show in development environment
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const handleSeedData = async () => {
    if (!customer?.id) {
      setMessage('Please login first')
      setSeedStatus('error')
      return
    }

    setIsSeeding(true)
    setSeedStatus('idle')
    setMessage('')

    try {
      // First check if data already exists
      const checkResponse = await fetch(`/api/dev/seed-history?customerId=${customer.id}`)
      const checkData = await checkResponse.json()

      if (checkData.count > 0) {
        setMessage(`You already have ${checkData.count} translation history entries`)
        setSeedStatus('error')
        setIsSeeding(false)
        return
      }

      // Seed the data
      const response = await fetch('/api/dev/seed-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customer.id,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage(data.message)
        setSeedStatus('success')

        // Refresh the page after 2 seconds to show new data
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage(data.error || 'Failed to seed data')
        setSeedStatus('error')
      }
    } catch (error) {
      console.error('Error seeding data:', error)
      setMessage('Failed to seed data')
      setSeedStatus('error')
    } finally {
      setIsSeeding(false)
    }
  }

  const getStatusIcon = () => {
    if (isSeeding) return <Loader2 className="h-4 w-4 animate-spin" />
    if (seedStatus === 'success') return <Check className="h-4 w-4 text-green-600" />
    if (seedStatus === 'error') return <AlertCircle className="h-4 w-4 text-red-600" />
    return <Database className="h-4 w-4" />
  }

  const getStatusColor = () => {
    if (seedStatus === 'success') return 'text-green-600'
    if (seedStatus === 'error') return 'text-red-600'
    return 'text-neutral-600'
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-yellow-800 mb-1">Development Mode</h3>
          <p className="text-yellow-700 text-sm">
            No translation history found. Add sample data for testing.
          </p>
          {message && <p className={`text-sm mt-2 ${getStatusColor()}`}>{message}</p>}
        </div>

        <Button
          onClick={handleSeedData}
          disabled={isSeeding}
          variant="outline"
          size="sm"
          className="border-yellow-300 hover:bg-yellow-100"
        >
          {getStatusIcon()}
          <span className="ml-2">{isSeeding ? 'Adding Data...' : 'Add Sample Data'}</span>
        </Button>
      </div>
    </div>
  )
}
