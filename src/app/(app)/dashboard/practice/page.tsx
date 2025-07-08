'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Settings,
  BookOpen,
  MessageSquare,
  PenTool,
  Volume2,
  Shuffle,
  Clock,
  Target,
  TrendingUp,
} from 'lucide-react'
import { FlashcardPractice } from '@/components/practice/FlashcardPractice'
import { MultipleChoicePractice } from '@/components/practice/MultipleChoicePractice'
import { FillBlanksPractice } from '@/components/practice/FillBlanksPractice'
import { ListeningPractice } from '@/components/practice/ListeningPractice'
import { MixedPractice } from '@/components/practice/MixedPractice'
import { PracticeSetup } from '@/components/practice/PracticeSetup'
import { PracticeResults } from '@/components/practice/PracticeResults'
import { usePracticeSession } from '@/hooks/usePracticeSession'

type PracticeType = 'flashcard' | 'multiple_choice' | 'fill_blanks' | 'listening' | 'mixed'

const practiceTypeConfig = {
  flashcard: {
    name: 'Flashcards',
    description: 'Classic card-based learning',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  multiple_choice: {
    name: 'Multiple Choice',
    description: 'Quiz-style questions',
    icon: MessageSquare,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  fill_blanks: {
    name: 'Fill in Blanks',
    description: 'Complete the sentences',
    icon: PenTool,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  listening: {
    name: 'Listening',
    description: 'Audio pronunciation practice',
    icon: Volume2,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  mixed: {
    name: 'Mixed Review',
    description: 'All practice types combined',
    icon: Shuffle,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
}

export default function PracticePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const practiceType = (searchParams.get('type') as PracticeType) || 'flashcard'

  const [sessionState, setSessionState] = useState<'setup' | 'practicing' | 'results'>('setup')
  const [sessionConfig, setSessionConfig] = useState<any>(null)

  const {
    session,
    isLoading,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    submitAnswer,
    resetSession,
  } = usePracticeSession()

  const config = practiceTypeConfig[practiceType]
  const IconComponent = config.icon

  const handleStartPractice = async (config: any) => {
    setSessionConfig(config)

    try {
      await startSession(practiceType, config)
      setSessionState('practicing')
    } catch (error) {
      console.error('Failed to start practice session:', error)
      // Stay in setup state if session creation fails
    }
  }

  const handleEndPractice = (results: any) => {
    endSession(results)
    setSessionState('results')
  }

  const handleBackToVocabulary = () => {
    router.push('/dashboard/vocabulary')
  }

  const handleRestartPractice = () => {
    resetSession()
    setSessionState('setup')
  }

  const renderPracticeComponent = () => {
    if (!session || sessionState !== 'practicing') {
      return null
    }

    const commonProps = {
      session,
      onAnswer: submitAnswer,
      onComplete: handleEndPractice,
      onPause: pauseSession,
      onResume: resumeSession,
    }

    switch (practiceType) {
      case 'flashcard':
        return <FlashcardPractice {...commonProps} />
      case 'multiple_choice':
        return <MultipleChoicePractice {...commonProps} />
      case 'fill_blanks':
        return <FillBlanksPractice {...commonProps} />
      case 'listening':
        return <ListeningPractice {...commonProps} />
      case 'mixed':
        return <MixedPractice {...commonProps} />
      default:
        return <FlashcardPractice {...commonProps} />
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToVocabulary}
                className="text-neutral-600 hover:text-neutral-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Vocabulary
              </Button>

              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${config.color}`} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-neutral-800">{config.name}</h1>
                  <p className="text-sm text-neutral-600">{config.description}</p>
                </div>
              </div>
            </div>

            {session && sessionState === 'practicing' && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Clock className="h-4 w-4" />
                  {Math.floor(session.timeSpent / 60)}:
                  {(session.timeSpent % 60).toString().padStart(2, '0')}
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Target className="h-4 w-4" />
                  {session.currentIndex + 1} / {session.totalWords}
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <TrendingUp className="h-4 w-4" />
                  {Math.round((session.correctAnswers / Math.max(session.currentIndex, 1)) * 100)}%
                </div>
              </div>
            )}
          </div>

          {session && sessionState === 'practicing' && (
            <div className="mt-4">
              <Progress value={(session.currentIndex / session.totalWords) * 100} className="h-2" />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {sessionState === 'setup' && (
          <PracticeSetup
            practiceType={practiceType}
            onStart={handleStartPractice}
            isLoading={isLoading}
          />
        )}

        {sessionState === 'practicing' && renderPracticeComponent()}

        {sessionState === 'results' && session && (
          <PracticeResults
            session={session}
            onRestart={handleRestartPractice}
            onBackToVocabulary={handleBackToVocabulary}
          />
        )}
      </div>
    </div>
  )
}
