'use client'

import React from 'react'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import Link from 'next/link'
import { withGuestOnly } from '@/features/auth/components/withAuth'

function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <RegisterForm />
        {/* Optional: Add a link to login page */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#FF5B9E] hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}

// Export the guest-only protected page
export default withGuestOnly(RegisterPage)
