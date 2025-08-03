'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Volume2, Search, Trash2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { useVocabulary } from '@/utils/hooks'
import { useDebounce } from '@/utils/hooks'
import { VocabularyPagination } from './VocabularyPagination'

export function VocabularyList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm])

  const { vocabulary, loading, error, deleteWord, pagination, changePage, changePageSize } =
    useVocabulary({
      page: currentPage,
      limit: pageSize,
      search: debouncedSearchTerm || undefined,
    })

  // Handle search with debouncing
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page)
      changePage(page)
    },
    [changePage],
  )

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize)
      setCurrentPage(1)
      changePageSize(newPageSize)
    },
    [changePageSize],
  )

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  const handleDelete = async (id: string, word: string) => {
    if (confirm(`Are you sure you want to delete "${word}"?`)) {
      try {
        await deleteWord(id)
        toast.success('Word deleted successfully')
      } catch (error) {
        toast.error('Failed to delete word')
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-0 shadow-sm animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-neutral-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Error loading vocabulary: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!vocabulary || vocabulary.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center">
          <BookOpen className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600 mb-2">No vocabulary words yet</p>
          <p className="text-sm text-neutral-500">Start learning by translating some text!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Search vocabulary..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Vocabulary Items */}
      <div className="space-y-3">
        {(vocabulary || []).map((item: any) => (
          <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-neutral-800">{item.word}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSpeak(item.word)}
                      className="h-8 w-8 p-0 hover:bg-neutral-100"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    {item.difficulty && (
                      <Badge
                        variant="secondary"
                        className={
                          item.difficulty === 'easy'
                            ? 'bg-green-100 text-green-700'
                            : item.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }
                      >
                        {item.difficulty}
                      </Badge>
                    )}
                  </div>

                  <p className="text-neutral-600 mb-1">
                    <span className="font-medium">Translation:</span> {item.translation}
                  </p>

                  {item.definition && (
                    <p className="text-sm text-neutral-500 mb-1">
                      <span className="font-medium">Definition:</span> {item.definition}
                    </p>
                  )}

                  {item.example && (
                    <p className="text-sm text-neutral-500">
                      <span className="font-medium">Example:</span> {item.example}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(item.id, item.word)}
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No results message */}
      {vocabulary && vocabulary.length === 0 && searchTerm && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <Search className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-neutral-600">No words found matching &quot;{searchTerm}&quot;</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalDocs > 0 && (
        <VocabularyPagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          loading={loading}
        />
      )}
    </div>
  )
}
