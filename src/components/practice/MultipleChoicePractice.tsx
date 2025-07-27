'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Volume2, CheckCircle, XCircle, Clock, Pause, Play, ArrowRight } from 'lucide-react'
import { PracticeSession } from '@/hooks/usePracticeSession'

interface MultipleChoicePracticeProps {
  session: PracticeSession
  onAnswer: (userAnswer: string, isCorrect: boolean, timeSpent: number) => boolean
  onComplete: (results: any) => void
  onPause: () => void
  onResume: () => void
}

export function MultipleChoicePractice({
  session,
  onAnswer,
  onComplete,
  onPause,
  onResume,
}: MultipleChoicePracticeProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [options, setOptions] = useState<string[]>([])
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  const currentWord = session.words[session.currentIndex]

  // Generate multiple choice options
  useEffect(() => {
    if (!currentWord) return

    const correctAnswer = currentWord.vocabulary.translation
    const allWords = session.words.map((w) => w.vocabulary.translation)

    // Get 3 random wrong answers
    const wrongAnswers = allWords
      .filter((translation) => translation !== correctAnswer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    // Combine and shuffle all options
    const allOptions = [correctAnswer, ...wrongAnswers]
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5)

    setOptions(shuffledOptions)
    setSelectedAnswer(null)
    setShowResult(false)
    setQuestionStartTime(Date.now())

    // Set time limit if configured
    if (session.metadata?.timeLimit) {
      setTimeLeft(30) // 30 seconds per question
    }
  }, [session.currentIndex, currentWord])

  // Timer for time limit
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || showResult || session.isPaused) return

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, showResult, session.isPaused])

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !showResult) {
      handleSubmit()
    }
  }, [timeLeft])

  const handleOptionSelect = (option: string) => {
    if (showResult) return
    setSelectedAnswer(option)
  }

  const handleSubmit = () => {
    if (showResult) return

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    const userAnswer = selectedAnswer || ''
    const isCorrect = userAnswer === currentWord.vocabulary.translation

    setShowResult(true)

    // Submit answer and check if session is complete
    const isComplete = onAnswer(userAnswer, isCorrect, timeSpent)

    if (isComplete) {
      // Calculate final results
      const results = {
        totalWords: session.totalWords,
        correctWords: session.correctAnswers + (isCorrect ? 1 : 0),
        timeSpent: session.timeSpent,
        accuracy: Math.round(
          ((session.correctAnswers + (isCorrect ? 1 : 0)) / session.totalWords) * 100,
        ),
      }
      setTimeout(() => onComplete(results), 2000)
    } else {
      // Move to next question after showing result
      setTimeout(() => {
        setShowResult(false)
      }, 2000)
    }
  }

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  const getOptionStyle = (option: string) => {
    if (!showResult) {
      return selectedAnswer === option
        ? 'border-primary-500 bg-primary-50'
        : 'border-neutral-200 hover:border-neutral-300'
    }

    // Show results
    if (option === currentWord.vocabulary.translation) {
      return 'border-green-500 bg-green-50 text-green-700'
    }

    if (option === selectedAnswer && option !== currentWord.vocabulary.translation) {
      return 'border-red-500 bg-red-50 text-red-700'
    }

    return 'border-neutral-200 text-neutral-400'
  }

  if (!currentWord) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-600">No more words to practice!</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={session.isPaused ? onResume : onPause}>
            {session.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {session.isPaused ? 'Resume' : 'Pause'}
          </Button>
        </div>

        {timeLeft !== null && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span className={timeLeft <= 10 ? 'text-red-600 font-medium' : 'text-neutral-600'}>
              {timeLeft}s
            </span>
          </div>
        )}
      </div>

      {/* Question Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              {currentWord.vocabulary.difficulty || 'medium'}
            </Badge>
            <CardTitle className="text-3xl font-bold text-neutral-800">
              {currentWord.vocabulary.word}
            </CardTitle>
            {currentWord.vocabulary.pronunciation && (
              <p className="text-lg text-neutral-600">/{currentWord.vocabulary.pronunciation}/</p>
            )}
          </div>

          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => speakWord(currentWord.vocabulary.word)}
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Listen
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center text-sm text-neutral-600 mb-6">
            Choose the correct translation:
          </div>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                disabled={showResult}
                className={`
                  w-full p-4 text-left rounded-lg border-2 transition-all duration-200
                  ${getOptionStyle(option)}
                  ${showResult ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {showResult && option === currentWord.vocabulary.translation && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {showResult &&
                    option === selectedAnswer &&
                    option !== currentWord.vocabulary.translation && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                </div>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          {!showResult && (
            <div className="flex justify-center pt-4">
              <Button onClick={handleSubmit} disabled={!selectedAnswer} size="lg" className="px-8">
                Submit Answer
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Result Feedback */}
          {showResult && (
            <div className="text-center pt-4">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  selectedAnswer === currentWord.vocabulary.translation
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {selectedAnswer === currentWord.vocabulary.translation ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Correct! Well done!
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    {selectedAnswer ? 'Incorrect. ' : 'Time&apos;s up! '}
                    The correct answer is &quot;{currentWord.vocabulary.translation}&quot;
                  </>
                )}
              </div>

              {/* Additional Info */}
              {session.metadata?.includeDefinitions && currentWord.vocabulary.definition && (
                <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-600">
                    <strong>Definition:</strong> {currentWord.vocabulary.definition}
                  </p>
                </div>
              )}

              {session.metadata?.includeExamples && currentWord.vocabulary.example && (
                <div className="mt-2 p-3 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-600">
                    <strong>Example:</strong> &quot;{currentWord.vocabulary.example}&quot;
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      {!showResult && (
        <div className="text-center text-sm text-neutral-500">
          <p>Select the correct translation and click Submit</p>
        </div>
      )}

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
