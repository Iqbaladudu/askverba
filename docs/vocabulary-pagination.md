# Vocabulary Pagination Implementation

## Overview

Implementasi pagination untuk halaman Vocabulary Box di AskVerba untuk meningkatkan performa dan user experience saat mengelola koleksi vocabulary yang besar.

## Fitur Utama

### 1. Server-Side Pagination
- **Pagination di backend**: Data dipaginasi di level database untuk performa optimal
- **Configurable page size**: 10, 20, 50, atau 100 items per halaman
- **Smart loading**: Hanya memuat data yang diperlukan untuk halaman aktif

### 2. Search Integration
- **Debounced search**: Search dengan delay 500ms untuk mengurangi API calls
- **Server-side filtering**: Search dilakukan di database, bukan di frontend
- **Auto reset page**: Kembali ke halaman 1 saat melakukan pencarian baru

### 3. User Interface
- **Responsive pagination controls**: Bekerja baik di desktop dan mobile
- **Smart page numbering**: Menampilkan halaman yang relevan dengan ellipsis
- **Loading states**: Indikator loading saat mengubah halaman atau page size
- **Results counter**: Menampilkan "Showing X to Y of Z words"

## Implementasi Teknis

### 1. Backend Service (`vocabularyService.ts`)

```typescript
export async function getUserVocabularyWithOptions(
  userId: string,
  options: {
    page?: number
    limit?: number
    search?: string
    status?: string
    difficulty?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}
): Promise<VocabularyResponse>
```

**Fitur:**
- Pagination dengan `page` dan `limit`
- Search di multiple fields (word, translation, definition)
- Filtering berdasarkan status dan difficulty
- Sorting yang configurable

### 2. Frontend Hook (`useVocabulary`)

```typescript
export function useVocabulary(options?: {
  page?: number
  limit?: number
  search?: string
  status?: string
  difficulty?: string
})
```

**Fitur:**
- Reactive pagination state
- Auto-refetch saat options berubah
- Optimized dependency array untuk mencegah infinite re-renders
- Built-in functions untuk mengubah halaman dan page size

### 3. Pagination Component (`VocabularyPagination.tsx`)

```typescript
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
```

**Fitur:**
- Smart page number display dengan ellipsis
- First/Previous/Next/Last navigation
- Page size selector
- Disabled states saat loading

### 4. Debounced Search (`useDebounce.ts`)

```typescript
export function useDebounce<T>(value: T, delay: number): T
```

**Fitur:**
- Generic debounce hook
- Configurable delay
- Automatic cleanup

## User Experience

### 1. Navigation Controls
- **First Page**: Double chevron left (⏪)
- **Previous Page**: Single chevron left (◀️)
- **Page Numbers**: Clickable page numbers dengan smart display
- **Next Page**: Single chevron right (▶️)
- **Last Page**: Double chevron right (⏩)

### 2. Page Size Options
- 10 words per page (untuk review detail)
- 20 words per page (default, balance antara performa dan usability)
- 50 words per page (untuk scanning cepat)
- 100 words per page (untuk power users)

### 3. Search Behavior
- **Real-time typing**: User bisa mengetik tanpa delay
- **Debounced API calls**: API dipanggil 500ms setelah user berhenti mengetik
- **Auto page reset**: Kembali ke halaman 1 saat search term berubah
- **Clear feedback**: Menampilkan "No words found" jika tidak ada hasil

### 4. Loading States
- **Skeleton loading**: Saat initial load
- **Button disabled states**: Saat pagination sedang loading
- **Smooth transitions**: Tidak ada flickering saat mengubah halaman

## Performance Benefits

### 1. Database Level
- **Efficient queries**: Menggunakan `limit` dan `offset` di database
- **Indexed searches**: Search pada field yang ter-index
- **Reduced data transfer**: Hanya mengirim data yang diperlukan

### 2. Frontend Level
- **Reduced memory usage**: Tidak menyimpan semua data di memory
- **Faster rendering**: Render hanya items yang visible
- **Optimized re-renders**: Smart dependency management

### 3. Network Level
- **Smaller payloads**: Response size lebih kecil
- **Debounced requests**: Mengurangi jumlah API calls
- **Cached pagination info**: Metadata pagination di-cache

## Usage Examples

### Basic Usage
```typescript
// Default pagination (page 1, 20 items)
const { vocabulary, pagination, changePage } = useVocabulary()

// With custom options
const { vocabulary, pagination } = useVocabulary({
  page: 2,
  limit: 50,
  search: 'hello'
})
```

### Page Navigation
```typescript
// Change page
changePage(3)

// Change page size (resets to page 1)
changePageSize(50)

// Search (resets to page 1)
setSearchTerm('vocabulary')
```

## Configuration

### Default Settings
- **Default page size**: 20 items
- **Search debounce**: 500ms
- **Max visible pages**: 5 (dengan ellipsis)
- **Page size options**: [10, 20, 50, 100]

### Customization
Settings dapat diubah di:
- `VocabularyList.tsx`: Default page size dan debounce delay
- `VocabularyPagination.tsx`: Page size options dan max visible pages
- `vocabularyService.ts`: Default limit dan sort order

## Future Enhancements

1. **Infinite Scroll**: Sebagai alternatif pagination
2. **Virtual Scrolling**: Untuk handling dataset yang sangat besar
3. **Prefetching**: Pre-load halaman berikutnya
4. **URL State**: Sync pagination state dengan URL
5. **Keyboard Navigation**: Arrow keys untuk navigasi halaman
