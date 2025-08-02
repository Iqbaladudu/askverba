'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/contexts'
import { getAuthTokenFromDocument, getCustomerFromDocument } from '@/lib/auth-cookies'

export default function DebugAuthPage() {
  const { customer, token, isAuthenticated, isLoading } = useAuth()
  const [cookieData, setCookieData] = useState<any>(null)
  const [allCookies, setAllCookies] = useState<string>('')

  const checkCookies = () => {
    const directToken = getAuthTokenFromDocument()
    const directCustomer = getCustomerFromDocument()
    const cookies = document.cookie

    setCookieData({
      directToken,
      directCustomer,
      hasDirectToken: !!directToken,
      hasDirectCustomer: !!directCustomer,
    })
    setAllCookies(cookies)
  }

  useEffect(() => {
    checkCookies()
  }, [])

  const clearAllCookies = () => {
    // Clear all cookies by setting them to expire in the past
    const cookies = document.cookie.split(';')
    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    })
    checkCookies()
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={checkCookies}>Refresh Cookie Data</Button>
            <Button onClick={clearAllCookies} variant="destructive">
              Clear All Cookies
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Auth Context State</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <strong>Has Customer:</strong> {customer ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <strong>Has Token:</strong> {token ? 'Yes' : 'No'}
                  </p>
                  {customer && (
                    <div>
                      <p>
                        <strong>Customer Email:</strong> {customer.email}
                      </p>
                      <p>
                        <strong>Customer Name:</strong> {customer.name}
                      </p>
                      <p>
                        <strong>Customer ID:</strong> {customer.id}
                      </p>
                    </div>
                  )}
                  {token && (
                    <p>
                      <strong>Token Length:</strong> {token.length}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Direct Cookie Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>Has Direct Token:</strong> {cookieData?.hasDirectToken ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <strong>Has Direct Customer:</strong>{' '}
                    {cookieData?.hasDirectCustomer ? 'Yes' : 'No'}
                  </p>
                  {cookieData?.directToken && (
                    <p>
                      <strong>Direct Token Length:</strong> {cookieData.directToken.length}
                    </p>
                  )}
                  {cookieData?.directCustomer && (
                    <div>
                      <p>
                        <strong>Direct Customer Email:</strong> {cookieData.directCustomer.email}
                      </p>
                      <p>
                        <strong>Direct Customer Name:</strong> {cookieData.directCustomer.name}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-40">
                {allCookies || 'No cookies found'}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cookie Data Details</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-60">
                {JSON.stringify(cookieData, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>1. Open browser console to see detailed logs</p>
                <p>2. Try logging in from another tab</p>
                <p>3. Come back here and click &quot;Refresh Cookie Data&quot;</p>
                <p>4. Check if cookies are being set correctly</p>
                <p>
                  5. If cookies exist but auth context shows not authenticated, there&apos;s a
                  parsing issue
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
