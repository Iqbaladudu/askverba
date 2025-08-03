'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Volume2,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  Play,
  ArrowRight,
  VolumeX,
  RotateCcw,
  Eye,
} from 'lucide-react'
import { PracticeSession } from '@/utils/hooks/usePracticeSession'

interface ListeningPracticeProps {
  session: PracticeSession
  onAnswer: (userAnswer: string, isCorrect: boolean, timeSpent: number) => boolean
  onComplete: (results: any) => void
  onPause: () => void
  onResume: () => void
}

export function ListeningPractice({
  session,
  onAnswer,
  onComplete,
  onPause,
  onResume,
}: ListeningPracticeProps) {
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playCount, setPlayCount] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [showWord, setShowWord] = useState(false)

  const currentWord = session.words[session.currentIndex]
  const maxPlays = 3 // Maximum number of times user can replay audio

  useEffect(() => {
    if (!currentWord) return

    setUserAnswer('')
    setShowResult(false)
    setHasPlayedAudio(false)
    setIsPlaying(false)
    setPlayCount(0)
    setShowWord(false)
    setQuestionStartTime(Date.now())

    // Set time limit if configured
    if (session.metadata?.timeLimit) {
      setTimeLeft(60) // 60 seconds per question for listening
    }

    // Auto-play the word after a short delay
    setTimeout(() => {
      playAudio()
    }, 1000)
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

  const playAudio = () => {
    if (!currentWord || isPlaying || playCount >= maxPlays) return

    if ('speechSynthesis' in window) {
      setIsPlaying(true)
      const utterance = new SpeechSynthesisUtterance(currentWord.vocabulary.word)
      utterance.lang = 'en-US'
      utterance.rate = 0.8 // Slightly slower for better comprehension

      utterance.onend = () => {
        setIsPlaying(false)
        setHasPlayedAudio(true)
        setPlayCount((prev) => prev + 1)
      }

      utterance.onerror = () => {
        setIsPlaying(false)
      }

      speechSynthesis.speak(utterance)
    }
  }

  const handleSubmit = () => {
    if (showResult) return

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    const trimmedAnswer = userAnswer.trim().toLowerCase()
    const correctTranslation = currentWord.vocabulary.translation.toLowerCase()

    // Check if the answer is correct (accept the translation)
    const isCorrect = trimmedAnswer === correctTranslation

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
      setTimeout(() => onComplete(results), 3000)
    } else {
      // Move to next question after showing result
      setTimeout(() => {
        setShowResult(false)
      }, 3000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult && userAnswer.trim()) {
      handleSubmit()
    }
  }

  const isCorrectAnswer = () => {
    const trimmedAnswer = userAnswer.trim().toLowerCase()
    const correctTranslation = currentWord.vocabulary.translation.toLowerCase()
    return trimmedAnswer === correctTranslation
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

        <div className="flex items-center gap-4">
          {timeLeft !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={timeLeft <= 20 ? 'text-red-600 font-medium' : 'text-neutral-600'}>
                {timeLeft}s
              </span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWord(!showWord)}
            disabled={showResult}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showWord ? 'Hide' : 'Show'} Word
          </Button>
        </div>
      </div>

      {/* Question Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              {currentWord.vocabulary.difficulty || 'medium'}
            </Badge>
            <CardTitle className="text-lg font-medium text-neutral-600">
              Listen and translate
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Audio Player */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div
                className={`
                w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-300
                ${isPlaying ? 'border-primary-500 bg-primary-50 animate-pulse' : 'border-neutral-300 bg-neutral-50'}
              `}
              >
                {isPlaying ? (
                  <VolumeX className="h-12 w-12 text-primary-600" />
                ) : (
                  <Volume2 className="h-12 w-12 text-neutral-600" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={playAudio}
                disabled={isPlaying || playCount >= maxPlays}
                size="lg"
                variant={hasPlayedAudio ? 'outline' : 'default'}
              >
                {isPlaying ? (
                  <>
                    <VolumeX className="h-5 w-5 mr-2" />
                    Playing...
                  </>
                ) : (
                  <>
                    <Volume2 className="h-5 w-5 mr-2" />
                    {hasPlayedAudio ? 'Play Again' : 'Play Audio'}
                  </>
                )}
              </Button>

              <div className="text-xs text-neutral-500">
                {playCount > 0 && (
                  <span>
                    Played {playCount}/{maxPlays} times
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Show word if requested */}
          {showWord && !showResult && (
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{currentWord.vocabulary.word}</div>
              {currentWord.vocabulary.pronunciation && (
                <div className="text-sm text-blue-600 mt-1">
                  /{currentWord.vocabulary.pronunciation}/
                </div>
              )}
            </div>
          )}

          {/* Input */}
          {!showResult && (
            <div className="space-y-4">
              <div className="text-center text-sm text-neutral-600 mb-4">
                <p>What is the Indonesian translation?</p>
              </div>

              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type the translation here..."
                className="text-lg text-center"
                autoFocus
              />

              <div className="flex justify-center">
                <Button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                  size="lg"
                  className="px-8"
                >
                  Submit Answer
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Result Feedback */}
          {showResult && (
            <div className="text-center space-y-4">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  isCorrectAnswer() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {isCorrectAnswer() ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Correct! Well done!
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    {userAnswer.trim() ? 'Incorrect. ' : 'Time&apos;s up! '}
                    The correct translation is &quot;{currentWord.vocabulary.translation}&quot;
                  </>
                )}
              </div>

              {/* Show the word and details */}
              <div className="space-y-3">
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <div className="text-2xl font-bold text-neutral-800 mb-2">
                    {currentWord.vocabulary.word}
                  </div>
                  <div className="text-lg text-primary-600">
                    {currentWord.vocabulary.translation}
                  </div>
                  {currentWord.vocabulary.pronunciation && (
                    <div className="text-sm text-neutral-600 mt-1">
                      /{currentWord.vocabulary.pronunciation}/
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                {session.metadata?.includeDefinitions && currentWord.vocabulary.definition && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Definition:</strong> {currentWord.vocabulary.definition}
                    </p>
                  </div>
                )}

                {session.metadata?.includeExamples && currentWord.vocabulary.example && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Example:</strong> &quot;{currentWord.vocabulary.example}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Play correct pronunciation */}
              <Button
                variant="outline"
                onClick={() => {
                  if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(currentWord.vocabulary.word)
                    utterance.lang = 'en-US'
                    speechSynthesis.speak(utterance)
                  }
                }}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Hear Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      {!showResult && (
        <div className="text-center text-sm text-neutral-500 space-y-1">
          <p>Listen carefully to the pronunciation and type the Indonesian translation</p>
          <p>You can replay the audio up to {maxPlays} times</p>
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
