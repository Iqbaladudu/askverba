'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { translateSimpleAction } from '@/features/translation/actions/translate-simple.action'
import { SimpleTranslationResult } from '@/core/schema'
import { useAuth } from '@/features/auth/contexts'
import { getAuthTokenHybrid } from '@/lib/auth-cookies'

export function VocabularyTest() {
  const [inputText, setInputText] = useState(
    'The beautiful sunset painted the sky with vibrant colors.',
  )
  const [result, setResult] = useState<SimpleTranslationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { customer } = useAuth()

  const handleTest = async () => {
    if (!inputText.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('=== VOCABULARY TEST DEBUG ===')
      console.log('Customer:', customer)
      console.log('Customer ID:', customer?.id)

      // Check token availability from cookies only
      const cookieToken = getAuthTokenHybrid()
      console.log('Cookie token available:', !!cookieToken)
      console.log(
        'Cookie token preview:',
        cookieToken ? `${cookieToken.substring(0, 20)}...` : 'null',
      )

      // Check server token
      try {
        const serverResponse = await fetch('/api/auth/token', {
          method: 'GET',
          credentials: 'include',
        })
        if (serverResponse.ok) {
          const serverData = await serverResponse.json()
          console.log('Server token available:', !!serverData.token)
          console.log(
            'Server token preview:',
            serverData.token ? `${serverData.token.substring(0, 20)}...` : 'null',
          )
        } else {
          console.log('Server token request failed:', serverResponse.status)
        }
      } catch (err) {
        console.log('Server token request error:', err)
      }

      console.log('Testing simple translation with vocabulary extraction...')
      const response = await translateSimpleAction(inputText, customer?.id, true)
      console.log('Response:', response)
      setResult(response.result)
    } catch (err) {
      console.error('Test error:', err)
      setError(err instanceof Error ? err.message : 'Test failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Vocabulary Extraction Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Text:</label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to test vocabulary extraction..."
            rows={3}
          />
        </div>

        <Button onClick={handleTest} disabled={loading || !inputText.trim()}>
          {loading ? 'Testing...' : 'Test Vocabulary Extraction'}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">Error: {error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-medium text-blue-900 mb-2">Translation:</h3>
              <p className="text-blue-800">{result.translation}</p>
            </div>

            {result.vocabulary && result.vocabulary.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-medium text-green-900 mb-3">
                  Extracted Vocabulary ({result.vocabulary.length} words):
                </h3>
                <div className="space-y-2">
                  {result.vocabulary.map((item, index) => (
                    <div key={index} className="p-2 bg-white border border-green-200 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{item.word}</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">{item.type}</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 rounded">
                          {item.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>Translation:</strong> {item.translation}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Context:</strong> {item.context}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Raw Response:</h4>
              <pre className="text-xs text-gray-700 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
