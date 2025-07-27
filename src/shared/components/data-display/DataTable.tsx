/**
 * Data Table Component
 * Reusable table with sorting, filtering, and pagination
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'

// Column definition
export interface DataTableColumn<T = unknown> {
  key: string
  title: string
  dataIndex?: keyof T
  render?: (value: unknown, record: T, index: number) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  className?: string
}

// Sort configuration
export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

// Filter configuration
export interface FilterConfig {
  key: string
  value: unknown
  operator?: 'eq' | 'ne' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt'
}

// Pagination configuration
export interface PaginationConfig {
  current: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  pageSizeOptions?: number[]
}

// Data table props
export interface DataTableProps<T = unknown> {
  data: T[]
  columns: DataTableColumn<T>[]
  loading?: boolean
  pagination?: PaginationConfig
  sortConfig?: SortConfig
  filters?: FilterConfig[]
  searchable?: boolean
  searchPlaceholder?: string
  selectable?: boolean
  selectedRows?: string[]
  rowKey?: keyof T | ((record: T) => string)
  emptyText?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  bordered?: boolean
  striped?: boolean
  hoverable?: boolean
  sticky?: boolean
  actions?: React.ReactNode
  onSort?: (sortConfig: SortConfig) => void
  onFilter?: (filters: FilterConfig[]) => void
  onSearch?: (searchTerm: string) => void
  onPaginationChange?: (page: number, pageSize: number) => void
  onSelectionChange?: (selectedRows: string[]) => void
  onRowClick?: (record: T, index: number) => void
  onRefresh?: () => void
  onExport?: () => void
}

/**
 * Main data table component
 */
export function DataTable<T = unknown>({
  data,
  columns,
  loading = false,
  pagination,
  sortConfig,
  filters = [],
  searchable = false,
  searchPlaceholder = 'Search...',
  selectable = false,
  selectedRows = [],
  rowKey = 'id',
  emptyText = 'No data available',
  className,
  size = 'md',
  bordered = false,
  striped = false,
  hoverable = true,
  sticky = false,
  actions,
  onSort,
  onFilter,
  onSearch,
  onPaginationChange,
  onSelectionChange,
  onRowClick,
  onRefresh,
  onExport,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [localFilters, setLocalFilters] = React.useState<FilterConfig[]>(filters)

  // Get row key
  const getRowKey = React.useCallback((record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record)
    }
    return String(record[rowKey] || index)
  }, [rowKey])

  // Handle search
  const handleSearch = React.useCallback((value: string) => {
    setSearchTerm(value)
    onSearch?.(value)
  }, [onSearch])

  // Handle sort
  const handleSort = React.useCallback((key: string) => {
    if (!onSort) return

    const direction = sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    onSort({ key, direction })
  }, [sortConfig, onSort])

  // Handle selection
  const handleSelectAll = React.useCallback((checked: boolean) => {
    if (!onSelectionChange) return

    if (checked) {
      const allKeys = data.map((record, index) => getRowKey(record, index))
      onSelectionChange(allKeys)
    } else {
      onSelectionChange([])
    }
  }, [data, getRowKey, onSelectionChange])

  const handleSelectRow = React.useCallback((key: string, checked: boolean) => {
    if (!onSelectionChange) return

    if (checked) {
      onSelectionChange([...selectedRows, key])
    } else {
      onSelectionChange(selectedRows.filter(k => k !== key))
    }
  }, [selectedRows, onSelectionChange])

  // Table size classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const cellPadding = {
    sm: 'px-2 py-1',
    md: 'px-3 py-2',
    lg: 'px-4 py-3',
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table header with search and actions */}
      {(searchable || actions || onRefresh || onExport) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            {searchable && (
              <div className="relative max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                <span className="sr-only">Refresh</span>
              </Button>
            )}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}
            {actions}
          </div>
        </div>
      )}

      {/* Table container */}
      <div className={cn(
        'relative overflow-auto rounded-md border',
        sticky && 'max-h-[600px]'
      )}>
        <Table className={cn(sizeClasses[size])}>
          <TableHeader className={cn(sticky && 'sticky top-0 bg-background z-10')}>
            <TableRow>
              {selectable && (
                <TableHead className={cn('w-12', cellPadding[size])}>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    cellPadding[size],
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer select-none hover:bg-muted/50',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: pagination?.pageSize || 10 }).map((_, index) => (
                <TableRow key={index}>
                  {selectable && (
                    <TableCell className={cellPadding[size]}>
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.key} className={cellPadding[size]}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className={cn('text-center text-muted-foreground', cellPadding[size])}
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              data.map((record, index) => {
                const key = getRowKey(record, index)
                const isSelected = selectedRows.includes(key)
                
                return (
                  <TableRow
                    key={key}
                    className={cn(
                      striped && index % 2 === 1 && 'bg-muted/30',
                      hoverable && 'hover:bg-muted/50',
                      isSelected && 'bg-muted',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(record, index)}
                  >
                    {selectable && (
                      <TableCell className={cellPadding[size]}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(key, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const value = column.dataIndex ? record[column.dataIndex] : null
                      const content = column.render ? column.render(value, record, index) : String(value || '')
                      
                      return (
                        <TableCell
                          key={column.key}
                          className={cn(
                            cellPadding[size],
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            column.className
                          )}
                        >
                          {content}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <DataTablePagination
          pagination={pagination}
          onPaginationChange={onPaginationChange}
        />
      )}
    </div>
  )
}

/**
 * Pagination component
 */
interface DataTablePaginationProps {
  pagination: PaginationConfig
  onPaginationChange?: (page: number, pageSize: number) => void
}

function DataTablePagination({
  pagination,
  onPaginationChange,
}: DataTablePaginationProps) {
  const { current, pageSize, total, showSizeChanger = true, pageSizeOptions = [10, 20, 50, 100] } = pagination
  const totalPages = Math.ceil(total / pageSize)

  const handlePageChange = (page: number) => {
    onPaginationChange?.(page, pageSize)
  }

  const handlePageSizeChange = (newPageSize: string) => {
    onPaginationChange?.(1, parseInt(newPageSize))
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {Math.min((current - 1) * pageSize + 1, total)} to {Math.min(current * pageSize, total)} of {total} entries
      </div>
      
      <div className="flex items-center gap-4">
        {showSizeChanger && (
          <div className="flex items-center gap-2">
            <span className="text-sm">Show</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm">entries</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={current === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            <span className="text-sm">Page</span>
            <span className="text-sm font-medium">{current}</span>
            <span className="text-sm">of</span>
            <span className="text-sm font-medium">{totalPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(current + 1)}
            disabled={current === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={current === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DataTable
