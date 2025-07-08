# Optimasi Hook useVocabulary - Journey & Final Solution

## Masalah Awal yang Diperbaiki

Hook `useVocabulary` sebelumnya menyebabkan halaman terus menerus refresh karena beberapa masalah:

1. **Object Reference Instability**: Parameter `options` di dependency array `useCallback` menyebabkan fungsi `fetchVocabulary` dibuat ulang setiap kali karena object `options` selalu dianggap berbeda meskipun isinya sama.

2. **Multiple Duplicate Calls**: Hook dipanggil di beberapa komponen dengan options yang berbeda, menyebabkan multiple re-renders dan API calls yang tidak perlu.

3. **Complex Cache Logic**: Implementasi cache yang kompleks menjadi sumber masalah baru.

## Solusi yang Diterapkan

### 1. Memoization yang Stabil
```typescript
// Memoize options dengan cara yang stabil
const optionsString = useMemo(() => {
  const sortedOptions = Object.keys(options)
    .sort()
    .reduce((acc, key) => {
      acc[key] = options[key]
      return acc
    }, {} as Record<string, unknown>)
  return JSON.stringify(sortedOptions)
}, [options])
```

### 2. Duplicate Call Prevention
```typescript
// Gunakan ref untuk mencegah duplicate calls
const fetchingRef = useRef(false)
const lastFetchRef = useRef<string>('')

// Check jika request yang sama sedang berjalan
if (lastFetchRef.current === cacheKey && fetchingRef.current) {
  console.log('useVocabulary: Same request already in progress, skipping...')
  return
}
```

### 3. Simple Caching
```typescript
// Cache sederhana untuk mencegah duplicate requests
const vocabularyCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds

// Check cache sebelum API call
const cached = vocabularyCache.get(cacheKey)
if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
  // Gunakan data dari cache
  return
}
```

### 4. Debouncing
```typescript
// Debounce fetch untuk mencegah excessive API calls
useEffect(() => {
  const timeoutId = setTimeout(() => {
    fetchVocabulary()
  }, 200) // 200ms debounce

  return () => clearTimeout(timeoutId)
}, [fetchVocabulary])
```

### 5. Hook Wrapper yang Optimal
```typescript
// Hook wrapper untuk list dengan caching yang lebih baik
export function useOptimizedVocabulary(filters: Record<string, unknown> = {}) {
  const filtersKey = useMemo(() => {
    const sortedKeys = Object.keys(filters).sort()
    const stableFilters: Record<string, unknown> = {}
    sortedKeys.forEach(key => {
      const value = filters[key]
      // Hanya include nilai yang tidak kosong
      if (value !== undefined && value !== null && value !== '') {
        stableFilters[key] = value
      }
    })
    return JSON.stringify(stableFilters)
  }, [filters])

  const memoizedFilters = useMemo(() => {
    return JSON.parse(filtersKey)
  }, [filtersKey])

  return useVocabulary(memoizedFilters)
}
```

## Komponen yang Diupdate

1. **VocabularyList**: Menggunakan `useOptimizedVocabulary` instead of `useVocabulary`
2. **VocabularyFilters**: Menggunakan `useOptimizedVocabulary` untuk stats
3. **VocabularyHeader**: Menggunakan `useOptimizedVocabulary` untuk stats

## Perbaikan Masalah Looping

### Masalah Cache Looping
Setelah implementasi awal, ditemukan masalah cache yang menyebabkan looping berlebihan dengan log "useVocabulary: Using cached data" yang terus muncul.

### Masalah Maximum Update Depth
Kemudian muncul error "Maximum update depth exceeded" karena infinite loop di useEffect dengan dependency yang tidak stabil.

### Solusi Looping:
1. **Menghilangkan Log Berlebihan**: Menghapus log yang tidak perlu untuk mengurangi noise
2. **Optimasi useEffect**: Memindahkan logika cache ke dalam useEffect untuk mencegah re-render loop
3. **Better Dependency Management**: Menggunakan dependency yang lebih tepat untuk mencegah infinite loops
4. **Menghapus fetchVocabulary dari useCallback**: Mengganti dengan logika fetch langsung di useEffect
5. **Refetch Function**: Membuat fungsi refetch yang aman untuk operasi CRUD

```typescript
// Perbaikan useEffect untuk mencegah infinite loops
useEffect(() => {
  if (!customer?.id) {
    setLoading(false)
    return
  }

  const cacheKey = `${customer.id}-${optionsString}`
  const cached = vocabularyCache.get(cacheKey)

  // Gunakan cache langsung di useEffect
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    const { vocabResponse, statsData } = cached.data
    setVocabulary(vocabResponse.docs || [])
    setStats(statsData)
    // ... set other states
    return
  }

  // Fetch logic langsung di useEffect tanpa useCallback
  const performFetch = async () => {
    if (fetchingRef.current) return

    try {
      fetchingRef.current = true
      setLoading(true)

      // Import dan panggil API
      const { getUserVocabulary, getVocabularyStats } = await import('@/lib/services/vocabularyService')
      const [vocabResponse, statsData] = await Promise.all([
        getUserVocabulary(customer.id, options),
        getVocabularyStats(customer.id),
      ])

      // Cache dan set state
      vocabularyCache.set(cacheKey, { data: { vocabResponse, statsData }, timestamp: Date.now() })
      setVocabulary(vocabResponse.docs || [])
      setStats(statsData)
      // ... set other states
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vocabulary')
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }

  const timeoutId = setTimeout(performFetch, 200)
  return () => clearTimeout(timeoutId)
}, [customer?.id, optionsString]) // Hanya dependency yang stabil
```

## Hasil Optimasi

- ✅ Mengurangi re-renders yang tidak perlu
- ✅ Mencegah duplicate API calls
- ✅ Caching sederhana untuk performa yang lebih baik
- ✅ Debouncing untuk mengurangi excessive requests
- ✅ Stable object references untuk dependency arrays
- ✅ **Mengatasi masalah cache looping**
- ✅ **Mengurangi log spam yang berlebihan**
- ✅ **Memperbaiki "Maximum update depth exceeded" error**
- ✅ **Dependency management yang lebih aman**
- ✅ **Enhanced debugging untuk tracking empty responses**
- ✅ **Active request tracking untuk mencegah race conditions**

## Penggunaan

```typescript
// Untuk list vocabulary dengan filters
const { vocabulary, loading, error } = useOptimizedVocabulary(filters)

// Untuk stats saja
const { stats } = useOptimizedVocabulary({ limit: 1 })
```

## 🔍 **Debugging Empty VocabResponse**

### Enhanced Logging
Telah ditambahkan logging yang komprehensif untuk tracking masalah empty response:

```typescript
// Logs yang akan muncul di console:
🔧 Options memoized: { original, sorted, stringified }
🔍 useVocabulary useEffect triggered: { customerId, optionsString, cacheKey, hasCached, cacheAge, currentFetching }
✅ Using cached data: X items
🚀 Starting fresh fetch for: cacheKey with options: {...}
📦 Fresh VocabResponse: { docsCount, totalDocs, fromCache, hasData }
📊 Fresh StatsData: {...}
🔄 Reusing existing request for: cacheKey
❌ Invalid vocabResponse: {...}
```

### Troubleshooting Steps
1. **Check Console Logs**: Lihat pattern log di browser console
2. **Verify Options**: Pastikan options tidak berubah unexpectedly
3. **Cache Analysis**: Perhatikan cache age dan validity
4. **Request Tracking**: Monitor active requests dan race conditions

### Common Issues & Solutions
- **Empty Response**: Check if options mengandung filter yang terlalu restrictive
- **Race Conditions**: Simplified useEffect dengan isMounted flag
- **State Updates**: Detailed logging untuk tracking state changes
- **Multiple Calls**: Debounced fetch dengan cleanup

### Final Simplified Solution
Setelah debugging, implementasi disederhanakan menjadi:

```typescript
// Simplified useEffect yang fokus pada masalah utama
useEffect(() => {
  let isMounted = true

  const fetchData = async () => {
    if (!customer?.id) return

    try {
      setLoading(true)

      const [vocabResponse, statsData] = await Promise.all([
        getUserVocabulary(customer.id, options),
        getVocabularyStats(customer.id),
      ])

      if (isMounted) {
        setVocabulary(vocabResponse?.docs || [])
        setStats(statsData || null)
        // ... set pagination
      }
    } catch (err) {
      if (isMounted) {
        setError(err.message)
        setVocabulary([])
      }
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }

  const timeoutId = setTimeout(fetchData, 300)

  return () => {
    isMounted = false
    clearTimeout(timeoutId)
  }
}, [customer?.id, optionsString]) // Fixed: removed options to prevent infinite re-renders
```

## 🔄 **Perbaikan Auto-Refresh Issue**

### Masalah Auto-Refresh
Setelah implementasi simplified, muncul masalah halaman yang selalu refresh otomatis karena dependency array yang tidak stabil.

### Root Cause
```typescript
// MASALAH: options object berubah setiap render
}, [customer?.id, optionsString, options]) // ❌ options menyebabkan infinite re-renders
```

### Solusi
```typescript
// SOLUSI: Gunakan parsedOptions dari optionsString yang sudah memoized
const fetchData = async () => {
  // Parse options dari string yang sudah di-memoize
  const parsedOptions = JSON.parse(optionsString)

  const [vocabResponse, statsData] = await Promise.all([
    getUserVocabulary(customer.id, parsedOptions), // ✅ Gunakan parsedOptions
    getVocabularyStats(customer.id),
  ])
}

// ✅ Dependency array yang stabil
}, [customer?.id, optionsString]) // Hanya dependency yang stabil
```

### Key Changes
1. **Removed `options` from dependency array** - Mencegah infinite re-renders
2. **Parse options inside useEffect** - Gunakan `JSON.parse(optionsString)`
3. **Stable dependencies only** - Hanya `customer?.id` dan `optionsString`

## 🗑️ **Penghapusan Cache Implementation**

### Alasan Penghapusan Cache
Setelah berbagai troubleshooting, cache implementation dihapus karena:

1. **Kompleksitas yang tidak perlu** - Cache logic menambah complexity tanpa benefit signifikan
2. **Source of bugs** - Cache menjadi sumber masalah looping dan empty responses
3. **Debugging difficulty** - Sulit untuk debug masalah karena cache interference
4. **Simple is better** - Direct API calls lebih predictable dan reliable

### Implementasi Final (No Cache)
```typescript
// ✅ Simple, direct API calls tanpa cache
const fetchData = async () => {
  if (!customer?.id) return

  const parsedOptions = JSON.parse(optionsString)

  const [vocabResponse, statsData] = await Promise.all([
    getUserVocabulary(customer.id, parsedOptions),
    getVocabularyStats(customer.id),
  ])

  if (isMounted) {
    setVocabulary(vocabResponse?.docs || [])
    setStats(statsData || null)
    setPagination({
      // ... pagination data
      fromCache: false, // No cache
    })
  }
}
```

### Benefits
- ✅ **Predictable behavior** - Selalu fetch fresh data
- ✅ **Easier debugging** - Tidak ada cache interference
- ✅ **Simpler codebase** - Mengurangi complexity
- ✅ **Reliable data** - Selalu up-to-date

## Catatan

- Debounce delay: 300ms (untuk stability dan mengurangi API calls)
- Hook masih backward compatible dengan `useVocabulary` yang lama
- Enhanced debugging untuk troubleshooting
- **No cache implementation** - Direct API calls untuk reliability
- **Fixed auto-refresh issue** dengan stable dependency management
