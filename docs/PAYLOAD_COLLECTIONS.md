# PayloadCMS Collections untuk AskVerba

Dokumentasi lengkap tentang PayloadCMS collections yang diperlukan untuk website AskVerba berfungsi dengan baik.

## 📊 **Collections Overview**

### **Collections yang Sudah Ada:**
1. **Users** - Admin authentication
2. **Media** - File uploads dan media management
3. **Customers** - User authentication (name & email)

### **Collections Baru yang Ditambahkan:**

## 1. **Vocabulary Collection**
**File:** `src/collections/Vocabulary.ts`
**Tujuan:** Menyimpan kata-kata yang dipelajari user

### Fields:
- `customer` - Relationship ke customers
- `word` - Kata/frasa yang dipelajari
- `translation` - Terjemahan
- `pronunciation` - Pelafalan (IPA)
- `definition` - Definisi kata
- `example` - Contoh kalimat
- `difficulty` - Level kesulitan (easy/medium/hard)
- `status` - Status pembelajaran (new/learning/mastered)
- `tags` - Array tag untuk kategorisasi
- `practiceCount` - Jumlah latihan
- `accuracy` - Persentase akurasi
- `lastPracticed` - Tanggal terakhir berlatih
- `sourceLanguage` - Bahasa sumber
- `targetLanguage` - Bahasa target

### Access Control:
- Users hanya bisa akses vocabulary mereka sendiri
- Admin bisa akses semua data

## 2. **Translation History Collection**
**File:** `src/collections/TranslationHistory.ts`
**Tujuan:** Menyimpan riwayat terjemahan user

### Fields:
- `customer` - Relationship ke customers
- `originalText` - Teks asli
- `translatedText` - Hasil terjemahan
- `sourceLanguage` - Bahasa sumber
- `targetLanguage` - Bahasa target
- `mode` - Mode terjemahan (simple/detailed)
- `characterCount` - Jumlah karakter
- `confidence` - Tingkat kepercayaan terjemahan
- `isFavorite` - Apakah difavoritkan
- `detailedResult` - JSON hasil terjemahan detail
- `processingTime` - Waktu pemrosesan
- `aiModel` - Model AI yang digunakan

### Features:
- Auto-calculate character count
- Support untuk detailed translation results
- Favorite system
- Performance tracking

## 3. **User Progress Collection**
**File:** `src/collections/UserProgress.ts`
**Tujuan:** Tracking progress dan statistik pembelajaran user

### Fields:
#### Streak Tracking:
- `currentStreak` - Streak harian saat ini
- `longestStreak` - Streak terpanjang
- `lastActivityDate` - Tanggal aktivitas terakhir

#### Learning Statistics:
- `totalWordsLearned` - Total kata yang dipelajari
- `masteredWords` - Kata yang dikuasai
- `learningWords` - Kata yang sedang dipelajari
- `newWords` - Kata baru

#### Translation Statistics:
- `totalTranslations` - Total terjemahan
- `todayTranslations` - Terjemahan hari ini
- `thisWeekTranslations` - Terjemahan minggu ini
- `averageAccuracy` - Rata-rata akurasi

#### Study Time:
- `totalStudyTimeMinutes` - Total waktu belajar
- `todayStudyTimeMinutes` - Waktu belajar hari ini
- `averageStudyTimePerDay` - Rata-rata waktu belajar per hari

#### Level & Achievements:
- `currentLevel` - Level saat ini
- `totalAchievements` - Total pencapaian
- `experiencePoints` - Poin XP

#### Weekly Activity:
- Array data aktivitas mingguan untuk heatmap
- Tracking words learned, accuracy, study time per hari

#### Performance Metrics:
- `averageResponseTime` - Rata-rata waktu respons
- `difficultyBreakdown` - Breakdown performa per tingkat kesulitan

### Features:
- One-to-one relationship dengan customers
- Comprehensive learning analytics
- Weekly activity tracking untuk dashboard

## 4. **Learning Goals Collection**
**File:** `src/collections/LearningGoals.ts`
**Tujuan:** Menyimpan goals dan target pembelajaran user

### Fields:
- `customer` - Relationship ke customers
- `title` - Judul goal
- `description` - Deskripsi goal
- `category` - Kategori (daily/weekly/monthly/custom)
- `target` - Target angka
- `current` - Progress saat ini
- `unit` - Satuan (words/translations/minutes/days/sessions)
- `deadline` - Batas waktu
- `status` - Status (active/completed/overdue/paused)
- `priority` - Prioritas (low/medium/high)
- `isRecurring` - Apakah berulang
- `recurringPeriod` - Periode pengulangan
- `completedAt` - Tanggal selesai
- `reward` - Reward untuk penyelesaian
- `milestones` - Array milestone dengan persentase

### Features:
- Auto-update status berdasarkan progress dan deadline
- Support untuk recurring goals
- Milestone tracking
- Reward system

## 5. **User Preferences Collection**
**File:** `src/collections/UserPreferences.ts`
**Tujuan:** Menyimpan preferensi dan pengaturan user

### Fields:
#### Language Preferences:
- `preferredLanguagePair` - Pasangan bahasa favorit
- `nativeLanguage` - Bahasa asli
- `learningLanguages` - Array bahasa yang dipelajari dengan level

#### Translation Preferences:
- `defaultTranslationMode` - Mode default (simple/detailed)
- `autoSaveTranslations` - Auto-save ke history
- `autoAddToVocabulary` - Auto-add ke vocabulary

#### Learning Preferences:
- `dailyGoalWords` - Target harian vocabulary
- `dailyGoalTranslations` - Target harian terjemahan
- `studyReminderTime` - Waktu reminder belajar
- `weeklyGoalWords` - Target mingguan vocabulary

#### UI Preferences:
- `theme` - Tema (light/dark/system)
- `fontSize` - Ukuran font
- `showPronunciation` - Tampilkan pelafalan
- `enableSoundEffects` - Aktifkan sound effects

#### Notification Preferences:
- `emailNotifications` - Group pengaturan email
- `pushNotifications` - Group pengaturan push notification

#### Privacy Preferences:
- `profileVisibility` - Visibilitas profil
- `shareProgress` - Izin share progress
- `dataCollection` - Izin pengumpulan data

#### Advanced Preferences:
- `aiModelPreference` - Preferensi model AI
- `maxTranslationLength` - Panjang maksimal terjemahan

### Features:
- One-to-one relationship dengan customers
- Comprehensive user customization
- Privacy controls
- Advanced AI settings

## 6. **Achievements Collection**
**File:** `src/collections/Achievements.ts`
**Tujuan:** Sistem pencapaian dan badge

### Achievements Collection Fields:
- `title` - Judul achievement
- `description` - Deskripsi achievement
- `category` - Kategori (vocabulary/translation/streak/etc)
- `difficulty` - Tingkat kesulitan (bronze/silver/gold/platinum/diamond)
- `icon` - Nama icon Lucide
- `badgeImage` - Gambar badge
- `color` - Warna badge
- `requirements` - Group syarat pencapaian
- `rewards` - Group reward (XP, title, special feature)
- `isActive` - Status aktif
- `isHidden` - Hidden achievement
- `order` - Urutan tampilan

### User Achievements Collection Fields:
- `customer` - Relationship ke customers
- `achievement` - Relationship ke achievements
- `unlockedAt` - Tanggal unlock
- `progress` - Progress menuju achievement
- `isNotified` - Status notifikasi

### Features:
- Flexible requirement system
- Hidden achievements
- Progress tracking
- Reward system dengan XP dan unlocks

## 🔧 **Implementation Notes**

### Access Control Pattern:
Semua collections menggunakan pattern yang sama:
- Users hanya bisa akses data mereka sendiri
- Admin bisa akses semua data
- Auto-assign customer ID saat create

### Hooks:
- `beforeChange` hooks untuk auto-assignment dan validation
- Auto-calculation untuk derived fields
- Status updates berdasarkan kondisi

### Relationships:
- Semua user data terhubung ke `customers` collection
- Media relationships untuk images
- Junction table untuk many-to-many (user-achievements)

## 🚀 **Next Steps**

1. **Generate Types:** Jalankan PayloadCMS untuk generate types baru
2. **Create APIs:** Buat API endpoints untuk frontend integration
3. **Seed Data:** Buat sample achievements dan default preferences
4. **Frontend Integration:** Update dashboard components untuk menggunakan real data
5. **Testing:** Test semua collections dan relationships

## 📝 **Usage Examples**

### Creating Vocabulary Entry:
```typescript
const vocabulary = await payload.create({
  collection: 'vocabulary',
  data: {
    customer: userId,
    word: 'beautiful',
    translation: 'indah',
    difficulty: 'easy',
    status: 'new'
  }
})
```

### Tracking User Progress:
```typescript
const progress = await payload.update({
  collection: 'user-progress',
  where: { customer: { equals: userId } },
  data: {
    totalWordsLearned: { increment: 1 },
    todayTranslations: { increment: 1 }
  }
})
```

### Setting User Preferences:
```typescript
const preferences = await payload.create({
  collection: 'user-preferences',
  data: {
    customer: userId,
    defaultTranslationMode: 'detailed',
    theme: 'dark',
    dailyGoalWords: 10
  }
})
```
