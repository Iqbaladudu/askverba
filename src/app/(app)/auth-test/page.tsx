'use client'

import React from 'react'
import { AuthTest } from '@/components/auth/AuthTest'

export default function AuthTestPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Authentication Testing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test protected routes and authentication flow
          </p>
        </div>
        <AuthTest />
      </div>
    </main>
  )
}
