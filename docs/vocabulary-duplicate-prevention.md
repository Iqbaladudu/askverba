# Vocabulary Duplicate Prevention

## Overview

Implementasi pencegahan duplikat kosakata di AskVerba untuk memastikan setiap pengguna tidak memiliki kata yang sama dalam koleksi vocabulary mereka.

## Implementasi

### 1. Backend Validation (PayloadCMS Hook)

**File**: `src/collections/Vocabulary.ts`

Menggunakan `beforeValidate` hook untuk memeriksa duplikat sebelum data disimpan:

```typescript
beforeValidate: [
  async ({ data, operation, req, originalDoc }) => {
    // Prevent duplicate vocabulary entries for the same customer
    if (operation === 'create' || (operation === 'update' && data.word)) {
      const payload = req.payload
      
      // Normalize the word for comparison (lowercase, trim)
      const normalizedWord = data.word?.toLowerCase().trim()
      
      if (!normalizedWord || !data.customer) {
        return data
      }

      // Build query to check for existing vocabulary
      const baseQuery = {
        customer: { equals: data.customer },
        word: { equals: normalizedWord },
        sourceLanguage: { equals: data.sourceLanguage || 'English' },
        targetLanguage: { equals: data.targetLanguage || 'Indonesian' },
      }

      // For updates, exclude the current document
      const whereQuery = operation === 'update' && originalDoc?.id 
        ? {
            and: [baseQuery, { id: { not_equals: originalDoc.id } }]
          }
        : baseQuery

      try {
        const existingVocabulary = await payload.find({
          collection: 'vocabulary',
          where: whereQuery,
          limit: 1,
        })

        if (existingVocabulary.docs.length > 0) {
          const existing = existingVocabulary.docs[0]
          throw new Error(
            `Vocabulary "${data.word}" already exists for this language pair (${data.sourceLanguage || 'English'} → ${data.targetLanguage || 'Indonesian'}). ` +
              `Existing entry: "${existing.word}" → "${existing.translation}"`,
          )
        }

        // Normalize the word in data for consistent storage
        data.word = normalizedWord
      } catch (error) {
        // Re-throw validation errors
        if (error instanceof Error && error.message.includes('already exists')) {
          throw error
        }
        // Log other errors but don't block the operation
        console.error('Error checking for duplicate vocabulary:', error)
      }
    }
    
    return data
  },
],
```

### 2. Kriteria Duplikat

Vocabulary dianggap duplikat jika memiliki kombinasi yang sama dari:
- `customer` (ID pengguna)
- `word` (kata yang dinormalisasi - lowercase dan trim)
- `sourceLanguage` (bahasa sumber, default: 'English')
- `targetLanguage` (bahasa target, default: 'Indonesian')

### 3. Normalisasi Kata

- Kata diubah menjadi lowercase
- Whitespace di awal dan akhir dihapus
- Normalisasi dilakukan saat validasi dan penyimpanan

### 4. Frontend Error Handling

**File**: `src/hooks/usePayloadData.ts`

```typescript
const addWord = useCallback(
  async (data: any) => {
    if (!customer?.id) return

    try {
      const { createVocabularyEntry } = await import('@/lib/services/vocabularyService')
      const response = await createVocabularyEntry(customer.id, data)
      refetchVocabulary() // Refresh data
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add word'
      
      // Check if it's a duplicate error and provide better messaging
      if (errorMessage.includes('already exists')) {
        const duplicateError = new Error(errorMessage)
        duplicateError.name = 'DuplicateVocabularyError'
        setError(errorMessage)
        throw duplicateError
      }
      
      setError(errorMessage)
      throw err
    }
  },
  [customer?.id, refetchVocabulary],
)
```

### 5. User Experience

**Single Word Save** (`TranslationInterface.tsx`):
```typescript
} catch (error) {
  console.error('Save vocabulary error:', error)
  
  // Handle duplicate vocabulary error specifically
  if (error instanceof Error && error.message.includes('already exists')) {
    toast.error(`Word "${word}" is already in your vocabulary`, {
      description: 'This word has been saved before. Check your vocabulary list.',
      duration: 5000,
    })
  } else {
    toast.error('Failed to save to vocabulary')
  }
}
```

**Batch Save** (Multiple words):
```typescript
const savedWords: string[] = []
const duplicateWords: string[] = []
const failedWords: string[] = []

for (const item of vocabularyItems) {
  try {
    await createWord({...})
    savedWords.push(item.word)
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      duplicateWords.push(item.word)
    } else {
      failedWords.push(item.word)
    }
  }
}

// Provide detailed feedback
if (savedWords.length > 0) {
  toast.success(`Saved ${savedWords.length} new words to vocabulary!`)
}

if (duplicateWords.length > 0) {
  toast.info(`${duplicateWords.length} words were already in your vocabulary: ${duplicateWords.join(', ')}`, {
    duration: 6000,
  })
}

if (failedWords.length > 0) {
  toast.error(`Failed to save ${failedWords.length} words: ${failedWords.join(', ')}`)
}
```

### 6. API Error Handling

**File**: `src/lib/api/error-handler.ts`

```typescript
// Handle vocabulary duplicate errors
if (error instanceof Error && error.message.includes('already exists')) {
  return NextResponse.json(
    {
      error: error.message,
      code: ErrorCode.VALIDATION_ERROR,
      details: 'Duplicate vocabulary entry',
      timestamp: new Date().toISOString(),
      path,
      requestId,
    },
    { status: 409 },
  )
}
```

## Keuntungan

1. **Data Integrity**: Mencegah duplikat di level database
2. **User Experience**: Feedback yang jelas tentang kata yang sudah ada
3. **Performance**: Validasi efisien dengan query yang optimal
4. **Consistency**: Normalisasi kata untuk perbandingan yang konsisten
5. **Flexibility**: Mendukung update tanpa konflik dengan data yang sama

## Testing

Untuk menguji implementasi:

1. Coba simpan kata yang sama dua kali
2. Coba simpan kata dengan case yang berbeda (uppercase/lowercase)
3. Coba simpan kata dengan whitespace tambahan
4. Coba batch save dengan beberapa kata duplikat
5. Coba update kata yang sudah ada

## Catatan

- Validasi hanya berlaku per customer (pengguna)
- Kata yang sama bisa disimpan oleh pengguna yang berbeda
- Normalisasi mempertahankan konsistensi data
- Error message memberikan informasi detail tentang duplikat yang ditemukan
