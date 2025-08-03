'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  UserPlus, 
  Clock, 
  BookOpen, 
  BarChart3, 
  Star,
  ArrowRight,
  Zap
} from 'lucide-react'
import Link from 'next/link'

interface GuestLimitationBannerProps {
  translationCount: number
  maxTranslations?: number
  className?: string
}

export function GuestLimitationBanner({ 
  translationCount, 
  maxTranslations = 30,
  className = '' 
}: GuestLimitationBannerProps) {
  const remainingTranslations = Math.max(0, maxTranslations - translationCount)
  const isNearLimit = remainingTranslations <= 5
  const isAtLimit = remainingTranslations === 0

  return (
    <Card className={`border-l-4 border-l-[#FF5B9E] bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-[#FF5B9E]" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Mode Guest
              </h3>
              <Badge variant="secondary" className="text-xs">
                Gratis
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>
                  {isAtLimit ? (
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      Limit harian tercapai (0/{maxTranslations})
                    </span>
                  ) : (
                    <span className={isNearLimit ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>
                      {remainingTranslations}/{maxTranslations} terjemahan tersisa hari ini
                    </span>
                  )}
                </span>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Fitur terbatas: Tidak menyimpan history, vocabulary, atau progress
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/register">
              <Button 
                size="sm" 
                className="bg-[#FF5B9E] hover:bg-[#E54A8C] text-white"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Daftar Gratis
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
            
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-xs">
                Sudah punya akun?
              </Button>
            </Link>
          </div>
        </div>

        {/* Benefits of registering */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dengan mendaftar, Anda mendapat:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span>Terjemahan unlimited</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-blue-500" />
              <span>History & vocabulary</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3 text-green-500" />
              <span>Analytics & progress</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-purple-500" />
              <span>Fitur practice</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mb-1">
            <span>Penggunaan hari ini</span>
            <span>{translationCount}/{maxTranslations}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isAtLimit 
                  ? 'bg-red-500' 
                  : isNearLimit 
                    ? 'bg-orange-500' 
                    : 'bg-[#FF5B9E]'
              }`}
              style={{ 
                width: `${Math.min(100, (translationCount / maxTranslations) * 100)}%` 
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for smaller spaces
export function GuestLimitationBadge({ 
  translationCount, 
  maxTranslations = 30 
}: Pick<GuestLimitationBannerProps, 'translationCount' | 'maxTranslations'>) {
  const remainingTranslations = Math.max(0, maxTranslations - translationCount)
  const isNearLimit = remainingTranslations <= 5
  const isAtLimit = remainingTranslations === 0

  return (
    <div className="flex items-center gap-2 text-xs">
      <Badge 
        variant={isAtLimit ? 'destructive' : isNearLimit ? 'secondary' : 'outline'}
        className="flex items-center gap-1"
      >
        <Clock className="h-3 w-3" />
        {remainingTranslations}/{maxTranslations} tersisa
      </Badge>
      
      <Link href="/register">
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-[#FF5B9E] hover:text-[#E54A8C]">
          Upgrade
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </Link>
    </div>
  )
}
