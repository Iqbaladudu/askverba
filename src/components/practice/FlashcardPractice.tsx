'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  RotateCcw,
  Volume2,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Pause,
  Play,
} from 'lucide-react'
import { PracticeSession, PracticeWord } from '@/hooks/usePracticeSession'

interface FlashcardPracticeProps {
  session: PracticeSession
  onAnswer: (userAnswer: string, isCorrect: boolean, timeSpent: number) => boolean
  onComplete: (results: any) => void
  onPause: () => void
  onResume: () => void
}

export function FlashcardPractice({
  session,
  onAnswer,
  onComplete,
  onPause,
  onResume,
}: FlashcardPracticeProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [cardStartTime, setCardStartTime] = useState(Date.now())
  const [hasAnswered, setHasAnswered] = useState(false)

  const currentWord = session.words[session.currentIndex]

  useEffect(() => {
    // Reset card state when moving to next word
    setIsFlipped(false)
    setShowAnswer(false)
    setHasAnswered(false)
    setCardStartTime(Date.now())
  }, [session.currentIndex])

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    if (!showAnswer) {
      setShowAnswer(true)
    }
  }

  const handleAnswer = (isCorrect: boolean) => {
    if (hasAnswered) return

    const timeSpent = Math.floor((Date.now() - cardStartTime) / 1000)
    setHasAnswered(true)

    // Submit answer and check if session is complete
    const isComplete = onAnswer(
      isCorrect ? currentWord.correctAnswer : 'incorrect',
      isCorrect,
      timeSpent,
    )

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
      onComplete(results)
    } else {
      // Move to next card after a short delay
      setTimeout(() => {
        setHasAnswered(false)
      }, 1000)
    }
  }

  const handlePrevious = () => {
    if (session.currentIndex > 0) {
      // This would need to be implemented in the session hook
      // For now, we'll just reset the current card
      setIsFlipped(false)
      setShowAnswer(false)
      setHasAnswered(false)
      setCardStartTime(Date.now())
    }
  }

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US' // You might want to make this configurable
      speechSynthesis.speak(utterance)
    }
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

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={session.currentIndex === 0}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative">
        <Card
          className={`
            min-h-[400px] cursor-pointer transition-all duration-300 border-0 shadow-lg
            ${isFlipped ? 'bg-primary-50 border-primary-200' : 'bg-white'}
            ${hasAnswered ? 'pointer-events-none' : ''}
          `}
          onClick={handleFlip}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
            {!isFlipped ? (
              // Front of card - Show word
              <div className="space-y-6">
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    {currentWord.vocabulary.difficulty || 'medium'}
                  </Badge>
                  <h2 className="text-4xl font-bold text-neutral-800">
                    {currentWord.vocabulary.word}
                  </h2>
                  {currentWord.vocabulary.pronunciation && (
                    <p className="text-lg text-neutral-600">
                      /{currentWord.vocabulary.pronunciation}/
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      speakWord(currentWord.vocabulary.word)
                    }}
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Listen
                  </Button>
                </div>

                <div className="text-sm text-neutral-500 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Click to reveal translation
                </div>
              </div>
            ) : (
              // Back of card - Show translation and details
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-primary-700">
                    {currentWord.vocabulary.translation}
                  </h3>

                  {session.metadata?.includeDefinitions && currentWord.vocabulary.definition && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-neutral-600">Definition:</h4>
                      <p className="text-neutral-700">{currentWord.vocabulary.definition}</p>
                    </div>
                  )}

                  {session.metadata?.includeExamples && currentWord.vocabulary.example && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-neutral-600">Example:</h4>
                      <p className="text-neutral-700 italic">
                        &quot;{currentWord.vocabulary.example}&quot;
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      speakWord(currentWord.vocabulary.translation)
                    }}
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Listen
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flip indicator */}
        <div className="absolute top-4 right-4">
          <div className="p-2 bg-white rounded-full shadow-sm">
            {isFlipped ? (
              <EyeOff className="h-4 w-4 text-neutral-500" />
            ) : (
              <Eye className="h-4 w-4 text-neutral-500" />
            )}
          </div>
        </div>
      </div>

      {/* Answer Buttons */}
      {showAnswer && !hasAnswered && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleAnswer(false)}
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <XCircle className="h-5 w-5" />
            Don&apos;t Know
          </Button>
          <Button
            size="lg"
            onClick={() => handleAnswer(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-5 w-5" />I Know This
          </Button>
        </div>
      )}

      {/* Feedback */}
      {hasAnswered && (
        <div className="text-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              session.words[session.currentIndex]?.isCorrect
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {session.words[session.currentIndex]?.isCorrect ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Correct! Moving to next word...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Keep practicing this word!
              </>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!showAnswer && (
        <div className="text-center text-sm text-neutral-500">
          <p>Study the word, then click the card to see the translation</p>
        </div>
      )}
    </div>
  )
}
