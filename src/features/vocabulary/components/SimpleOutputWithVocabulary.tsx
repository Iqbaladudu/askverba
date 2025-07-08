'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Languages, 
  BookOpen, 
  ChevronDown, 
  ChevronUp,
  Copy,
  Volume2,
  BookmarkPlus,
  Star
} from 'lucide-react'
import { SimpleTranslationResult, VocabularyItem } from '@/components/schema'
import { OutputActions } from './outputActions'
import { toast } from 'sonner'

interface SimpleOutputWithVocabularyProps {
  result: SimpleTranslationResult
  onSaveVocabulary?: (vocabulary: VocabularyItem[]) => Promise<void>
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

export function SimpleOutputWithVocabulary({ 
  result, 
  onSaveVocabulary 
}: SimpleOutputWithVocabularyProps) {
  const [showVocabulary, setShowVocabulary] = useState(true)
  const [savingVocabulary, setSavingVocabulary] = useState(false)

  const handleSaveAllVocabulary = async () => {
    if (!onSaveVocabulary) return
    
    setSavingVocabulary(true)
    try {
      await onSaveVocabulary(result.vocabulary)
      toast.success(`Saved ${result.vocabulary.length} words to vocabulary!`)
    } catch (error) {
      toast.error('Failed to save vocabulary')
    } finally {
      setSavingVocabulary(false)
    }
  }

  return (
    <div className="p-4 bg-neutral-50 dark:bg-neutral-900 space-y-4">
      {/* Translation Section */}
      <div className="bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary-500/10">
              <Languages className="h-4 w-4 text-primary-500" />
            </div>
            <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Terjemahan Singkat
            </h4>
          </div>
          <OutputActions
            textToCopy={result.translation}
            textToSpeak={result.translation}
            copyTooltip="Salin terjemahan"
            speakTooltip="Dengar terjemahan"
          />
        </div>
        <div className="p-4">
          <p className="text-neutral-900 dark:text-neutral-100 leading-relaxed">
            {result.translation}
          </p>
        </div>
      </div>

      {/* Vocabulary Section */}
      {result.vocabulary && result.vocabulary.length > 0 && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-500/10">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                </div>
                <CardTitle className="text-sm font-medium">
                  Kosakata Penting ({result.vocabulary.length})
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {onSaveVocabulary && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveAllVocabulary}
                    disabled={savingVocabulary}
                    className="text-xs"
                  >
                    <BookmarkPlus className="h-3 w-3 mr-1" />
                    {savingVocabulary ? 'Menyimpan...' : 'Simpan Semua'}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowVocabulary(!showVocabulary)}
                  className="text-xs"
                >
                  {showVocabulary ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {showVocabulary && (
            <CardContent className="pt-0">
              <div className="space-y-3">
                {result.vocabulary.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {item.word}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${typeColors[item.type]}`}
                        >
                          {item.type}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${difficultyColors[item.difficulty]}`}
                        >
                          {item.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigator.clipboard.writeText(item.word)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const utterance = new SpeechSynthesisUtterance(item.word)
                            utterance.lang = 'en-US'
                            speechSynthesis.speak(utterance)
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">
                        <span className="font-medium">Arti:</span> {item.translation}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        <span className="font-medium">Konteks:</span> {item.context}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
