'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ApiTest() {
  const { customer } = useAuth()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDirectAPI = async () => {
    if (!customer?.id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/dev/seed-history?customerId=${customer.id}`)
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const seedData = async () => {
    if (!customer?.id) return

    setLoading(true)
    try {
      const response = await fetch('/api/dev/seed-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId: customer.id })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>API Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testDirectAPI} disabled={loading || !customer?.id}>
            Check Existing Data
          </Button>
          <Button onClick={seedData} disabled={loading || !customer?.id} variant="outline">
            Seed Sample Data
          </Button>
        </div>

        {result && (
          <div>
            <h3 className="font-semibold">API Result:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm max-h-96 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
