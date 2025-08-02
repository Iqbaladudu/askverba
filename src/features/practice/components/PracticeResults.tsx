'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  RotateCcw, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Star,
  Award,
  BookOpen,
  Volume2
} from 'lucide-react'
import { PracticeSession } from '@/features/practice/hooks/usePracticeSession'

interface PracticeResultsProps {
  session: PracticeSession
  onRestart: () => void
  onBackToVocabulary: () => void
}

export function PracticeResults({ session, onRestart, onBackToVocabulary }: PracticeResultsProps) {
  const accuracy = Math.round((session.correctAnswers / session.totalWords) * 100)
  const timeSpentMinutes = Math.floor(session.timeSpent / 60)
  const timeSpentSeconds = session.timeSpent % 60
  const averageTimePerWord = Math.round(session.timeSpent / session.totalWords)

  const getPerformanceLevel = () => {
    if (accuracy >= 90) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (accuracy >= 75) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' }
    if (accuracy >= 60) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    return { level: 'Needs Practice', color: 'text-red-600', bgColor: 'bg-red-100' }
  }

  const getPerformanceMessage = () => {
    if (accuracy >= 90) return "Outstanding work! You've mastered these words!"
    if (accuracy >= 75) return "Great job! You're making excellent progress!"
    if (accuracy >= 60) return "Good effort! Keep practicing to improve further."
    return "Don't give up! Practice makes perfect."
  }

  const performance = getPerformanceLevel()

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className={`p-4 rounded-full ${performance.bgColor}`}>
            <Trophy className={`h-12 w-12 ${performance.color}`} />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Practice Complete!</h1>
          <p className="text-lg text-neutral-600 mt-2">{getPerformanceMessage()}</p>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-2">
              <Target className="h-8 w-8 text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-800">{accuracy}%</div>
            <div className="text-sm text-neutral-600">Accuracy</div>
            <Badge variant="secondary" className={`mt-2 ${performance.bgColor} ${performance.color} border-0`}>
              {performance.level}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-800">
              {session.correctAnswers}/{session.totalWords}
            </div>
            <div className="text-sm text-neutral-600">Correct Answers</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-2">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-800">
              {timeSpentMinutes}:{timeSpentSeconds.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-neutral-600">Total Time</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-800">{averageTimePerWord}s</div>
            <div className="text-sm text-neutral-600">Avg per Word</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Overall Progress</span>
              <span className="font-medium">{session.correctAnswers} of {session.totalWords} correct</span>
            </div>
            <Progress value={accuracy} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary-600" />
            Word-by-Word Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {session.words.map((word, index) => (
              <div
                key={index}
                className={`
                  flex items-center justify-between p-3 rounded-lg border
                  ${word.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
                `}
              >
                <div className="flex items-center gap-3">
                  {word.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <div className="font-medium text-neutral-800">
                      {word.vocabulary.word}
                    </div>
                    <div className="text-sm text-neutral-600">
                      {word.vocabulary.translation}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {word.userAnswer && !word.isCorrect && (
                    <Badge variant="outline" className="text-xs text-red-600">
                      Your answer: {word.userAnswer}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {word.timeSpent}s
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakWord(word.vocabulary.word)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      {accuracy >= 80 && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-neutral-800">Achievement Unlocked!</h3>
                <p className="text-sm text-neutral-600">
                  {accuracy >= 95 ? 'Perfect Practice - 95%+ accuracy!' :
                   accuracy >= 90 ? 'Excellence Award - 90%+ accuracy!' :
                   'Great Performance - 80%+ accuracy!'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          onClick={onBackToVocabulary}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vocabulary
        </Button>

        <Button
          onClick={onRestart}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Practice Again
        </Button>
      </div>

      {/* Study Recommendations */}
      {accuracy < 75 && (
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Star className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Study Recommendations</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Review the words you got wrong and practice them more</li>
                  <li>• Try using flashcards to memorize difficult words</li>
                  <li>• Practice listening to improve pronunciation recognition</li>
                  <li>• Use the words in sentences to better understand context</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
