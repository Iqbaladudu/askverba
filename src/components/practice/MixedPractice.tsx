'use client'

import React, { useState, useEffect } from 'react'
import { PracticeSession } from '@/hooks/usePracticeSession'
import { FlashcardPractice } from './FlashcardPractice'
import { MultipleChoicePractice } from './MultipleChoicePractice'
import { FillBlanksPractice } from './FillBlanksPractice'
import { ListeningPractice } from './ListeningPractice'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, MessageSquare, PenTool, Volume2, Shuffle, CheckCircle } from 'lucide-react'

interface MixedPracticeProps {
  session: PracticeSession
  onAnswer: (userAnswer: string, isCorrect: boolean, timeSpent: number) => boolean
  onComplete: (results: any) => void
  onPause: () => void
  onResume: () => void
}

type PracticeMode = 'flashcard' | 'multiple_choice' | 'fill_blanks' | 'listening'

const practiceTypes: PracticeMode[] = ['flashcard', 'multiple_choice', 'fill_blanks', 'listening']

const practiceTypeConfig = {
  flashcard: {
    name: 'Flashcard',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  multiple_choice: {
    name: 'Multiple Choice',
    icon: MessageSquare,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  fill_blanks: {
    name: 'Fill Blanks',
    icon: PenTool,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  listening: {
    name: 'Listening',
    icon: Volume2,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
}

export function MixedPractice({
  session,
  onAnswer,
  onComplete,
  onPause,
  onResume,
}: MixedPracticeProps) {
  const [currentMode, setCurrentMode] = useState<PracticeMode>('flashcard')
  const [modeSequence, setModeSequence] = useState<PracticeMode[]>([])

  // Generate random sequence of practice modes
  useEffect(() => {
    const sequence: PracticeMode[] = []
    for (let i = 0; i < session.totalWords; i++) {
      const randomMode = practiceTypes[Math.floor(Math.random() * practiceTypes.length)]
      sequence.push(randomMode)
    }
    setModeSequence(sequence)
  }, [session.totalWords])

  // Update current mode based on current word index
  useEffect(() => {
    if (modeSequence.length > 0 && session.currentIndex < modeSequence.length) {
      setCurrentMode(modeSequence[session.currentIndex])
    }
  }, [session.currentIndex, modeSequence])

  const handleAnswer = (userAnswer: string, isCorrect: boolean, timeSpent: number) => {
    return onAnswer(userAnswer, isCorrect, timeSpent)
  }

  const config = practiceTypeConfig[currentMode]
  const IconComponent = config.icon

  const renderCurrentPractice = () => {
    const commonProps = {
      session,
      onAnswer: handleAnswer,
      onComplete,
      onPause,
      onResume,
    }

    switch (currentMode) {
      case 'flashcard':
        return <FlashcardPractice {...commonProps} />
      case 'multiple_choice':
        return <MultipleChoicePractice {...commonProps} />
      case 'fill_blanks':
        return <FillBlanksPractice {...commonProps} />
      case 'listening':
        return <ListeningPractice {...commonProps} />
      default:
        return <FlashcardPractice {...commonProps} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Mode Indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-sm border">
          <Shuffle className="h-4 w-4 text-neutral-500" />
          <span className="text-sm text-neutral-600">Mixed Review:</span>
          <Badge variant="secondary" className={`${config.bgColor} ${config.color} border-0`}>
            <IconComponent className="h-3 w-3 mr-1" />
            {config.name}
          </Badge>
        </div>
      </div>

      {/* Mode Sequence Preview */}
      <div className="flex justify-center">
        <div className="flex items-center gap-1 p-2 bg-white rounded-lg shadow-sm border max-w-full overflow-x-auto">
          {modeSequence.slice(0, 10).map((mode, index) => {
            const modeConfig = practiceTypeConfig[mode]
            const ModeIcon = modeConfig.icon
            const isActive = index === session.currentIndex
            const isCompleted = index < session.currentIndex

            return (
              <div
                key={index}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
                  ${
                    isActive
                      ? `${modeConfig.bgColor} ${modeConfig.color} ring-2 ring-primary-300`
                      : isCompleted
                        ? 'bg-green-100 text-green-600'
                        : 'bg-neutral-100 text-neutral-400'
                  }
                `}
                title={`${index + 1}. ${modeConfig.name}`}
              >
                <ModeIcon className="h-3 w-3" />
              </div>
            )
          })}
          {modeSequence.length > 10 && (
            <div className="flex items-center justify-center w-8 h-8 text-xs text-neutral-500">
              +{modeSequence.length - 10}
            </div>
          )}
        </div>
      </div>

      {/* Current Practice Component */}
      <div>{renderCurrentPractice()}</div>

      {/* Mode Distribution Info */}
      <div className="text-center text-xs text-neutral-500">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {practiceTypes.map((mode) => {
            const count = modeSequence.filter((m) => m === mode).length
            const config = practiceTypeConfig[mode]
            const IconComponent = config.icon

            return (
              <div key={mode} className="flex items-center gap-1">
                <IconComponent className={`h-3 w-3 ${config.color}`} />
                <span>{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Finish Quiz Button */}
      {session.currentIndex > 0 && (
        <div className="text-center pt-4">
          <Button
            onClick={() => {
              const results = {
                totalWords: session.totalWords,
                correctAnswers: session.correctAnswers,
                timeSpent: session.timeSpent,
                accuracy: Math.round((session.correctAnswers / session.totalWords) * 100),
              }
              onComplete(results)
            }}
            variant="outline"
            className="border-2 border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-400 px-6 py-3 font-semibold"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Finish Quiz & Save Progress
          </Button>
        </div>
      )}
    </div>
  )
}
