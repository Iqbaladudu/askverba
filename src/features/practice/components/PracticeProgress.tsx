'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Target } from 'lucide-react'
import { PracticeSession } from '@/features/practice/hooks/usePracticeSession'

interface PracticeProgressProps {
  session: PracticeSession
  onComplete: (results: any) => void
  showFinishButton?: boolean
}

export function PracticeProgress({ 
  session, 
  onComplete, 
  showFinishButton = true 
}: PracticeProgressProps) {
  const progressPercentage = ((session.currentIndex + 1) / session.totalWords) * 100
  const accuracy = session.currentIndex > 0 ? Math.round((session.correctAnswers / session.currentIndex) * 100) : 0
  const timeSpentMinutes = Math.floor(session.timeSpent / 60)
  const timeSpentSeconds = session.timeSpent % 60

  const handleFinishQuiz = () => {
    const results = {
      totalWords: session.totalWords,
      correctAnswers: session.correctAnswers,
      timeSpent: session.timeSpent,
      accuracy: Math.round((session.correctAnswers / session.totalWords) * 100),
    }
    onComplete(results)
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Badge className="bg-primary-100 text-primary-700 px-4 py-2 text-sm font-semibold">
            {session.sessionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Practice
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
            {session.currentIndex + 1} of {session.totalWords}
          </Badge>
          {session.currentIndex > 0 && (
            <Badge className="bg-green-100 text-green-700 px-4 py-2 text-sm font-medium">
              <Target className="h-3 w-3 mr-1" />
              {accuracy}% accuracy
            </Badge>
          )}
          <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium">
            <Clock className="h-3 w-3 mr-1" />
            {timeSpentMinutes}:{timeSpentSeconds.toString().padStart(2, '0')}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-neutral-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="text-sm text-neutral-600">
          Progress: {Math.round(progressPercentage)}% complete
        </div>
      </div>

      {/* Finish Quiz Button */}
      {showFinishButton && session.currentIndex > 0 && (
        <div className="text-center">
          <Button
            onClick={handleFinishQuiz}
            variant="outline"
            className="border-2 border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-400 px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Finish Quiz & Save Progress
          </Button>
          <div className="text-xs text-neutral-500 mt-2">
            You can finish anytime to save your progress
          </div>
        </div>
      )}
    </div>
  )
}
