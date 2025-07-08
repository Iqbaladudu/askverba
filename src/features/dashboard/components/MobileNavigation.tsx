'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, BookOpen, BarChart3, User, Languages, History } from 'lucide-react'

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
    title: 'History',
    href: '/dashboard/history',
    icon: History,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'Profile',
    href: '/dashboard/settings',
    icon: User,
  },
]

export function MobileNavigation({ className }: MobileNavigationProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-neutral-200 px-2 py-1',
        'shadow-lg shadow-neutral-900/5 safe-area-pb',
        className,
      )}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-200 min-w-0 flex-1',
                'active:scale-95 touch-manipulation',
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-neutral-500 hover:text-neutral-700 active:bg-neutral-100',
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-transform duration-200',
                  isActive && 'text-primary-600 scale-110',
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium truncate transition-colors duration-200',
                  isActive && 'text-primary-600',
                )}
              >
                {item.title}
              </span>
              {isActive && <div className="w-1 h-1 bg-primary-600 rounded-full animate-pulse" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
