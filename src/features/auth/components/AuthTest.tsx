'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

export function AuthTest() {
  const { customer, token, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    logout()
    router.push('/login')
  }

  const testRoutes = [
    { path: '/dashboard', name: 'Dashboard', protected: true },
    { path: '/dashboard/vocabulary', name: 'Vocabulary', protected: true },
    { path: '/dashboard/analytics', name: 'Analytics', protected: true },
    { path: '/login', name: 'Login', protected: false },
    { path: '/register', name: 'Register', protected: false },
    { path: '/', name: 'Home', protected: false },
  ]

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading authentication state...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Authentication Test Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Authentication Status */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Authentication Status</h3>
          <div className="flex items-center gap-2">
            <Badge variant={isAuthenticated ? 'default' : 'destructive'}>
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </Badge>
            {customer && (
              <Badge variant="outline">
                {customer.name} ({customer.email})
              </Badge>
            )}
          </div>
          {token && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Token: {token.substring(0, 20)}...
            </p>
          )}
        </div>

        {/* Route Testing */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Route Testing</h3>
          <div className="grid grid-cols-1 gap-2">
            {testRoutes.map((route) => (
              <div key={route.path} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{route.name}</span>
                  <Badge variant={route.protected ? 'destructive' : 'secondary'} size="sm">
                    {route.protected ? 'Protected' : 'Public'}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(route.path)}
                >
                  Visit
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Actions</h3>
          <div className="flex gap-2">
            {isAuthenticated ? (
              <Button onClick={handleLogout} variant="destructive">
                Logout
              </Button>
            ) : (
              <>
                <Button onClick={() => router.push('/login')}>
                  Go to Login
                </Button>
                <Button onClick={() => router.push('/register')} variant="outline">
                  Go to Register
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Test Scenarios */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Test Scenarios</h3>
          <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
            <p>✅ Try accessing dashboard without login (should redirect to login)</p>
            <p>✅ Try accessing login/register while logged in (should redirect to dashboard)</p>
            <p>✅ Login and check if redirected to original page</p>
            <p>✅ Check if authentication state persists on page refresh</p>
            <p>✅ Test logout functionality</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
