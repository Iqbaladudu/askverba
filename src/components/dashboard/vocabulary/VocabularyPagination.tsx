'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface VocabularyPaginationProps {
  pagination: {
    page: number
    limit: number
    totalDocs: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  loading?: boolean
}

export function VocabularyPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  loading = false,
}: VocabularyPaginationProps) {
  const { page, limit, totalDocs, totalPages, hasNextPage, hasPrevPage } = pagination

  // Calculate display range
  const startItem = Math.min((page - 1) * limit + 1, totalDocs)
  const endItem = Math.min(page * limit, totalDocs)

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show smart pagination
      if (page <= 3) {
        // Show first pages
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (page >= totalPages - 2) {
        // Show last pages
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Show middle pages
        pages.push(1)
        pages.push('...')
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalDocs === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg border p-4 shadow-sm">
      {/* Results info */}
      <div className="text-sm text-neutral-600 text-center sm:text-left">
        <span className="font-medium">{startItem}-{endItem}</span> of <span className="font-medium">{totalDocs}</span> words
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Page size selector - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-600">
          <span>Show</span>
          <Select
            value={limit.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
            disabled={loading}
          >
            <SelectTrigger className="w-20 h-9 border-neutral-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-center gap-1">
          {/* Previous page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrevPage || loading}
            className="h-9 px-3 border-neutral-200 hover:bg-neutral-50"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>

          {/* Page numbers - Simplified for mobile */}
          <div className="flex items-center gap-1 mx-2">
            {totalPages <= 7 ? (
              // Show all pages if 7 or fewer
              Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  disabled={loading}
                  className={`h-9 w-9 ${
                    pageNum === page 
                      ? 'bg-primary-600 text-white hover:bg-primary-700' 
                      : 'hover:bg-neutral-100'
                  }`}
                >
                  {pageNum}
                </Button>
              ))
            ) : (
              // Smart pagination for many pages
              <>
                {page > 3 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPageChange(1)}
                      disabled={loading}
                      className="h-9 w-9 hover:bg-neutral-100"
                    >
                      1
                    </Button>
                    {page > 4 && <span className="px-2 text-neutral-400">...</span>}
                  </>
                )}
                
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(page - 1 + i, totalPages))
                  if (pageNum < Math.max(1, page - 1) || pageNum > Math.min(page + 1, totalPages)) return null
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      disabled={loading}
                      className={`h-9 w-9 ${
                        pageNum === page 
                          ? 'bg-primary-600 text-white hover:bg-primary-700' 
                          : 'hover:bg-neutral-100'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  )
                })}

                {page < totalPages - 2 && (
                  <>
                    {page < totalPages - 3 && <span className="px-2 text-neutral-400">...</span>}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPageChange(totalPages)}
                      disabled={loading}
                      className="h-9 w-9 hover:bg-neutral-100"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Next page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNextPage || loading}
            className="h-9 px-3 border-neutral-200 hover:bg-neutral-50"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile page size selector */}
        <div className="flex sm:hidden items-center justify-center gap-2 text-sm text-neutral-600">
          <span>Per page:</span>
          <Select
            value={limit.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
            disabled={loading}
          >
            <SelectTrigger className="w-16 h-8 border-neutral-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
