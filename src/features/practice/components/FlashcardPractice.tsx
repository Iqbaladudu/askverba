'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Volume2,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Pause,
  Play,
  RotateCcw,
  Zap,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  MessageSquare,
} from 'lucide-react'
import { PracticeSession } from '@/features/practice/hooks/usePracticeSession'
import { PracticeProgress } from './PracticeProgress'

interface FlashcardPracticeProps {
  session: PracticeSession
  onAnswer: (
    userAnswer: string,
    isCorrect: boolean,
    timeSpent: number,
    difficulty?: 'again' | 'hard' | 'good' | 'easy',
  ) => boolean
  onComplete: (results: {
    totalWords: number
    correctAnswers: number
    timeSpent: number
    accuracy: number
  }) => void
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

  const handleAnkiAnswer = (difficulty: 'again' | 'hard' | 'good' | 'easy') => {
    if (hasAnswered) return

    const timeSpent = Math.floor((Date.now() - cardStartTime) / 1000)
    const isCorrect = difficulty !== 'again'
    setHasAnswered(true)

    // Submit answer with Anki-style difficulty rating
    const isComplete = onAnswer(
      isCorrect ? currentWord.correctAnswer : 'incorrect',
      isCorrect,
      timeSpent,
      difficulty,
    )

    if (isComplete) {
      // Calculate final results
      const results = {
        totalWords: session.totalWords,
        correctAnswers: session.correctAnswers + (isCorrect ? 1 : 0),
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
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Progress Header */}
      <PracticeProgress session={session} onComplete={onComplete} showFinishButton={false} />

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={session.isPaused ? onResume : onPause}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            {session.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {session.isPaused ? 'Resume' : 'Pause'}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={session.currentIndex === 0}
            className="shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative perspective-1000">
        <Card
          className={`
            min-h-[500px] cursor-pointer transition-all duration-500 border-0 shadow-2xl hover:shadow-3xl
            ${
              isFlipped
                ? 'bg-gradient-to-br from-primary-50 to-primary-100/50 border-2 border-primary-200'
                : 'bg-gradient-to-br from-white to-neutral-50/50 border-2 border-neutral-200 hover:border-primary-300'
            }
            ${hasAnswered ? 'pointer-events-none' : 'hover:scale-[1.02]'}
            transform-gpu
          `}
          onClick={handleFlip}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-10 text-center relative overflow-hidden">
            {!isFlipped ? (
              // Front of card - Show word
              <div className="space-y-8 w-full">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Badge
                      className={`text-sm font-medium px-4 py-2 ${
                        currentWord.vocabulary.difficulty === 'easy'
                          ? 'bg-green-100 text-green-700'
                          : currentWord.vocabulary.difficulty === 'hard'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {currentWord.vocabulary.difficulty || 'medium'} level
                    </Badge>
                  </div>
                  <h2 className="text-5xl font-bold text-neutral-800 leading-tight">
                    {currentWord.vocabulary.word}
                  </h2>
                  {currentWord.vocabulary.pronunciation && (
                    <p className="text-xl text-neutral-600 font-mono">
                      /{currentWord.vocabulary.pronunciation}/
                    </p>
                  )}
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      speakWord(currentWord.vocabulary.word)
                    }}
                    className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-neutral-300 hover:border-primary-400"
                  >
                    <Volume2 className="h-5 w-5 mr-3" />
                    Listen to Pronunciation
                  </Button>
                </div>

                <div className="text-base text-neutral-500 flex items-center justify-center gap-3 bg-neutral-100/50 rounded-xl p-4">
                  <Eye className="h-5 w-5" />
                  Click anywhere to reveal the translation
                </div>
              </div>
            ) : (
              // Back of card - Show translation and details
              <div className="space-y-8 w-full">
                <div className="space-y-6">
                  <h3 className="text-4xl font-bold text-primary-700 leading-tight">
                    {currentWord.vocabulary.translation}
                  </h3>

                  {session.metadata?.includeDefinitions && currentWord.vocabulary.definition && (
                    <div className="space-y-3 p-6 bg-white/50 rounded-2xl border border-primary-200">
                      <h4 className="text-base font-semibold text-primary-600 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Definition
                      </h4>
                      <p className="text-neutral-700 text-lg leading-relaxed">
                        {currentWord.vocabulary.definition}
                      </p>
                    </div>
                  )}

                  {session.metadata?.includeExamples && currentWord.vocabulary.example && (
                    <div className="space-y-3 p-6 bg-white/50 rounded-2xl border border-primary-200">
                      <h4 className="text-base font-semibold text-primary-600 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Example Usage
                      </h4>
                      <p className="text-neutral-700 text-lg italic leading-relaxed">
                        &quot;{currentWord.vocabulary.example}&quot;
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      speakWord(currentWord.vocabulary.translation)
                    }}
                    className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-primary-300 hover:border-primary-400"
                  >
                    <Volume2 className="h-5 w-5 mr-3" />
                    Listen to Translation
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flip indicator */}
        <div className="absolute top-6 right-6">
          <div
            className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
              isFlipped
                ? 'bg-primary-500 text-white'
                : 'bg-white text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            {isFlipped ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </div>
        </div>
      </div>

      {/* Anki-Style Answer Buttons */}
      {showAnswer && !hasAnswered && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-neutral-800">
              How well did you know this word?
            </h3>
            <p className="text-neutral-600">
              Your answer affects when you&apos;ll see this word again
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => handleAnkiAnswer('again')}
              variant="outline"
              size="lg"
              className="border-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 flex-col h-auto py-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RotateCcw className="h-6 w-6 mb-2" />
              <span className="text-sm font-bold">Again</span>
              <span className="text-xs text-red-600 font-medium">1 day</span>
            </Button>
            <Button
              onClick={() => handleAnkiAnswer('hard')}
              variant="outline"
              size="lg"
              className="border-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 flex-col h-auto py-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ThumbsDown className="h-6 w-6 mb-2" />
              <span className="text-sm font-bold">Hard</span>
              <span className="text-xs text-orange-600 font-medium">2 days</span>
            </Button>
            <Button
              onClick={() => handleAnkiAnswer('good')}
              variant="outline"
              size="lg"
              className="border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 flex-col h-auto py-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ThumbsUp className="h-6 w-6 mb-2" />
              <span className="text-sm font-bold">Good</span>
              <span className="text-xs text-green-600 font-medium">4 days</span>
            </Button>
            <Button
              onClick={() => handleAnkiAnswer('easy')}
              variant="outline"
              size="lg"
              className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 flex-col h-auto py-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Zap className="h-6 w-6 mb-2" />
              <span className="text-sm font-bold">Easy</span>
              <span className="text-xs text-blue-600 font-medium">7 days</span>
            </Button>
          </div>
        </div>
      )}

      {/* Feedback */}
      {hasAnswered && (
        <div className="text-center">
          <div
            className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg ${
              session.words[session.currentIndex]?.isCorrect
                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-2 border-green-300'
                : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-2 border-red-300'
            }`}
          >
            {session.words[session.currentIndex]?.isCorrect ? (
              <>
                <CheckCircle className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-bold text-lg">Excellent!</div>
                  <div className="text-sm">Moving to the next word...</div>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-bold text-lg">Keep Learning!</div>
                  <div className="text-sm">This word needs more practice</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!showAnswer && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-3 bg-neutral-100 rounded-xl text-neutral-600">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">
              Study the word, then click the card to see the translation
            </span>
          </div>
        </div>
      )}

      {/* Finish Quiz Button */}
      <PracticeProgress session={session} onComplete={onComplete} showFinishButton={true} />
    </div>
  )
}
