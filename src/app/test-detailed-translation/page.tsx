'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { translateDetailedAction } from 'action/translate-detailed.action'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

export default function TestDetailedTranslationPage() {
  const { customer } = useAuth()
  const [inputText, setInputText] = useState('beautiful sunset')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testTranslation = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter text to translate')
      return
    }

    setLoading(true)
    try {
      console.log('Testing detailed translation for:', inputText)
      const response = await translateDetailedAction(inputText, customer?.id, false)
      console.log('Translation response:', response)
      setResult(response)
      toast.success('Translation completed!')
    } catch (error) {
      console.error('Translation error:', error)
      toast.error('Translation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Detailed Translation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Text to translate:
            </label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter English text to translate..."
              rows={3}
            />
          </div>

          <Button 
            onClick={testTranslation} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Translating...' : 'Test Detailed Translation'}
          </Button>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Translation Result</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Result Type:</h4>
                    <p className="text-sm bg-gray-100 p-2 rounded">
                      {typeof result.result === 'string' ? 'string' : result.result?.type || 'unknown'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Has Vocabulary:</h4>
                    <p className="text-sm bg-gray-100 p-2 rounded">
                      {typeof result.result === 'object' && result.result?.data?.vocabulary 
                        ? `Yes (${result.result.data.vocabulary.length} items)` 
                        : 'No'}
                    </p>
                  </div>

                  {typeof result.result === 'object' && result.result?.data?.vocabulary && (
                    <div>
                      <h4 className="font-semibold">Vocabulary Items:</h4>
                      <div className="space-y-2">
                        {result.result.data.vocabulary.map((item: any, index: number) => (
                          <div key={index} className="p-2 border rounded bg-gray-50">
                            <strong>{item.word}</strong> → {item.translation} 
                            <br />
                            <small className="text-gray-600">
                              {item.type} | {item.difficulty} | {item.context}
                            </small>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold">Full Response:</h4>
                    <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
