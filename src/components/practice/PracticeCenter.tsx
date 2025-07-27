'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  Award,
  Zap,
  BookOpen,
  MessageSquare,
  PenTool,
  Volume2,
  Shuffle,
  Info,
  ArrowRight,
} from 'lucide-react'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { usePracticeStats } from '@/hooks/usePracticeStats'
import { usePracticeProgress } from '@/hooks/usePracticeProgress'
import { useVocabulary } from '@/hooks/usePayloadData'
import { PracticeSetup } from './PracticeSetup'
import { FlashcardPractice } from './FlashcardPractice'
import { MultipleChoicePractice } from './MultipleChoicePractice'
import { FillBlanksPractice } from './FillBlanksPractice'
import { ListeningPractice } from './ListeningPractice'
import { MixedPractice } from './MixedPractice'
import { PracticeResults } from './PracticeResults'

type PracticeMode = 'overview' | 'setup' | 'practice' | 'results'
type PracticeType = 'flashcard' | 'multiple_choice' | 'fill_blanks' | 'listening' | 'mixed'

const practiceTypes = [
  {
    type: 'flashcard' as PracticeType,
    title: 'Flashcards',
    description: 'Classic card-based learning with spaced repetition',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    recommended: true,
  },
  {
    type: 'multiple_choice' as PracticeType,
    title: 'Multiple Choice',
    description: 'Choose the correct translation from options',
    icon: MessageSquare,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    type: 'fill_blanks' as PracticeType,
    title: 'Fill in the Blanks',
    description: 'Complete sentences with correct vocabulary',
    icon: PenTool,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    type: 'listening' as PracticeType,
    title: 'Listening Practice',
    description: 'Listen and type what you hear',
    icon: Volume2,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    type: 'mixed' as PracticeType,
    title: 'Mixed Practice',
    description: 'Random combination of all practice types',
    icon: Shuffle,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
]

export function PracticeCenter() {
  const [mode, setMode] = useState<PracticeMode>('overview')
  const [selectedType, setSelectedType] = useState<PracticeType>('flashcard')

  // Memoize options to prevent unnecessary re-renders
  const vocabularyOptions = useMemo(() => ({}), [])
  const practiceStatsFilters = useMemo(() => ({ timeRange: '30d' as const }), [])

  const { stats: vocabularyStats, loading: vocabularyLoading } = useVocabulary(vocabularyOptions)
  const {
    stats: practiceStats,
    loading: statsLoading,
    getPerformanceInsights,
    getRecommendations,
    refreshStats,
  } = usePracticeStats(practiceStatsFilters)
  const { progress, hasResumableProgress, resumeSession, clearProgress } = usePracticeProgress()

  const {
    session,
    loading,
    error,
    initializeSession,
    submitAnswer,
    pauseSession,
    resumeSession: resumePracticeSession,
    resetSession,
    getResults,
    saveSession,
  } = usePracticeSession()

  // Check for resumable session on mount
  useEffect(() => {
    // Only run once on mount
    if (hasResumableProgress()) {
      // Show resume option
    }
  }, []) // Empty dependency array to run only once

  const handlePracticeTypeSelect = (type: PracticeType) => {
    setSelectedType(type)
    setMode('setup')
  }

  const handleStartPractice = async (config: any) => {
    try {
      await initializeSession(selectedType, config)
      setMode('practice')
    } catch (err) {
      console.error('Failed to start practice:', err)
    }
  }

  const handleAnswer = (userAnswer: string, isCorrect: boolean, timeSpent: number) => {
    return submitAnswer(userAnswer, isCorrect, timeSpent)
  }

  const handlePracticeComplete = async (results: any) => {
    try {
      await saveSession()
      // Refresh stats after saving session
      if (refreshStats) {
        refreshStats()
      }
      setMode('results')
    } catch (err) {
      console.error('Failed to save session:', err)
      setMode('results') // Still show results even if save fails
    }
  }

  const handleRestart = () => {
    resetSession()
    setMode('setup')
  }

  const handleBackToOverview = () => {
    resetSession()
    setMode('overview')
  }

  const renderPracticeComponent = () => {
    if (!session) return null

    const commonProps = {
      session,
      onAnswer: handleAnswer,
      onComplete: handlePracticeComplete,
      onPause: pauseSession,
      onResume: resumePracticeSession,
    }

    switch (selectedType) {
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

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-transparent">
            Practice Center
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Master your vocabulary with engaging, interactive practice sessions designed to boost
            retention and confidence
          </p>
        </div>
      </div>

      {/* Resume Session Alert */}
      {hasResumableProgress() && (
        <div className="max-w-2xl mx-auto">
          <Alert className="border-primary-200 bg-gradient-to-r from-primary-50 to-primary-100/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <Info className="h-5 w-5 text-white" />
              </div>
              <AlertDescription className="flex items-center justify-between w-full">
                <div className="space-y-1">
                  <div className="font-medium text-primary-800">Continue Your Journey</div>
                  <div className="text-primary-700">
                    You have an unfinished practice session waiting for you
                  </div>
                </div>
                <div className="flex gap-3 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearProgress}
                    className="border-primary-300 text-primary-700 hover:bg-primary-50"
                  >
                    Start Fresh
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const savedProgress = resumeSession()
                      if (savedProgress) {
                        setMode('practice')
                      }
                    }}
                    className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
                  >
                    Resume Practice
                  </Button>
                </div>
              </AlertDescription>
            </div>
          </Alert>
        </div>
      )}

      {/* Quick Stats */}
      {practiceStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-yellow-50 to-yellow-100/50 group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-yellow-700 mb-1">
                {practiceStats.totalSessions}
              </div>
              <div className="text-sm font-medium text-yellow-600">Practice Sessions</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100/50 group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-700 mb-1">
                {practiceStats.averageScore}%
              </div>
              <div className="text-sm font-medium text-green-600">Average Score</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100/50 group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-orange-700 mb-1">
                {practiceStats.currentStreak}
              </div>
              <div className="text-sm font-medium text-orange-600">Day Streak</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50 group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {Math.round(practiceStats.totalTimeSpent / 60)}m
              </div>
              <div className="text-sm font-medium text-blue-600">Total Time</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Practice Types */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-neutral-800">Choose Your Practice Mode</h2>
          <p className="text-neutral-600">Select the learning style that works best for you</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceTypes.map((type) => {
            const IconComponent = type.icon
            return (
              <Card
                key={type.type}
                className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg bg-white group overflow-hidden relative"
                onClick={() => handlePracticeTypeSelect(type.type)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-neutral-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`p-4 rounded-2xl ${type.bgColor} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className={`h-7 w-7 ${type.color}`} />
                      </div>
                      {type.recommended && (
                        <Badge className="bg-primary-500 text-white text-xs font-medium px-3 py-1">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-neutral-800 group-hover:text-primary-600 transition-colors duration-300">
                        {type.title}
                      </h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">{type.description}</p>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center text-primary-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                        Start Practice
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Performance Insights */}
      {practiceStats && getPerformanceInsights() && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-neutral-50/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-neutral-800">Performance Insights</div>
                <div className="text-sm text-neutral-600 font-normal">
                  Personalized recommendations for you
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPerformanceInsights()?.map((insight, index) => (
                <Alert
                  key={index}
                  className={`border-0 shadow-sm ${
                    insight.type === 'success'
                      ? 'bg-gradient-to-r from-green-50 to-green-100/50 border-l-4 border-green-500'
                      : insight.type === 'warning'
                        ? 'bg-gradient-to-r from-yellow-50 to-yellow-100/50 border-l-4 border-yellow-500'
                        : 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-l-4 border-blue-500'
                  }`}
                >
                  <AlertDescription>
                    <div className="space-y-1">
                      <div
                        className={`font-semibold ${
                          insight.type === 'success'
                            ? 'text-green-800'
                            : insight.type === 'warning'
                              ? 'text-yellow-800'
                              : 'text-blue-800'
                        }`}
                      >
                        {insight.title}
                      </div>
                      <div
                        className={`text-sm leading-relaxed ${
                          insight.type === 'success'
                            ? 'text-green-700'
                            : insight.type === 'warning'
                              ? 'text-yellow-700'
                              : 'text-blue-700'
                        }`}
                      >
                        {insight.message}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // Only show loading on initial load, not on subsequent updates
  if ((vocabularyLoading && !vocabularyStats) || (statsLoading && !practiceStats)) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto">
              <BookOpen className="h-8 w-8 text-white animate-pulse" />
            </div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-primary-200 rounded-2xl animate-spin mx-auto"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-neutral-800">
              Preparing Your Practice Center
            </h3>
            <p className="text-neutral-600">Setting up your personalized learning experience...</p>
          </div>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <Info className="h-5 w-5 text-white" />
            </div>
            <AlertDescription className="space-y-1">
              <div className="font-semibold text-red-800">Unable to Load Practice Center</div>
              <div className="text-red-700">{error}</div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </AlertDescription>
          </div>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {mode === 'overview' && renderOverview()}

      {mode === 'setup' && (
        <div className="max-w-4xl mx-auto">
          <PracticeSetup
            practiceType={selectedType}
            onStart={handleStartPractice}
            isLoading={loading}
          />
        </div>
      )}

      {mode === 'practice' && <div className="max-w-4xl mx-auto">{renderPracticeComponent()}</div>}

      {mode === 'results' && session && (
        <div className="max-w-4xl mx-auto">
          <PracticeResults
            session={session}
            onRestart={handleRestart}
            onBackToVocabulary={handleBackToOverview}
          />
        </div>
      )}
    </div>
  )
}
