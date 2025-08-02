'use client'

import { useState, useEffect, useCallback } from 'react'
import { PracticeSession, PracticeWord } from './usePracticeSession'

export interface PracticeProgress {
  sessionId?: string
  currentIndex: number
  totalWords: number
  correctAnswers: number
  timeSpent: number
  startTime: number
  lastSaved: number
  isComplete: boolean
  sessionType: string
  words: Array<{
    vocabularyId: string
    isCorrect?: boolean
    timeSpent: number
    attempts: number
    userAnswer?: string
  }>
}

export interface ProgressUpdate {
  wordIndex: number
  isCorrect: boolean
  timeSpent: number
  userAnswer: string
  attempts: number
}

export function usePracticeProgress() {
  const [progress, setProgress] = useState<PracticeProgress | null>(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastSaveTime, setLastSaveTime] = useState<number>(0)

  // Auto-save interval (every 30 seconds)
  const AUTO_SAVE_INTERVAL = 30000

  // Load saved progress from localStorage
  const loadSavedProgress = useCallback(() => {
    try {
      const saved = localStorage.getItem('practice_progress')
      if (saved) {
        const parsedProgress = JSON.parse(saved)
        // Check if progress is recent (within 24 hours)
        const isRecent = Date.now() - parsedProgress.lastSaved < 24 * 60 * 60 * 1000
        if (isRecent && !parsedProgress.isComplete) {
          setProgress(parsedProgress)
          return parsedProgress
        } else {
          // Clear old progress
          localStorage.removeItem('practice_progress')
        }
      }
    } catch (error) {
      console.error('Error loading saved progress:', error)
      localStorage.removeItem('practice_progress')
    }
    return null
  }, [])

  // Save progress to localStorage
  const saveProgressLocally = useCallback((progressData: PracticeProgress) => {
    try {
      const dataToSave = {
        ...progressData,
        lastSaved: Date.now(),
      }
      localStorage.setItem('practice_progress', JSON.stringify(dataToSave))
      setLastSaveTime(Date.now())
    } catch (error) {
      console.error('Error saving progress locally:', error)
    }
  }, [])

  // Initialize progress from session
  const initializeProgress = useCallback(
    (session: PracticeSession) => {
      const newProgress: PracticeProgress = {
        currentIndex: session.currentIndex,
        totalWords: session.totalWords,
        correctAnswers: session.correctAnswers,
        timeSpent: session.timeSpent,
        startTime: session.startTime,
        lastSaved: Date.now(),
        isComplete: session.isComplete,
        sessionType: session.sessionType,
        words: session.words.map((word) => ({
          vocabularyId: word.vocabulary.id,
          isCorrect: word.isCorrect,
          timeSpent: word.timeSpent,
          attempts: word.attempts,
          userAnswer: word.userAnswer,
        })),
      }

      setProgress(newProgress)
      if (autoSaveEnabled) {
        saveProgressLocally(newProgress)
      }
    },
    [autoSaveEnabled, saveProgressLocally],
  )

  // Update progress with new answer
  const updateProgress = useCallback(
    (update: ProgressUpdate) => {
      setProgress((prev) => {
        if (!prev) return null

        const updatedWords = [...prev.words]
        const wordToUpdate = updatedWords[update.wordIndex]

        if (wordToUpdate) {
          wordToUpdate.isCorrect = update.isCorrect
          wordToUpdate.timeSpent += update.timeSpent
          wordToUpdate.attempts = update.attempts
          wordToUpdate.userAnswer = update.userAnswer
        }

        const newProgress = {
          ...prev,
          currentIndex: update.wordIndex + 1,
          correctAnswers: prev.correctAnswers + (update.isCorrect ? 1 : 0),
          timeSpent: prev.timeSpent + update.timeSpent,
          words: updatedWords,
          isComplete: update.wordIndex + 1 >= prev.totalWords,
          lastSaved: Date.now(),
        }

        // Auto-save if enabled
        if (autoSaveEnabled) {
          saveProgressLocally(newProgress)
        }

        return newProgress
      })
    },
    [autoSaveEnabled, saveProgressLocally],
  )

  // Clear progress (when session is completed or abandoned)
  const clearProgress = useCallback(() => {
    setProgress(null)
    localStorage.removeItem('practice_progress')
    setLastSaveTime(0)
  }, [])

  // Resume session from saved progress
  const resumeSession = useCallback(() => {
    return loadSavedProgress()
  }, [loadSavedProgress])

  // Check if there's resumable progress
  const hasResumableProgress = useCallback(() => {
    try {
      const saved = localStorage.getItem('practice_progress')
      if (saved) {
        const parsedProgress = JSON.parse(saved)
        // Check if progress is recent (within 24 hours) and not complete
        const isRecent = Date.now() - parsedProgress.lastSaved < 24 * 60 * 60 * 1000
        return isRecent && !parsedProgress.isComplete
      }
    } catch (error) {
      console.error('Error checking resumable progress:', error)
    }
    return false
  }, [])

  // Manual save
  const saveProgress = useCallback(() => {
    if (progress) {
      saveProgressLocally(progress)
    }
  }, [progress, saveProgressLocally])

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled || !progress || progress.isComplete) return

    const interval = setInterval(() => {
      if (Date.now() - lastSaveTime > AUTO_SAVE_INTERVAL) {
        saveProgressLocally(progress)
      }
    }, AUTO_SAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [autoSaveEnabled, progress, lastSaveTime, saveProgressLocally])

  // Calculate progress percentage
  const getProgressPercentage = useCallback(() => {
    if (!progress) return 0
    return Math.round((progress.currentIndex / progress.totalWords) * 100)
  }, [progress])

  // Get time since last save
  const getTimeSinceLastSave = useCallback(() => {
    if (!progress) return 0
    return Math.floor((Date.now() - progress.lastSaved) / 1000)
  }, [progress])

  // Update vocabulary status based on performance
  const updateVocabularyStatus = useCallback(
    async (
      vocabularyId: string,
      performance: {
        isCorrect: boolean
        attempts: number
        timeSpent: number
      },
    ) => {
      try {
        const response = await fetch(`/api/custom/vocabulary/${vocabularyId}/progress`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isCorrect: performance.isCorrect,
            attempts: performance.attempts,
            timeSpent: performance.timeSpent,
            practiceDate: new Date().toISOString(),
          }),
        })

        if (!response.ok) {
          console.error('Failed to update vocabulary status')
        }
      } catch (error) {
        console.error('Error updating vocabulary status:', error)
      }
    },
    [],
  )

  return {
    progress,
    initializeProgress,
    updateProgress,
    clearProgress,
    resumeSession,
    hasResumableProgress,
    saveProgress,
    getProgressPercentage,
    getTimeSinceLastSave,
    updateVocabularyStatus,
    autoSaveEnabled,
    setAutoSaveEnabled,
    lastSaveTime,
  }
}
