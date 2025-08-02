/**
 * Data Table Component
 * Reusable table with sorting, filtering, and pagination
 */

import React from 'react'
import { cn } from '@/core/utils'
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
  dataIndex?: string
  render?: (value: unknown, record: T, index: number) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  className?: string
  headerClassName?: string
  cellClassName?: string
}

// Filter definition
export interface DataTableFilter {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'number'
  options?: Array<{ label: string; value: string | number }>
  placeholder?: string
}

// Sort definition
export interface DataTableSort {
  key: string
  direction: 'asc' | 'desc'
}

// Pagination definition
export interface DataTablePagination {
  current: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
  pageSizeOptions?: number[]
}

// Action definition
export interface DataTableAction<T = unknown> {
  key: string
  label: string
  icon?: React.ReactNode
  onClick: (record: T, index: number) => void
  disabled?: (record: T) => boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

// Main props
export interface DataTableProps<T = unknown> {
  data: T[]
  columns: DataTableColumn<T>[]
  loading?: boolean
  pagination?: DataTablePagination
  filters?: DataTableFilter[]
  actions?: DataTableAction<T>[]
  rowSelection?: {
    selectedRowKeys: string[]
    onChange: (selectedRowKeys: string[], selectedRows: T[]) => void
    getCheckboxProps?: (record: T) => { disabled?: boolean }
  }
  expandable?: {
    expandedRowRender: (record: T, index: number) => React.ReactNode
    expandedRowKeys?: string[]
    onExpand?: (expanded: boolean, record: T) => void
  }
  scroll?: {
    x?: string | number
    y?: string | number
  }
  size?: 'default' | 'small' | 'large'
  bordered?: boolean
  showHeader?: boolean
  sticky?: boolean
  className?: string
  tableClassName?: string
  emptyText?: string
  onSort?: (sort: DataTableSort | null) => void
  onFilter?: (filters: Record<string, unknown>) => void
  onRefresh?: () => void
  onExport?: () => void
}

/**
 * DataTable Component
 */
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  pagination,
  filters,
  actions,
  rowSelection,
  expandable,
  scroll,
  size = 'default',
  bordered = false,
  showHeader = true,
  sticky = false,
  className,
  tableClassName,
  emptyText = 'No data available',
  onSort,
  onFilter,
  onRefresh,
  onExport,
}: DataTableProps<T>) {
  const [currentSort, setCurrentSort] = React.useState<DataTableSort | null>(null)
  const [currentFilters, setCurrentFilters] = React.useState<Record<string, unknown>>({})
  const [expandedRows, setExpandedRows] = React.useState<string[]>([])

  // Handle sorting
  const handleSort = (key: string) => {
    let newSort: DataTableSort | null = null
    
    if (currentSort?.key === key) {
      if (currentSort.direction === 'asc') {
        newSort = { key, direction: 'desc' }
      } else {
        newSort = null // Remove sort
      }
    } else {
      newSort = { key, direction: 'asc' }
    }
    
    setCurrentSort(newSort)
    onSort?.(newSort)
  }

  // Handle filter change
  const handleFilterChange = (key: string, value: unknown) => {
    const newFilters = { ...currentFilters, [key]: value }
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key]
    }
    setCurrentFilters(newFilters)
    onFilter?.(newFilters)
  }

  // Handle row expansion
  const handleExpand = (record: T) => {
    const key = String(record.id || record.key)
    const newExpandedRows = expandedRows.includes(key)
      ? expandedRows.filter(k => k !== key)
      : [...expandedRows, key]
    
    setExpandedRows(newExpandedRows)
    expandable?.onExpand?.(!expandedRows.includes(key), record)
  }

  // Render sort icon
  const renderSortIcon = (column: DataTableColumn<T>) => {
    if (!column.sortable) return null
    
    const isActive = currentSort?.key === column.key
    const direction = currentSort?.direction
    
    if (isActive) {
      return direction === 'asc' ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : (
        <ArrowDown className="ml-2 h-4 w-4" />
      )
    }
    
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
  }

  // Render cell content
  const renderCell = (column: DataTableColumn<T>, record: T, index: number) => {
    if (column.render) {
      return column.render(record[column.dataIndex || column.key], record, index)
    }
    
    const value = record[column.dataIndex || column.key]
    
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">-</span>
    }
    
    if (typeof value === 'boolean') {
      return <Badge variant={value ? 'default' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>
    }
    
    return String(value)
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {filters && (
          <div className="flex gap-4">
            {filters.map((filter) => (
              <Skeleton key={filter.key} className="h-10 w-48" />
            ))}
          </div>
        )}
        <div className="rounded-md border">
          <Table>
            {showHeader && (
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key}>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
            )}
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters and Actions */}
      {(filters || onRefresh || onExport) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {filters && (
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <div key={filter.key} className="min-w-48">
                  {filter.type === 'text' && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
                        value={String(currentFilters[filter.key] || '')}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  )}
                  {filter.type === 'select' && (
                    <Select
                      value={String(currentFilters[filter.key] || '')}
                      onValueChange={(value) => handleFilterChange(filter.key, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All {filter.label}</SelectItem>
                        {filter.options?.map((option) => (
                          <SelectItem key={String(option.value)} value={String(option.value)}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {(onRefresh || onExport) && (
            <div className="flex gap-2">
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              )}
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table className={tableClassName}>
          {showHeader && (
            <TableHeader className={sticky ? 'sticky top-0 bg-background' : ''}>
              <TableRow>
                {rowSelection && (
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={rowSelection.selectedRowKeys.length === data.length && data.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          rowSelection.onChange(
                            data.map((item, index) => String(item.id || item.key || index)),
                            data
                          )
                        } else {
                          rowSelection.onChange([], [])
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                )}
                {expandable && <TableHead className="w-12" />}
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      column.headerClassName,
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.sortable && 'cursor-pointer select-none hover:bg-muted/50'
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center">
                      {column.title}
                      {renderSortIcon(column)}
                    </div>
                  </TableHead>
                ))}
                {actions && actions.length > 0 && (
                  <TableHead className="w-24 text-center">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (rowSelection ? 1 : 0) +
                    (expandable ? 1 : 0) +
                    (actions && actions.length > 0 ? 1 : 0)
                  }
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              data.map((record, index) => (
                <React.Fragment key={String(record.id || record.key || index)}>
                  <TableRow className={size === 'small' ? 'h-8' : size === 'large' ? 'h-16' : 'h-12'}>
                    {rowSelection && (
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={rowSelection.selectedRowKeys.includes(String(record.id || record.key || index))}
                          onChange={(e) => {
                            const key = String(record.id || record.key || index)
                            if (e.target.checked) {
                              rowSelection.onChange([...rowSelection.selectedRowKeys, key], [...data])
                            } else {
                              rowSelection.onChange(
                                rowSelection.selectedRowKeys.filter(k => k !== key),
                                data.filter((_, i) => String(data[i].id || data[i].key || i) !== key)
                              )
                            }
                          }}
                          disabled={rowSelection.getCheckboxProps?.(record)?.disabled}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                    )}
                    {expandable && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExpand(record)}
                        >
                          {expandedRows.includes(String(record.id || record.key)) ? '−' : '+'}
                        </Button>
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(
                          column.cellClassName,
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {renderCell(column, record, index)}
                      </TableCell>
                    ))}
                    {actions && actions.length > 0 && (
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          {actions.map((action) => (
                            <Button
                              key={action.key}
                              variant={action.variant || 'ghost'}
                              size={action.size || 'sm'}
                              onClick={() => action.onClick(record, index)}
                              disabled={action.disabled?.(record)}
                              title={action.label}
                            >
                              {action.icon}
                              {action.size !== 'icon' && action.label}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                  {expandable && expandedRows.includes(String(record.id || record.key)) && (
                    <TableRow>
                      <TableCell
                        colSpan={
                          columns.length +
                          (rowSelection ? 1 : 0) +
                          1 +
                          (actions && actions.length > 0 ? 1 : 0)
                        }
                        className="p-0"
                      >
                        <div className="p-4 bg-muted/50">
                          {expandable.expandedRowRender(record, index)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {pagination.showTotal && (
              <span>
                Showing {((pagination.current - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
                {pagination.total} entries
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {pagination.showSizeChanger && (
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) => {
                  // Handle page size change
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(pagination.pageSizeOptions || [10, 20, 50, 100]).map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Handle first page
                }}
                disabled={pagination.current === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Handle previous page
                }}
                disabled={pagination.current === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm px-2">
                Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Handle next page
                }}
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Handle last page
                }}
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
