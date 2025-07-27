'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  Settings,
  BookOpen,
  Target,
  Clock,
  Shuffle,
  FileText,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react'
import { useVocabulary } from '@/hooks/usePayloadData'

interface PracticeSetupProps {
  practiceType: 'flashcard' | 'multiple_choice' | 'fill_blanks' | 'listening' | 'mixed'
  onStart: (config: any) => void
  isLoading: boolean
}

export function PracticeSetup({ practiceType, onStart, isLoading }: PracticeSetupProps) {
  const { stats, loading, error } = useVocabulary()
  const [config, setConfig] = useState({
    wordCount: 10,
    difficulty: 'all' as 'all' | 'easy' | 'medium' | 'hard',
    status: 'all' as 'all' | 'new' | 'learning' | 'mastered',
    includeDefinitions: true,
    includeExamples: false,
    shuffleWords: true,
    timeLimit: 0, // 0 means no time limit
  })

  const handleConfigChange = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleStart = () => {
    const practiceConfig = {
      ...config,
      difficulty: config.difficulty === 'all' ? undefined : config.difficulty,
      status: config.status === 'all' ? undefined : config.status,
      timeLimit: config.timeLimit === 0 ? undefined : config.timeLimit * 60, // Convert to seconds
    }
    onStart(practiceConfig)
  }

  const getAvailableWords = () => {
    if (!stats) return 0

    let count = stats.totalWords || 0

    if (config.difficulty !== 'all') {
      count = stats.byDifficulty?.[config.difficulty] || 0
    }

    if (config.status !== 'all') {
      count = stats.byStatus?.[config.status] || 0
    }

    return count
  }

  const availableWords = getAvailableWords()
  const maxWords = Math.min(availableWords, 50) // Cap at 50 words

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary-600" />
              Loading Practice Settings...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-sm border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Settings className="h-5 w-5" />
              Error Loading Practice Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show no vocabulary state
  if (!loading && (!stats || !stats.totalWords || stats.totalWords === 0)) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-sm border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <BookOpen className="h-5 w-5" />
              No Vocabulary Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-4">
              You need to add some vocabulary words before you can start practicing.
            </p>
            <Button
              onClick={() => (window.location.href = '/dashboard/vocabulary')}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Add Vocabulary Words
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Back Navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="text-neutral-600 hover:text-neutral-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Practice Types
        </Button>
      </div>

      {/* Practice Overview */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-neutral-50/50">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-neutral-800">Customize Your Practice</div>
              <div className="text-sm text-neutral-600 font-normal">
                Tailor the session to your learning goals
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Word Count */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-neutral-800">Number of Words</Label>
              <Badge className="bg-primary-100 text-primary-700 font-semibold px-3 py-1">
                {config.wordCount} words
              </Badge>
            </div>
            <div className="space-y-3">
              <Slider
                value={[config.wordCount]}
                onValueChange={([value]) => handleConfigChange('wordCount', value)}
                max={maxWords}
                min={5}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-neutral-500">
                <span>5 words</span>
                <span className="font-medium">Available: {availableWords}</span>
                <span>{maxWords} words</span>
              </div>
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-neutral-800 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary-600" />
              Difficulty Level
            </Label>
            <Select
              value={config.difficulty}
              onValueChange={(value) => handleConfigChange('difficulty', value)}
            >
              <SelectTrigger className="h-12 border-2 border-neutral-200 hover:border-primary-300 focus:border-primary-500 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🎯 All Difficulties</SelectItem>
                <SelectItem value="easy">🟢 Easy</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="hard">🔴 Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-neutral-800 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary-600" />
              Learning Status
            </Label>
            <Select
              value={config.status}
              onValueChange={(value) => handleConfigChange('status', value)}
            >
              <SelectTrigger className="h-12 border-2 border-neutral-200 hover:border-primary-300 focus:border-primary-500 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📚 All Status</SelectItem>
                <SelectItem value="new">✨ New Words</SelectItem>
                <SelectItem value="learning">📖 Learning</SelectItem>
                <SelectItem value="mastered">🏆 Mastered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Limit */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-neutral-800 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary-600" />
                Time Limit
              </Label>
              <Badge
                className={`font-semibold px-3 py-1 ${
                  config.timeLimit === 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {config.timeLimit === 0 ? '∞ No limit' : `⏱️ ${config.timeLimit} min`}
              </Badge>
            </div>
            <div className="space-y-3">
              <Slider
                value={[config.timeLimit]}
                onValueChange={([value]) => handleConfigChange('timeLimit', value)}
                max={30}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-neutral-500">
                <span>No limit</span>
                <span>30 minutes</span>
              </div>
            </div>
          </div>

          {/* Practice Options */}
          <div className="space-y-6">
            <Label className="text-base font-semibold text-neutral-800">Practice Options</Label>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-neutral-800">Include Definitions</div>
                    <div className="text-sm text-neutral-600">
                      Show word meanings during practice
                    </div>
                  </div>
                </div>
                <Switch
                  checked={config.includeDefinitions}
                  onCheckedChange={(checked) => handleConfigChange('includeDefinitions', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-neutral-800">Include Examples</div>
                    <div className="text-sm text-neutral-600">Show usage examples in sentences</div>
                  </div>
                </div>
                <Switch
                  checked={config.includeExamples}
                  onCheckedChange={(checked) => handleConfigChange('includeExamples', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shuffle className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-neutral-800">Shuffle Words</div>
                    <div className="text-sm text-neutral-600">
                      Randomize word order for better learning
                    </div>
                  </div>
                </div>
                <Switch
                  checked={config.shuffleWords}
                  onCheckedChange={(checked) => handleConfigChange('shuffleWords', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {stats && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-neutral-50/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-neutral-800">Your Vocabulary Overview</div>
                <div className="text-sm text-neutral-600 font-normal">
                  Current learning progress
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-xl">
                <div className="text-3xl font-bold text-neutral-800 mb-1">
                  {stats.totalWords || 0}
                </div>
                <div className="text-sm font-medium text-neutral-600">Total Words</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl">
                <div className="text-3xl font-bold text-green-700 mb-1">
                  {stats.byStatus?.mastered || 0}
                </div>
                <div className="text-sm font-medium text-green-600">🏆 Mastered</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl">
                <div className="text-3xl font-bold text-yellow-700 mb-1">
                  {stats.byStatus?.learning || 0}
                </div>
                <div className="text-sm font-medium text-yellow-600">📖 Learning</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl">
                <div className="text-3xl font-bold text-blue-700 mb-1">
                  {stats.byStatus?.new || 0}
                </div>
                <div className="text-sm font-medium text-blue-600">✨ New</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start Button */}
      <div className="text-center space-y-4">
        <Button
          size="lg"
          onClick={handleStart}
          disabled={isLoading || availableWords === 0 || config.wordCount > availableWords}
          className="px-12 py-4 h-auto text-lg font-semibold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
              Preparing Practice...
            </>
          ) : (
            <>
              <Play className="h-6 w-6 mr-3" />
              Start Your Practice Session
            </>
          )}
        </Button>

        {/* Validation Messages */}
        {availableWords === 0 && (
          <div className="max-w-md mx-auto p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-yellow-800">No Words Available</div>
                <div className="text-sm text-yellow-700">
                  Add vocabulary words to start practicing
                </div>
              </div>
            </div>
          </div>
        )}

        {config.wordCount > availableWords && availableWords > 0 && (
          <div className="max-w-md mx-auto p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-amber-800">Limited Words Available</div>
                <div className="text-sm text-amber-700">
                  Only {availableWords} words match your current filters
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
