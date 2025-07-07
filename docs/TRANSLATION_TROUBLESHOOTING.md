# Translation Troubleshooting Guide

## 🔧 **Masalah yang Diperbaiki**

### 1. **Error 403 Forbidden saat Save Translation History**

**Masalah:**
```
POST /api/translation-history 403 in 206ms
Failed to save translation history: Error: API Error: 403 Forbidden
```

**Penyebab:**
- Duplikasi authorization header di `translationHistoryAPI.create()`
- Server action menggunakan client-side cookie utilities
- Konflik antara JWT dan Bearer token format

**Solusi:**
- ✅ Menghapus duplikasi authorization header
- ✅ Menggunakan Payload API langsung di server action
- ✅ Mengganti `translationHistoryAPI.create()` dengan `payload.create()`

### 2. **TranslationInterface tidak menggunakan service layer yang baru**

**Masalah:**
- Component masih menggunakan `translateSimpleAction(inputText)` tanpa parameter
- Tidak menggunakan `translateDetailedAction` untuk detailed mode
- Duplikasi logic untuk save ke database

**Solusi:**
- ✅ Update component untuk menggunakan `translateSimpleAction(text, userId, saveToHistory)`
- ✅ Update component untuk menggunakan `translateDetailedAction(text, userId, saveToHistory)`
- ✅ Menghapus duplikasi save logic di component

### 3. **Redis Connection Error Handling**

**Masalah:**
- Redis connection error menyebabkan translation gagal
- Tidak ada fallback mechanism

**Solusi:**
- ✅ Menambahkan error handling dengan graceful degradation
- ✅ Automatic fallback ke MockRedis jika Redis tidak tersedia
- ✅ Improved connection configuration dengan timeout

### 4. **HistoryStats Component Error**

**Masalah:**
```
TypeError: Cannot read properties of undefined (reading 'map')
at HistoryStats (HistoryStats.tsx:532:76)
```

**Penyebab:**
- `stats.recentActivity` dan `stats.longestTranslation` tidak didefinisikan
- API `getStats()` tidak mengembalikan data yang dibutuhkan component

**Solusi:**
- ✅ Menambahkan null checking dengan optional chaining (`stats?.recentActivity`)
- ✅ Menambahkan fallback data untuk `recentActivity` dan `longestTranslation`
- ✅ Update API `getStats()` untuk mengembalikan data lengkap
- ✅ Generate dummy data untuk chart ketika data kosong

## 🧪 **Testing Guide**

### 1. **Test Translation dengan User Login**

```bash
# 1. Pastikan user sudah login
# 2. Buka dashboard translation
# 3. Test simple translation
# 4. Test detailed translation
# 5. Check database untuk translation history
```

### 2. **Test Redis Connection**

```bash
# Check Redis status
redis-cli ping

# If Redis not running, start it:
redis-server
# atau dengan Docker:
docker run -d -p 6379:6379 redis:alpine
```

### 3. **Test Database Connection**

```bash
# Check MongoDB connection
# Pastikan DATABASE_URI di .env benar
# Check Payload admin panel: http://localhost:3000/admin
```

## 🔍 **Debug Commands**

### 1. **Check Authentication**

```javascript
// Di browser console (dashboard page)
console.log('Token:', document.cookie.split(';').find(c => c.includes('auth-token')))
console.log('Customer:', document.cookie.split(';').find(c => c.includes('auth-customer')))
```

### 2. **Check Translation Service**

```javascript
// Test translation action
const result = await translateSimpleAction('hello', 'user-id', true)
console.log(result)
```

### 3. **Check Redis Cache**

```bash
# Connect to Redis CLI
redis-cli

# Check cached translations
KEYS translation:*

# Check user data
KEYS user:*

# Clear all cache (if needed)
FLUSHALL
```

## 📋 **Implementation Checklist**

### ✅ **Completed**
- [x] Fixed 403 Forbidden error
- [x] Updated TranslationInterface component
- [x] Added Redis error handling
- [x] Implemented server-side Payload API calls
- [x] Removed authorization header duplication
- [x] Added graceful degradation for Redis
- [x] Fixed HistoryStats component undefined error
- [x] Added recentActivity and longestTranslation data
- [x] Improved error handling in dashboard components

### 🔄 **Next Steps**
- [ ] Test dengan berbagai skenario user
- [ ] Monitor performance dengan Redis caching
- [ ] Add comprehensive error logging
- [ ] Implement translation analytics
- [ ] Add rate limiting untuk translation API

## 🚨 **Common Issues & Solutions**

### Issue: "ChunkLoadError: Loading chunk failed"
**Solution:** Restart Next.js development server

### Issue: "Redis connection refused"
**Solution:** Start Redis server atau gunakan mock Redis

### Issue: "Database connection failed"
**Solution:** Check DATABASE_URI dan MongoDB status

### Issue: "JWT token invalid"
**Solution:** Clear cookies dan login ulang

## 📊 **Performance Monitoring**

### Redis Cache Hit Rate
```bash
# Monitor cache performance
redis-cli info stats | grep keyspace
```

### Translation Response Time
- Simple translation: < 2 seconds
- Detailed translation: < 5 seconds
- Cached translation: < 100ms

### Database Performance
- Translation history save: < 500ms
- User history fetch: < 1 second

## 🔐 **Security Considerations**

1. **Authentication:**
   - JWT tokens stored in httpOnly cookies
   - Automatic token refresh
   - Secure cookie settings in production

2. **Authorization:**
   - User can only access their own data
   - Proper access control in Payload collections
   - Server-side validation

3. **Data Protection:**
   - Input sanitization
   - Rate limiting
   - Error message sanitization

## 📝 **Logging Strategy**

### Development
```javascript
console.log('Translation request:', { text, mode, userId })
console.log('Cache hit:', fromCache)
console.log('Processing time:', processingTime)
```

### Production
```javascript
// Use structured logging
logger.info('translation_completed', {
  userId,
  mode,
  fromCache,
  processingTime,
  characterCount: text.length
})
```
