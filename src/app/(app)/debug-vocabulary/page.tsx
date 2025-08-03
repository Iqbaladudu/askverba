'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/contexts'
import { useVocabulary } from '@/utils/hooks'
import { toast } from 'sonner'

export default function DebugVocabularyPage() {
  const { customer } = useAuth()
  const { vocabulary, loading, error, stats, refetch } = useVocabulary()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const fetchDebugInfo = async () => {
    if (!customer?.id) {
      toast.error('Please log in first')
      return
    }

    try {
      const response = await fetch(`/api/debug/vocabulary?customerId=${customer.id}`)
      const result = await response.json()
      console.log('Debug info:', result)
      setDebugInfo(result)
    } catch (error) {
      console.error('Debug fetch error:', error)
      toast.error('Failed to fetch debug info')
    }
  }

  useEffect(() => {
    if (customer?.id) {
      fetchDebugInfo()
    }
  }, [customer?.id])

  if (!customer) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Vocabulary Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to debug vocabulary.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Vocabulary Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={fetchDebugInfo}>Refresh Debug Info</Button>
            <Button onClick={refetch}>Refresh Vocabulary Hook</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hook Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <strong>Error:</strong> {error || 'None'}
                  </p>
                  <p>
                    <strong>Vocabulary Count:</strong> {vocabulary?.length || 0}
                  </p>
                  <p>
                    <strong>Stats:</strong> {stats ? JSON.stringify(stats, null, 2) : 'None'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Direct API Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>Customer ID:</strong> {customer.id}
                  </p>
                  <p>
                    <strong>API Vocabulary Count:</strong> {debugInfo?.vocabulary?.count || 0}
                  </p>
                  <p>
                    <strong>All Vocabulary Count:</strong> {debugInfo?.allVocabulary?.count || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {vocabulary && vocabulary.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vocabulary Items (Hook)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {vocabulary.map((item: any, index: number) => (
                    <div key={index} className="p-2 border rounded bg-gray-50">
                      <strong>{item.word}</strong> → {item.translation}
                      <br />
                      <small className="text-gray-600">
                        Status: {item.status} | Difficulty: {item.difficulty} | Created:{' '}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {debugInfo?.vocabulary?.docs && debugInfo.vocabulary.docs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vocabulary Items (Direct API)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {debugInfo.vocabulary.docs.map((item: any, index: number) => (
                    <div key={index} className="p-2 border rounded bg-gray-50">
                      <strong>{item.word}</strong> → {item.translation}
                      <br />
                      <small className="text-gray-600">
                        Status: {item.status} | Difficulty: {item.difficulty} | Created:{' '}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {debugInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Full Debug Response</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
