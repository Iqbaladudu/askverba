'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Languages, BookOpen, Brain, History } from 'lucide-react'

interface MobileNavigationProps {
  className?: string
}

const mobileNavItems = [
  {
    title: 'Translate',
    href: '/dashboard/translate',
    icon: Languages,
    disabled: false,
  },
  {
    title: 'Vocabulary',
    href: '/dashboard/vocabulary',
    icon: BookOpen,
    disabled: false,
  },
  {
    title: 'Practice',
    href: '/dashboard/practice',
    icon: Brain,
    disabled: true,
  },
  {
    title: 'History',
    href: '/dashboard/history',
    icon: History,
    disabled: false,
  },
]

export function MobileNavigation({ className }: MobileNavigationProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        // Compact floating pill bar
        'fixed left-1/2 -translate-x-1/2 bottom-3 z-50 w-[min(100%-16px,720px)]',
        'rounded-2xl border border-neutral-200/60 bg-white/90 supports-[backdrop-filter]:backdrop-blur-md',
        'shadow-lg shadow-neutral-900/5 ring-1 ring-black/5 safe-area-pb px-2.5 py-1.5',
        'dark:bg-neutral-950/80 dark:border-neutral-800/60',
        className,
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-between gap-1 max-w-xl mx-auto">
        {mobileNavItems.map((item) => {
          const isActive = pathname?.startsWith(item.href)
          const isDisabled = item.disabled

          return isDisabled ? (
            <div
              key={item.href}
              aria-disabled="true"
              className={cn(
                'group flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl min-h-[44px] min-w-0 flex-1 relative',
                'text-neutral-400 cursor-not-allowed opacity-50 select-none pointer-events-none',
              )}
            >
              {/* Active indicator (never shown for disabled) */}
              {/* ...no indicator... */}

              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <div
                  className={cn(
                    'w-6 h-6 rounded-lg flex items-center justify-center transition-[transform,background-color,color] duration-200 ease-out',
                    'bg-neutral-100 text-neutral-400',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </div>

                <span className="text-[10px] leading-3 font-medium truncate">{item.title}</span>
              </div>
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl min-h-[44px] min-w-0 flex-1 relative',
                'active:scale-[0.98] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
                isActive ? 'text-primary-600' : 'text-neutral-700 hover:text-neutral-900',
              )}
            >
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <div
                  className={cn(
                    'w-6 h-6 rounded-lg flex items-center justify-center transition-[transform,background-color,color] duration-200 ease-out',
                    isActive
                      ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/20'
                      : 'bg-transparent',
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-4 w-4 transition-colors duration-200',
                      isActive ? 'text-white' : 'text-current',
                    )}
                  />
                </div>

                <span
                  className={cn(
                    'text-[10px] leading-3 font-medium truncate tracking-wide',
                    isActive ? 'text-primary-700' : 'text-current',
                  )}
                >
                  {item.title}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
