'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp,
  BookmarkPlus,
} from 'lucide-react'
import { VocabularyItem } from '@/utils/schema'
import { toast } from 'sonner'

interface VocabularySectionProps {
  vocabulary: VocabularyItem[]
  onSaveVocabulary?: (vocabulary: VocabularyItem[]) => Promise<void>
  title?: string
  defaultExpanded?: boolean
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
  hard: 'bg-red-100 text-red-800 border-red-200'
}

const typeColors = {
  noun: 'bg-blue-100 text-blue-800 border-blue-200',
  verb: 'bg-purple-100 text-purple-800 border-purple-200',
  adjective: 'bg-orange-100 text-orange-800 border-orange-200',
  phrase: 'bg-pink-100 text-pink-800 border-pink-200',
  idiom: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  adverb: 'bg-teal-100 text-teal-800 border-teal-200',
  preposition: 'bg-gray-100 text-gray-800 border-gray-200'
}

export function VocabularySection({ 
  vocabulary, 
  onSaveVocabulary,
  title = "📚 Vocabulary",
  defaultExpanded = true
}: VocabularySectionProps) {
  const [showVocabulary, setShowVocabulary] = useState(defaultExpanded)
  const [savingVocabulary, setSavingVocabulary] = useState(false)

  const handleSaveAllVocabulary = async () => {
    if (!onSaveVocabulary || vocabulary.length === 0) return

    setSavingVocabulary(true)
    try {
      await onSaveVocabulary(vocabulary)
      toast.success(`Saved ${vocabulary.length} words to vocabulary!`)
    } catch (error) {
      toast.error('Failed to save vocabulary')
    } finally {
      setSavingVocabulary(false)
    }
  }

  if (!vocabulary || vocabulary.length === 0) {
    return null
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            {title}
            <Badge variant="secondary" className="ml-2">
              {vocabulary.length} words
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {onSaveVocabulary && (
              <Button
                onClick={handleSaveAllVocabulary}
                disabled={savingVocabulary}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <BookmarkPlus className="h-4 w-4 mr-1" />
                {savingVocabulary ? 'Saving...' : 'Save All'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVocabulary(!showVocabulary)}
            >
              {showVocabulary ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {showVocabulary && (
        <CardContent className="pt-0">
          <div className="grid gap-3">
            {vocabulary.map((item, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900 text-lg">
                        {item.word}
                      </span>
                      <Badge 
                        className={`text-xs ${typeColors[item.type]} border`}
                        variant="outline"
                      >
                        {item.type}
                      </Badge>
                      <Badge 
                        className={`text-xs ${difficultyColors[item.difficulty]} border`}
                        variant="outline"
                      >
                        {item.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-gray-700 font-medium">
                        <span className="text-gray-500 text-sm">Translation:</span> {item.translation}
                      </p>
                      {item.context && (
                        <p className="text-gray-600 text-sm">
                          <span className="text-gray-500">Context:</span> {item.context}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {onSaveVocabulary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSaveVocabulary([item])}
                      className="shrink-0"
                    >
                      <BookmarkPlus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
