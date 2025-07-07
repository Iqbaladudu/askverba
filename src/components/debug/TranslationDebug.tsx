'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useTranslationHistory } from '@/hooks/usePayloadData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function TranslationDebug() {
  const { customer } = useAuth()
  const { history, loading, error, stats } = useTranslationHistory()

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Translation History Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">Authentication Status:</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify({ 
              isLoggedIn: !!customer,
              customerId: customer?.id,
              customerEmail: customer?.email 
            }, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold">Hook Status:</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify({ 
              loading,
              error,
              historyLength: history?.length,
              hasStats: !!stats
            }, null, 2)}
          </pre>
        </div>

        {error && (
          <div>
            <h3 className="font-semibold text-red-600">Error:</h3>
            <pre className="bg-red-100 p-2 rounded text-sm text-red-800">
              {error}
            </pre>
          </div>
        )}

        <div>
          <h3 className="font-semibold">Translation History Data:</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm max-h-96 overflow-auto">
            {JSON.stringify(history, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold">Stats Data:</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
