'use client'

import React from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'
import { withGuestOnly } from '@/components/auth/withAuth'

export const metadata = {
  title: 'Login | AskVerba',
  description: 'Login to your AskVerba account',
}

function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <LoginForm />
        {/* Optional: Add a link to register page */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#FF5B9E] hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </main>
  )
}

// Export the guest-only protected page
export default withGuestOnly(LoginPage)
