'use client'

import { useState, useEffect, useCallback } from 'react'
import { Vocabulary } from '@/payload-types'
import { useVocabularyCache } from '@/features/vocabulary/hooks'

export interface PracticeWord {
  vocabulary: Vocabulary
  correctAnswer: string
  attempts: number
  isCorrect?: boolean
  timeSpent: number
  userAnswer?: string
  difficulty?: 'again' | 'hard' | 'good' | 'easy' // Anki-style difficulty
  nextReview?: Date
}

export interface PracticeSession {
  words: PracticeWord[]
  currentIndex: number
  totalWords: number
  correctAnswers: number
  timeSpent: number
  startTime: number
  isPaused: boolean
  isComplete: boolean
  sessionType: 'flashcard' | 'multiple_choice' | 'fill_blanks' | 'listening' | 'mixed'
  metadata?: {
    includeDefinitions?: boolean
    includeExamples?: boolean
    timeLimit?: number
    shuffleWords?: boolean
  }
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

export interface PracticeResults {
  totalWords: number
  correctWords: number
  timeSpent: number
  accuracy: number
  sessionType: string
  wordsReviewed: Array<{
    word: string
    translation: string
    isCorrect: boolean
    difficulty: string
    timeSpent: number
  }>
}

export function usePracticeSession() {
  const [session, setSession] = useState<PracticeSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getVocabulary, preloadVocabulary } = useVocabularyCache()

  // Initialize practice session
  const initializeSession = useCallback(
    async (sessionType: PracticeSession['sessionType'], config: PracticeConfig) => {
      setLoading(true)
      setError(null)

      try {
        // Use the new practice start API
        const response = await fetch('/api/practice/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionType,
            wordCount: config.wordCount,
            difficulty: config.difficulty === 'all' ? undefined : config.difficulty,
            status: config.status === 'all' ? undefined : config.status,
            includeDefinitions: config.includeDefinitions,
            includeExamples: config.includeExamples,
            shuffleWords: config.shuffleWords,
            timeLimit: config.timeLimit || undefined,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to start practice session')
        }

        const data = await response.json()
        const vocabularyWords: Vocabulary[] = data.words || []

        if (vocabularyWords.length === 0) {
          throw new Error('No vocabulary words found for practice')
        }

        // Convert to practice words
        const practiceWords: PracticeWord[] = vocabularyWords.map((vocab) => ({
          vocabulary: vocab,
          correctAnswer: vocab.translation,
          attempts: 0,
          timeSpent: 0,
        }))

        // Create session
        const newSession: PracticeSession = {
          words: practiceWords,
          currentIndex: 0,
          totalWords: practiceWords.length,
          correctAnswers: 0,
          timeSpent: 0,
          startTime: Date.now(),
          isPaused: false,
          isComplete: false,
          sessionType,
          metadata: data.config,
        }

        setSession(newSession)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize practice session')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // Submit answer for current word
  const submitAnswer = useCallback(
    (
      userAnswer: string,
      isCorrect: boolean,
      timeSpent: number,
      difficulty?: 'again' | 'hard' | 'good' | 'easy',
    ): boolean => {
      if (!session || session.isComplete) return false

      setSession((prevSession) => {
        if (!prevSession) return null

        const updatedWords = [...prevSession.words]
        const currentWord = updatedWords[prevSession.currentIndex]

        // Update current word
        currentWord.attempts += 1
        currentWord.isCorrect = isCorrect
        currentWord.timeSpent += timeSpent
        currentWord.userAnswer = userAnswer
        currentWord.difficulty = difficulty

        // Calculate next review date for spaced repetition (Anki-style)
        if (difficulty) {
          const now = new Date()
          let daysToAdd = 1

          switch (difficulty) {
            case 'again':
              daysToAdd = 1
              break
            case 'hard':
              daysToAdd = 2
              break
            case 'good':
              daysToAdd = 4
              break
            case 'easy':
              daysToAdd = 7
              break
          }

          currentWord.nextReview = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
        }

        const newCorrectAnswers = prevSession.correctAnswers + (isCorrect ? 1 : 0)
        const newTimeSpent = prevSession.timeSpent + timeSpent
        const newCurrentIndex = prevSession.currentIndex + 1
        const isComplete = newCurrentIndex >= prevSession.totalWords

        return {
          ...prevSession,
          words: updatedWords,
          currentIndex: newCurrentIndex,
          correctAnswers: newCorrectAnswers,
          timeSpent: newTimeSpent,
          isComplete,
        }
      })

      // Return true if session is complete
      return session.currentIndex + 1 >= session.totalWords
    },
    [session],
  )

  // Pause/Resume session
  const pauseSession = useCallback(() => {
    setSession((prev) => (prev ? { ...prev, isPaused: true } : null))
  }, [])

  const resumeSession = useCallback(() => {
    setSession((prev) => (prev ? { ...prev, isPaused: false } : null))
  }, [])

  // Reset session
  const resetSession = useCallback(() => {
    setSession(null)
    setError(null)
  }, [])

  // Get practice results
  const getResults = useCallback((): PracticeResults | null => {
    if (!session) return null

    return {
      totalWords: session.totalWords,
      correctWords: session.correctAnswers,
      timeSpent: session.timeSpent,
      accuracy: Math.round((session.correctAnswers / session.totalWords) * 100),
      sessionType: session.sessionType,
      wordsReviewed: session.words.map((word) => ({
        word: word.vocabulary.word,
        translation: word.vocabulary.translation,
        isCorrect: word.isCorrect || false,
        difficulty: word.difficulty || 'good',
        timeSpent: word.timeSpent,
      })),
    }
  }, [session])

  // Save session to database
  const saveSession = useCallback(async () => {
    if (!session) return

    try {
      // Mark session as complete if not already
      const updatedSession = { ...session, isComplete: true }

      // Only include words that have been attempted (attempts > 0)
      const attemptedWords = updatedSession.words.filter((word) => word.attempts > 0)

      if (attemptedWords.length === 0) {
        console.warn('No words attempted, skipping session save')
        return
      }

      const sessionData = {
        sessionType: updatedSession.sessionType,
        words: attemptedWords.map((word) => ({
          vocabularyId: word.vocabulary.id,
          isCorrect: word.isCorrect || false,
          timeSpent: word.timeSpent,
          attempts: word.attempts,
        })),
        score: Math.round((updatedSession.correctAnswers / updatedSession.totalWords) * 100),
        timeSpent: updatedSession.timeSpent,
        difficulty: 'medium' as const, // Default difficulty
        metadata: {
          totalQuestions: updatedSession.totalWords,
          correctAnswers: updatedSession.correctAnswers,
          averageTimePerQuestion: Math.round(updatedSession.timeSpent / updatedSession.totalWords),
          streakCount: 0, // Calculate streak if needed
        },
      }

      console.log('Saving practice session:', sessionData)

      const response = await fetch('/api/practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to save practice session:', errorData)
        throw new Error(errorData.error || 'Failed to save practice session')
      }

      const result = await response.json()
      console.log('Practice session saved successfully:', result)

      // Update session state to mark as complete
      setSession(updatedSession)

      return result
    } catch (err) {
      console.error('Error saving practice session:', err)
      throw err
    }
  }, [session])

  return {
    session,
    loading,
    error,
    initializeSession,
    submitAnswer,
    pauseSession,
    resumeSession,
    resetSession,
    getResults,
    saveSession,
  }
}
