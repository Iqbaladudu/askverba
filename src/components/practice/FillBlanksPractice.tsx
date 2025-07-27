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
  Lightbulb,
  Eye,
} from 'lucide-react'
import { PracticeSession } from '@/hooks/usePracticeSession'

interface FillBlanksPracticeProps {
  session: PracticeSession
  onAnswer: (userAnswer: string, isCorrect: boolean, timeSpent: number) => boolean
  onComplete: (results: any) => void
  onPause: () => void
  onResume: () => void
}

export function FillBlanksPractice({
  session,
  onAnswer,
  onComplete,
  onPause,
  onResume,
}: FillBlanksPracticeProps) {
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [sentence, setSentence] = useState('')
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  const currentWord = session.words[session.currentIndex]

  // Generate fill-in-the-blank sentence
  useEffect(() => {
    if (!currentWord) return

    // Use the example sentence if available, otherwise create a simple one
    let baseSentence =
      currentWord.vocabulary.example || `The word "${currentWord.vocabulary.word}" means _____.`

    // Replace the word with blank if it appears in the example
    if (currentWord.vocabulary.example) {
      const wordRegex = new RegExp(`\\b${currentWord.vocabulary.word}\\b`, 'gi')
      baseSentence = baseSentence.replace(wordRegex, '_____')
    }

    setSentence(baseSentence)
    setUserAnswer('')
    setShowResult(false)
    setShowHint(false)
    setQuestionStartTime(Date.now())

    // Set time limit if configured
    if (session.metadata?.timeLimit) {
      setTimeLeft(45) // 45 seconds per question for fill-in-the-blanks
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

  const handleSubmit = () => {
    if (showResult) return

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    const trimmedAnswer = userAnswer.trim().toLowerCase()
    const correctAnswer = currentWord.vocabulary.word.toLowerCase()
    const correctTranslation = currentWord.vocabulary.translation.toLowerCase()

    // Accept both the original word and its translation
    const isCorrect = trimmedAnswer === correctAnswer || trimmedAnswer === correctTranslation

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

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  const getHint = () => {
    const word = currentWord.vocabulary.word
    const hintLength = Math.ceil(word.length / 3)
    return word.substring(0, hintLength) + '...'.repeat(Math.max(1, word.length - hintLength))
  }

  const isCorrectAnswer = () => {
    const trimmedAnswer = userAnswer.trim().toLowerCase()
    const correctAnswer = currentWord.vocabulary.word.toLowerCase()
    const correctTranslation = currentWord.vocabulary.translation.toLowerCase()
    return trimmedAnswer === correctAnswer || trimmedAnswer === correctTranslation
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
              <span className={timeLeft <= 15 ? 'text-red-600 font-medium' : 'text-neutral-600'}>
                {timeLeft}s
              </span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHint(!showHint)}
            disabled={showResult}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Hint
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
              Fill in the blank
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sentence with blank */}
          <div className="text-center">
            <div className="text-xl leading-relaxed p-6 bg-neutral-50 rounded-lg">
              {sentence.split('_____').map((part, index, array) => (
                <React.Fragment key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <span className="inline-block mx-2">
                      {showResult ? (
                        <span
                          className={`px-3 py-1 rounded font-medium ${
                            isCorrectAnswer()
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {userAnswer || '(empty)'}
                        </span>
                      ) : (
                        <span className="border-b-2 border-primary-500 min-w-[120px] inline-block">
                          &nbsp;
                        </span>
                      )}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Translation hint */}
          <div className="text-center text-sm text-neutral-600">
            <p>
              Translation: <strong>{currentWord.vocabulary.translation}</strong>
            </p>
          </div>

          {/* Hint */}
          {showHint && !showResult && (
            <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-yellow-700">
                <Lightbulb className="h-4 w-4" />
                <span className="text-sm">Hint: {getHint()}</span>
              </div>
            </div>
          )}

          {/* Input */}
          {!showResult && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer here..."
                  className="text-lg text-center"
                  autoFocus
                />
                <Button
                  variant="outline"
                  onClick={() => speakWord(currentWord.vocabulary.translation)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>

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
                    The correct answer is &quot;{currentWord.vocabulary.word}&quot;
                  </>
                )}
              </div>

              {/* Show correct sentence */}
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600 mb-2">
                  <Eye className="h-4 w-4 inline mr-1" />
                  Complete sentence:
                </p>
                <p className="text-lg">{sentence.replace('_____', currentWord.vocabulary.word)}</p>
              </div>

              {/* Additional Info */}
              {session.metadata?.includeDefinitions && currentWord.vocabulary.definition && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Definition:</strong> {currentWord.vocabulary.definition}
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
          <p>Fill in the blank with the correct word. You can use either English or Indonesian.</p>
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
