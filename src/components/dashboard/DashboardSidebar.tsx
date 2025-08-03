'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, BookOpen, History, Brain } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SidebarProps {
  className?: string
}

const navigationItems = [
  {
    title: 'Translate',
    href: '/dashboard',
    icon: Home,
    description: 'Quick translations',
    disabled: false,
  },
  {
    title: 'Vocabulary',
    href: '/dashboard/vocabulary',
    icon: BookOpen,
    description: 'Saved words',
    disabled: false,
  },
  {
    title: 'Practice',
    href: '/dashboard/practice',
    icon: Brain,
    badge: 'Coming Soon',
    description: 'Coming Soon',
    disabled: true,
  },
  {
    title: 'History',
    href: '/dashboard/history',
    icon: History,
    description: 'Past translations',
    disabled: false,
  },
]

export function DashboardSidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  // Get recent vocabulary items (last 3)
  // const recentWords = (vocabulary || [])
  //   .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  //   .slice(0, 3)
  //   .map((word) => ({
  //     word: word.word,
  //     translation: word.translation,
  //   }))

  return (
    <aside
      className={cn(
        'w-72 border-r bg-white/80 backdrop-blur-md border-neutral-200/50 shadow-sm',
        className,
      )}
    >
      <div className="p-6 h-full">
        {/* Navigation */}
        <nav className="space-y-2">
          <div className="mb-6">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">
              Navigation
            </h3>
          </div>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const isDisabled = item.disabled

            return (
              <div key={item.href}>
                {isDisabled ? (
                  <div
                    key={item.href}
                    className={cn(
                      'group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden',
                      'text-neutral-400 cursor-not-allowed opacity-60',
                    )}
                  >
                    {/* Icon with enhanced styling */}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                        'bg-neutral-50 text-neutral-400',
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{item.title}</span>
                        {item.badge && (
                          <Badge
                            className={cn(
                              'text-xs font-medium px-2 py-0.5',
                              'bg-neutral-100 text-neutral-500 border-0',
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p
                        className={cn(
                          'text-xs mt-1 line-clamp-1 transition-colors duration-300',
                          'text-neutral-400',
                        )}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden',
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 scale-[1.02]'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-gradient-to-r hover:from-neutral-100 hover:to-neutral-50 hover:scale-[1.01]',
                    )}
                  >
                    {/* Icon with enhanced styling */}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-neutral-100 text-neutral-600 group-hover:bg-white group-hover:shadow-sm',
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{item.title}</span>
                        {item.badge && (
                          <Badge
                            className={cn(
                              'text-xs font-medium px-2 py-0.5',
                              isActive
                                ? 'bg-white/20 text-white border-white/30'
                                : 'bg-primary-100 text-primary-700 border-0',
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p
                        className={cn(
                          'text-xs mt-1 line-clamp-1 transition-colors duration-300',
                          isActive
                            ? 'text-primary-100'
                            : 'text-neutral-500 group-hover:text-neutral-600',
                        )}
                      >
                        {item.description}
                      </p>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
                    )}
                  </Link>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
