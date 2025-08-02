'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/core/utils'
import { Home, BookOpen, BarChart3, User, Languages, History, Brain } from 'lucide-react'

interface MobileNavigationProps {
  className?: string
}

const mobileNavItems = [
  {
    title: 'Translate',
    href: '/dashboard',
    icon: Languages,
  },
  {
    title: 'Vocabulary',
    href: '/dashboard/vocabulary',
    icon: BookOpen,
  },
  {
    title: 'Practice',
    href: '/dashboard/practice',
    icon: Brain,
  },
  {
    title: 'History',
    href: '/dashboard/history',
    icon: History,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
]

export function MobileNavigation({ className }: MobileNavigationProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-xl border-t border-neutral-200/50 px-3 py-2',
        'shadow-2xl shadow-neutral-900/10 safe-area-pb',
        className,
      )}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl transition-all duration-300 min-w-0 flex-1 relative',
                'active:scale-95 touch-manipulation',
                isActive
                  ? 'text-primary-600 bg-gradient-to-b from-primary-50 to-primary-100/50 shadow-lg shadow-primary-500/20'
                  : 'text-neutral-500 hover:text-neutral-700 active:bg-neutral-100/50',
              )}
            >
              {/* Background glow for active state */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-b from-primary-100/50 to-primary-50/30 rounded-2xl blur-sm" />
              )}

              <div className="relative z-10 flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300',
                    isActive
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110'
                      : 'bg-transparent',
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 transition-all duration-300',
                      isActive ? 'text-white' : 'text-current',
                    )}
                  />
                </div>

                <span
                  className={cn(
                    'text-xs font-semibold truncate transition-all duration-300',
                    isActive ? 'text-primary-700 scale-105' : 'text-current',
                  )}
                >
                  {item.title}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
