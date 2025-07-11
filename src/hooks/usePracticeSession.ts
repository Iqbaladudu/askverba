'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { practiceAPI, vocabularyAPI } from '@/lib/api/payload'
import { Vocabulary } from '@/payload-types'

export interface PracticeWord {
  id: string
  vocabulary: Vocabulary
  isCorrect?: boolean
  timeSpent: number
  attempts: number
  userAnswer?: string
  correctAnswer: string
}

export interface PracticeSession {
  id?: string
  sessionType: 'flashcard' | 'multiple_choice' | 'fill_blanks' | 'listening' | 'mixed'
  words: PracticeWord[]
  currentIndex: number
  totalWords: number
  correctAnswers: number
  timeSpent: number
  startTime: Date
  isPaused: boolean
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  metadata?: any
}

export interface PracticeConfig {
  wordCount: number
  difficulty?: 'easy' | 'medium' | 'hard'
  status?: 'new' | 'learning' | 'mastered'
  includeDefinitions: boolean
  includeExamples: boolean
  shuffleWords: boolean
  timeLimit?: number
}

export function usePracticeSession() {
  const { customer } = useAuth()
  const [session, setSession] = useState<PracticeSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Start timer when session is active and not paused
  useEffect(() => {
    if (session && !session.isPaused) {
      timerRef.current = setInterval(() => {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                timeSpent: prev.timeSpent + 1,
              }
            : null,
        )
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [session?.isPaused])

  const startSession = async (
    sessionType: PracticeSession['sessionType'],
    config: PracticeConfig,
  ) => {
    if (!customer?.id) {
      setError('User not authenticated')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch vocabulary words for practice
      const response = await practiceAPI.getWordsForPractice(customer.id, {
        limit: config.wordCount,
        difficulty: config.difficulty,
        status: config.status,
      })

      if (!response.data?.docs || response.data.docs.length === 0) {
        throw new Error('No vocabulary words available for practice')
      }

      const words: PracticeWord[] = response.data.docs.map((vocab: Vocabulary) => ({
        id: vocab.id,
        vocabulary: vocab,
        timeSpent: 0,
        attempts: 0,
        correctAnswer: vocab.translation,
      }))

      // Shuffle words if requested
      if (config.shuffleWords) {
        for (let i = words.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[words[i], words[j]] = [words[j], words[i]]
        }
      }

      const newSession: PracticeSession = {
        sessionType,
        words,
        currentIndex: 0,
        totalWords: words.length,
        correctAnswers: 0,
        timeSpent: 0,
        startTime: new Date(),
        isPaused: false,
        difficulty:
          config.difficulty === 'easy'
            ? 'beginner'
            : config.difficulty === 'hard'
              ? 'advanced'
              : 'intermediate',
        metadata: {
          config,
          includeDefinitions: config.includeDefinitions,
          includeExamples: config.includeExamples,
          timeLimit: config.timeLimit,
        },
      }

      setSession(newSession)
    } catch (err) {
      console.error('Error starting practice session:', err)
      setError(err instanceof Error ? err.message : 'Failed to start practice session')
    } finally {
      setIsLoading(false)
    }
  }

  const submitAnswer = (userAnswer: string, isCorrect: boolean, timeSpent: number = 0): boolean => {
    if (!session) return false

    const updatedWords = [...session.words]
    const currentWord = updatedWords[session.currentIndex]

    if (currentWord) {
      currentWord.isCorrect = isCorrect
      currentWord.userAnswer = userAnswer
      currentWord.timeSpent += timeSpent
      currentWord.attempts += 1
    }

    const newCorrectAnswers = session.correctAnswers + (isCorrect ? 1 : 0)
    const newIndex = session.currentIndex + 1

    setSession({
      ...session,
      words: updatedWords,
      currentIndex: newIndex,
      correctAnswers: newCorrectAnswers,
    })

    // Check if session is complete
    if (newIndex >= session.totalWords) {
      // Session completed, will be handled by the component
      return true
    }

    return false
  }

  const pauseSession = () => {
    if (session) {
      setSession({
        ...session,
        isPaused: true,
      })
    }
  }

  const resumeSession = () => {
    if (session) {
      setSession({
        ...session,
        isPaused: false,
      })
    }
  }

  const endSession = async (results?: any) => {
    if (!session || !customer?.id) return

    try {
      // Calculate final statistics
      const score = Math.round((session.correctAnswers / session.totalWords) * 100)

      // Prepare session data for saving
      const sessionData = {
        customer: customer.id,
        sessionType: session.sessionType,
        words: session.words.map((word) => ({
          vocabulary: word.vocabulary.id,
          isCorrect: word.isCorrect || false,
          timeSpent: word.timeSpent,
          attempts: word.attempts,
          userAnswer: word.userAnswer || '',
          correctAnswer: word.correctAnswer,
        })),
        score,
        totalWords: session.totalWords,
        correctWords: session.correctAnswers,
        timeSpent: session.timeSpent,
        difficulty: session.difficulty,
        completedAt: new Date().toISOString(),
        metadata: session.metadata,
      }

      // Save session to database
      await practiceAPI.create(sessionData)

      // Update session with final results
      setSession({
        ...session,
        id: 'completed', // Temporary ID to indicate completion
        isPaused: true,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save practice session')
    }
  }

  const resetSession = () => {
    setSession(null)
    setError(null)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const getCurrentWord = () => {
    if (!session || session.currentIndex >= session.words.length) return null
    return session.words[session.currentIndex]
  }

  const getProgress = () => {
    if (!session) return 0
    return (session.currentIndex / session.totalWords) * 100
  }

  const getAccuracy = () => {
    if (!session || session.currentIndex === 0) return 0
    return Math.round((session.correctAnswers / session.currentIndex) * 100)
  }

  return {
    session,
    isLoading,
    error,
    startSession,
    submitAnswer,
    pauseSession,
    resumeSession,
    endSession,
    resetSession,
    getCurrentWord,
    getProgress,
    getAccuracy,
  }
}
