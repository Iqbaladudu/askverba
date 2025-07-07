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
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

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
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
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

export function DashboardSidebar({ className }: SidebarProps) {
  const pathname = usePathname()

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
            {/* Streak */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Streak</span>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                7 days
              </Badge>
            </div>

            {/* Vocabulary Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Words</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                142
              </Badge>
            </div>

            {/* Accuracy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Accuracy</span>
                </div>
                <span className="text-sm font-semibold text-green-700">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
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
                {item.title}
              </Link>
            )
          })}
        </nav>

        {/* Recent Vocabulary */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-700">Recent Words</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { word: 'beautiful', translation: 'indah' },
              { word: 'challenge', translation: 'tantangan' },
              { word: 'wonderful', translation: 'menakjubkan' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-700">{item.word}</span>
                <span className="text-neutral-500">{item.translation}</span>
              </div>
            ))}
            <Link
              href="/dashboard/vocabulary"
              className="block text-center text-xs text-primary-600 hover:text-primary-700 font-medium mt-3 pt-3 border-t border-neutral-100"
            >
              View All Words
            </Link>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
