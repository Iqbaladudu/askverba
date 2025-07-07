'use client'

import React from 'react'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { MobileNavigation } from '@/components/dashboard/MobileNavigation'
import { withRequiredAuth } from '@/components/auth/withAuth'
import Navbar from '@/components/navbar'

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/30">
      {/* Unified Navbar */}
      <Navbar />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar - Hidden on mobile */}
        <DashboardSidebar className="hidden lg:block" />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Navigation - Only visible on mobile */}
      <MobileNavigation className="lg:hidden" />
    </div>
  )
}

// Export the protected layout
export default withRequiredAuth(DashboardLayout)
