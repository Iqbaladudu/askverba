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
    <div className="space-y-6">
      {/* Practice Overview */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary-600" />
            Practice Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Word Count */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Number of Words</Label>
              <Badge variant="secondary">{config.wordCount} words</Badge>
            </div>
            <Slider
              value={[config.wordCount]}
              onValueChange={([value]) => handleConfigChange('wordCount', value)}
              max={maxWords}
              min={5}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-neutral-500">Available words: {availableWords}</p>
          </div>

          {/* Difficulty Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Difficulty Level</Label>
            <Select
              value={config.difficulty}
              onValueChange={(value) => handleConfigChange('difficulty', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Learning Status</Label>
            <Select
              value={config.status}
              onValueChange={(value) => handleConfigChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New Words</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
                <SelectItem value="mastered">Mastered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Time Limit</Label>
              <Badge variant="outline">
                {config.timeLimit === 0 ? 'No limit' : `${config.timeLimit} min`}
              </Badge>
            </div>
            <Slider
              value={[config.timeLimit]}
              onValueChange={([value]) => handleConfigChange('timeLimit', value)}
              max={30}
              min={0}
              step={5}
              className="w-full"
            />
          </div>

          {/* Practice Options */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Practice Options</Label>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-neutral-500" />
                <span className="text-sm">Include Definitions</span>
              </div>
              <Switch
                checked={config.includeDefinitions}
                onCheckedChange={(checked) => handleConfigChange('includeDefinitions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-neutral-500" />
                <span className="text-sm">Include Examples</span>
              </div>
              <Switch
                checked={config.includeExamples}
                onCheckedChange={(checked) => handleConfigChange('includeExamples', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shuffle className="h-4 w-4 text-neutral-500" />
                <span className="text-sm">Shuffle Words</span>
              </div>
              <Switch
                checked={config.shuffleWords}
                onCheckedChange={(checked) => handleConfigChange('shuffleWords', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {stats && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary-600" />
              Your Vocabulary Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-800">{stats.totalWords || 0}</div>
                <div className="text-xs text-neutral-500">Total Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.byStatus?.mastered || 0}
                </div>
                <div className="text-xs text-neutral-500">Mastered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.byStatus?.learning || 0}
                </div>
                <div className="text-xs text-neutral-500">Learning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.byStatus?.new || 0}</div>
                <div className="text-xs text-neutral-500">New</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleStart}
          disabled={isLoading || availableWords === 0 || config.wordCount > availableWords}
          className="px-8"
        >
          <Play className="h-5 w-5 mr-2" />
          {isLoading ? 'Starting...' : 'Start Practice'}
        </Button>
      </div>

      {availableWords === 0 && (
        <div className="text-center text-neutral-500 text-sm">
          No vocabulary words available. Add some words to your vocabulary first.
        </div>
      )}

      {config.wordCount > availableWords && availableWords > 0 && (
        <div className="text-center text-amber-600 text-sm">
          Only {availableWords} words available with current filters.
        </div>
      )}
    </div>
  )
}
