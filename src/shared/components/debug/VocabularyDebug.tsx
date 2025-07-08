'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function VocabularyDebug() {
  const { customer } = useAuth()
  const [debugData, setDebugData] = useState<any>(null)
  const [customersData, setCustomersData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/customers')
      const data = await response.json()
      setCustomersData(data)
      console.log('Customers data:', data)
    } catch (error) {
      console.error('Customers fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDebugData = async () => {
    if (!customer?.id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/debug/vocabulary?customerId=${customer.id}`)
      const data = await response.json()
      setDebugData(data)
      console.log('Debug data:', data)
    } catch (error) {
      console.error('Debug fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTestVocabulary = async () => {
    if (!customer?.id) return

    setLoading(true)
    try {
      const testData = {
        customer: customer.id,
        word: 'hello',
        translation: 'halo',
        definition: 'A greeting',
        difficulty: 'easy',
        status: 'new',
      }

      const response = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      })

      const result = await response.json()
      console.log('Create test vocabulary result:', result)

      // Refresh debug data
      await fetchDebugData()
    } catch (error) {
      console.error('Create test vocabulary error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Vocabulary Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={fetchCustomers} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch All Customers'}
          </Button>
          <Button onClick={fetchDebugData} disabled={loading || !customer?.id}>
            {loading ? 'Loading...' : 'Fetch Debug Data'}
          </Button>
          <Button
            onClick={createTestVocabulary}
            disabled={loading || !customer?.id}
            variant="outline"
          >
            Create Test Vocabulary
          </Button>
        </div>

        {!customer?.id && (
          <p className="text-red-500">No customer ID available. Please login first.</p>
        )}

        {customer?.id && (
          <div className="bg-gray-100 p-4 rounded">
            <strong>Customer ID:</strong> {customer.id}
            <br />
            <strong>Customer Email:</strong> {customer.email}
          </div>
        )}

        {customersData && (
          <div className="bg-purple-100 p-4 rounded">
            <strong>All Customers ({customersData.customers?.count || 0}):</strong>
            <pre className="mt-2 text-sm overflow-auto max-h-32">
              {JSON.stringify(customersData.customers?.docs || [], null, 2)}
            </pre>
          </div>
        )}

        {debugData && (
          <div className="space-y-4">
            <div className="bg-green-100 p-4 rounded">
              <strong>Vocabulary Count:</strong> {debugData.vocabulary?.count || 0}
            </div>

            {debugData.customer && (
              <div className="bg-blue-100 p-4 rounded">
                <strong>Customer Found:</strong> {debugData.customer.email}
              </div>
            )}

            {debugData.vocabulary?.docs && debugData.vocabulary.docs.length > 0 && (
              <div className="bg-yellow-100 p-4 rounded">
                <strong>Vocabulary Items:</strong>
                <pre className="mt-2 text-sm overflow-auto">
                  {JSON.stringify(debugData.vocabulary.docs, null, 2)}
                </pre>
              </div>
            )}

            <div className="bg-gray-100 p-4 rounded">
              <strong>Full Debug Data:</strong>
              <pre className="mt-2 text-sm overflow-auto max-h-96">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
