'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

// Sample vocabulary items that would come from detailed translation
const sampleVocabularyItems = [
  {
    word: 'beautiful',
    translation: 'indah',
    type: 'adjective' as const,
    difficulty: 'easy' as const,
    context: 'Used to describe something that is pleasing to look at',
  },
  {
    word: 'magnificent',
    translation: 'megah',
    type: 'adjective' as const,
    difficulty: 'medium' as const,
    context: 'Used to describe something impressive and beautiful',
  },
  {
    word: 'extraordinary',
    translation: 'luar biasa',
    type: 'adjective' as const,
    difficulty: 'hard' as const,
    context: 'Used to describe something very unusual or remarkable',
  },
]

export default function TestVocabularyPage() {
  const { customer } = useAuth()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const testVocabularyCreation = async () => {
    if (!customer?.id) {
      toast.error('Please log in first')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/test/vocabulary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customer.id,
          vocabularyItems: sampleVocabularyItems,
        }),
      })

      const result = await response.json()
      console.log('Test result:', result)
      setResults(result)

      if (result.success) {
        toast.success(`Successfully created ${result.created} vocabulary items!`)
      } else {
        toast.error('Test failed: ' + result.error)
      }
    } catch (error) {
      console.error('Test error:', error)
      toast.error('Test failed')
    } finally {
      setLoading(false)
    }
  }

  if (!customer) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Vocabulary Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to test vocabulary creation.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Vocabulary Creation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            This page tests the vocabulary creation functionality that would be used when saving
            vocabulary from detailed translations.
          </p>

          <div>
            <h3 className="font-semibold mb-2">Sample Vocabulary Items:</h3>
            <div className="space-y-2">
              {sampleVocabularyItems.map((item, index) => (
                <div key={index} className="p-2 border rounded">
                  <strong>{item.word}</strong> → {item.translation} ({item.type}, {item.difficulty})
                  <br />
                  <small className="text-gray-600">{item.context}</small>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={testVocabularyCreation} disabled={loading} className="w-full">
            {loading ? 'Testing...' : 'Test Vocabulary Creation'}
          </Button>

          {results && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
