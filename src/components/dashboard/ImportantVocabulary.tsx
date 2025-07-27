'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Sparkles, Plus, Volume2, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useVocabulary } from '@/hooks/usePayloadData'
import { useAuth } from '@/contexts/AuthContext'

interface VocabularyItem {
  word: string
  translation: string
  type: 'noun' | 'verb' | 'adjective' | 'phrase' | 'idiom' | 'adverb' | 'preposition'
  difficulty: 'easy' | 'medium' | 'hard'
  context: string
}

interface ImportantVocabularyProps {
  inputText: string
  className?: string
}

export function ImportantVocabulary({ inputText, className }: ImportantVocabularyProps) {
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set())
  const [savingWords, setSavingWords] = useState<Set<string>>(new Set())

  const { customer } = useAuth()
  const { createWord } = useVocabulary()

  const generateVocabulary = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text first')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/vocabulary/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          detailed: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate vocabulary')
      }

      const data = await response.json()
      setVocabularyItems(data.vocabulary || [])
      setSavedWords(new Set()) // Reset saved words
      setSavingWords(new Set()) // Reset saving words
      toast.success(`Generated ${data.vocabulary?.length || 0} vocabulary items`)
    } catch (error) {
      console.error('Error generating vocabulary:', error)
      toast.error('Failed to generate vocabulary')
    } finally {
      setIsGenerating(false)
    }
  }

  const saveAllVocabulary = async () => {
    if (!customer?.id) {
      toast.error('Please log in to save vocabulary')
      return
    }

    if (vocabularyItems.length === 0) {
      toast.error('No vocabulary to save')
      return
    }

    setIsSaving(true)
    try {
      const savedWords: string[] = []
      const duplicateWords: string[] = []
      const failedWords: string[] = []

      for (const item of vocabularyItems) {
        try {
          await createWord({
            word: item.word,
            translation: item.translation,
            definition: item.context,
            example: inputText,
            difficulty: item.difficulty,
            status: 'new',
            tags: [item.type, 'important-vocabulary'],
            customer: customer.id,
          })
          savedWords.push(item.word)
        } catch (error) {
          if (error instanceof Error && error.message.includes('already exists')) {
            duplicateWords.push(item.word)
          } else {
            failedWords.push(item.word)
            console.error(`Failed to save word "${item.word}":`, error)
          }
        }
      }

      // Update saved words state
      setSavedWords(new Set(savedWords))

      // Show comprehensive feedback
      if (savedWords.length > 0) {
        toast.success(`Saved ${savedWords.length} new words to vocabulary!`)
      }
      if (duplicateWords.length > 0) {
        toast.info(`${duplicateWords.length} words already exist in vocabulary`)
      }
      if (failedWords.length > 0) {
        toast.error(`Failed to save ${failedWords.length} words`)
      }
    } catch (error) {
      console.error('Error saving vocabulary:', error)
      toast.error('Failed to save vocabulary')
    } finally {
      setIsSaving(false)
    }
  }

  const saveIndividualWord = async (item: VocabularyItem) => {
    if (!customer?.id) {
      toast.error('Please log in to save vocabulary')
      return
    }

    // Set saving state for this specific word
    setSavingWords((prev) => new Set([...prev, item.word]))

    try {
      await createWord({
        word: item.word,
        translation: item.translation,
        definition: item.context,
        example: inputText,
        difficulty: item.difficulty,
        status: 'new',
        tags: [item.type, 'important-vocabulary'],
        customer: customer.id,
      })

      setSavedWords((prev) => new Set([...prev, item.word]))
      toast.success(`Saved "${item.word}" to vocabulary!`)
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        setSavedWords((prev) => new Set([...prev, item.word])) // Mark as saved if already exists
        toast.info(`"${item.word}" already exists in vocabulary`)
      } else {
        console.error(`Failed to save word "${item.word}":`, error)
        toast.error(`Failed to save "${item.word}"`)
      }
    } finally {
      // Remove saving state for this word
      setSavingWords((prev) => {
        const newSet = new Set(prev)
        newSet.delete(item.word)
        return newSet
      })
    }
  }

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    } else {
      toast.error('Speech synthesis not supported')
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'hard':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200'
    }
  }

  const getTypeColor = (type: string) => {
    const colors = {
      noun: 'bg-blue-100 text-blue-700 border-blue-200',
      verb: 'bg-purple-100 text-purple-700 border-purple-200',
      adjective: 'bg-pink-100 text-pink-700 border-pink-200',
      phrase: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      idiom: 'bg-orange-100 text-orange-700 border-orange-200',
      adverb: 'bg-teal-100 text-teal-700 border-teal-200',
      preposition: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    }
    return (
      colors[type as keyof typeof colors] || 'bg-neutral-100 text-neutral-700 border-neutral-200'
    )
  }

  return (
    <Card className={`border-0 shadow-sm ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-neutral-800">
                Important Vocabulary
              </CardTitle>
              <p className="text-sm text-neutral-600">Extract key words from your text</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={generateVocabulary}
              disabled={!inputText.trim() || isGenerating}
              variant="outline"
              size="sm"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Extract
                </>
              )}
            </Button>

            {vocabularyItems.length > 0 && (
              <Button
                onClick={saveAllVocabulary}
                disabled={isSaving || savingWords.size > 0}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Save All ({vocabularyItems.length})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {vocabularyItems.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-purple-400" />
            </div>
            <p className="font-medium text-neutral-700 mb-1">No vocabulary extracted yet</p>
            <p className="text-sm text-neutral-500">
              Click "Extract" to find important words from your text
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {vocabularyItems.map((item, index) => {
              const isWordSaved = savedWords.has(item.word)

              return (
                <div
                  key={index}
                  className="p-4 border border-neutral-200 rounded-xl bg-white hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-900 text-base sm:text-lg">
                            {item.word}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSpeak(item.word)}
                            className="h-6 w-6 p-0 hover:bg-neutral-200 flex-shrink-0"
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-xs ${getTypeColor(item.type)} border`}
                            variant="outline"
                          >
                            {item.type}
                          </Badge>
                          <Badge
                            className={`text-xs ${getDifficultyColor(item.difficulty)} border`}
                            variant="outline"
                          >
                            {item.difficulty}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-neutral-700 mb-1">
                        <span className="font-medium">Translation:</span> {item.translation}
                      </p>

                      <p className="text-sm text-neutral-600">
                        <span className="font-medium">Context:</span> {item.context}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isWordSaved ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Saved</span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => saveIndividualWord(item)}
                          variant="outline"
                          size="sm"
                          className="border-purple-200 text-purple-700 hover:bg-purple-50"
                          disabled={savingWords.has(item.word)}
                        >
                          {savingWords.has(item.word) ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Save
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
