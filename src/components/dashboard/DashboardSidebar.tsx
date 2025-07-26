'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  BookOpen,
  BarChart3,
  History,
  Settings,
  Flame,
  Target,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useVocabulary, useUserProgress, usePractice } from '@/hooks/usePayloadData'

interface SidebarProps {
  className?: string
}

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Vocabulary',
    href: '/dashboard/vocabulary',
    icon: BookOpen,
    beta: true,
  },
  {
    title: 'History',
    href: '/dashboard/history',
    icon: History,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

// Helper function to format streak display
const formatStreak = (streak: number): string => {
  if (streak === 0) return '0 days'
  if (streak === 1) return '1 day'
  return `${streak} days`
}

export function DashboardSidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  // Fetch real data from hooks
  const { stats: vocabStats, loading: vocabLoading, error: vocabError } = useVocabulary()
  const { progress, loading: progressLoading, error: progressError } = useUserProgress()
  const { stats: practiceStats, loading: practiceLoading, error: practiceError } = usePractice()

  // Calculate real stats
  const isLoading = vocabLoading || progressLoading || practiceLoading
  const hasError = vocabError || progressError || practiceError
  const streak = practiceStats?.currentStreak || progress?.currentStreak || 0
  const totalWords = vocabStats?.totalWords || 0
  const accuracy = practiceStats?.averageScore || progress?.averageAccuracy || 0

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
      className={cn('w-64 border-r bg-white/50 backdrop-blur-sm border-neutral-200', className)}
    >
      <div className="p-6 space-y-6">
        {/* Quick Stats Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary-50 to-primary-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-primary-700">Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                <span className="ml-2 text-xs text-neutral-600">Loading...</span>
              </div>
            ) : hasError ? (
              <div className="text-center py-4">
                <TrendingUp className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-xs text-neutral-500">Unable to load stats</p>
                <p className="text-xs text-neutral-400">Please try again later</p>
              </div>
            ) : (
              <>
                {/* Streak */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Streak</span>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    {formatStreak(streak)}
                  </Badge>
                </div>

                {/* Vocabulary Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Words</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {totalWords}
                  </Badge>
                </div>

                {/* Accuracy */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Accuracy</span>
                    </div>
                    <span className="text-sm font-semibold text-green-700">
                      {Math.round(accuracy)}%
                    </span>
                  </div>
                  <Progress value={accuracy} className="h-2" />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <nav className="space-y-2">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Navigation
          </h3>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex items-center gap-2">
                  {item.title}
                  {item.beta && (
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 h-auto font-medium"
                    >
                      BETA
                    </Badge>
                  )}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
