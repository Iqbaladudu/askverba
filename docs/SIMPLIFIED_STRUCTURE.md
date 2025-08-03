# Simplified Folder Structure

## 🎯 **Masalah yang Ditemukan:**

### **Duplikasi & Redundansi:**
1. **core/**, **lib/**, **infrastructure/** - fungsi serupa (utilities, config, services)
2. **shared/components/** dan **components/** - komponen reusable tersebar
3. **molecules/**, **organisms/** - atomic design terlalu kompleks
4. **shared/hooks/** dan **features/*/hooks/** - hooks tersebar

### **Struktur Terlalu Kompleks:**
- Terlalu banyak nested folders
- Atomic design (atoms/molecules/organisms) tidak konsisten
- Separation of concerns berlebihan

## 🚀 **Struktur Baru yang Disederhanakan:**

```
src/
├── app/                    # Next.js App Router (tidak diubah)
│   ├── (app)/
│   ├── (payload)/
│   └── api/
│
├── features/               # Feature modules (tetap)
│   ├── auth/
│   ├── dashboard/
│   ├── practice/
│   ├── translation/
│   └── vocabulary/
│
├── components/             # Semua UI components (disederhanakan)
│   ├── ui/                # Shadcn components
│   ├── common/            # Reusable components (gabungan shared + molecules + organisms)
│   ├── layout/            # Layout components
│   └── debug/             # Debug components
│
├── utils/                  # Semua utilities (gabungan core + lib + infrastructure)
│   ├── api/               # API utilities
│   ├── auth/              # Auth utilities
│   ├── config/            # Configuration
│   ├── constants/         # Constants
│   ├── database/          # Database utilities
│   ├── hooks/             # Global hooks
│   ├── schema/            # Validation schemas
│   └── types/             # Global types
│
├── collections/           # PayloadCMS collections (tidak diubah)
├── middleware.ts          # Next.js middleware
├── payload.config.ts      # Payload config
└── payload-types.ts       # Payload types
```

## 📋 **Rencana Migrasi:**

### **1. Consolidate Utils**
- Merge `core/` + `lib/` + `infrastructure/` → `utils/`
- Organize by function, not by layer

### **2. Simplify Components**
- Merge `shared/components/` + `components/molecules/` + `components/organisms/` → `components/common/`
- Keep `components/ui/` for Shadcn
- Move layout components to `components/layout/`

### **3. Centralize Hooks**
- Move all hooks to `utils/hooks/`
- Remove feature-specific hook folders

### **4. Flatten Structure**
- Remove unnecessary nesting
- Group by function, not by type

## 🎯 **Benefits:**

1. **Simpler Navigation** - Less nested folders
2. **No Duplication** - Single source of truth for each type
3. **Easier Imports** - Predictable import paths
4. **Better DX** - Faster development experience
5. **Maintainable** - Easier to understand and modify

## ✅ **Implementation Completed:**

### **Struktur Final yang Berhasil Diterapkan:**

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # App routes
│   ├── (payload)/         # Payload admin routes
│   └── api/               # API routes
│
├── features/               # Feature modules (business logic only)
│   ├── auth/              # Authentication
│   │   ├── contexts/      # AuthContext
│   │   ├── actions.ts     # Server actions
│   │   ├── types.ts       # Auth types
│   │   └── index.ts       # Feature exports
│   ├── dashboard/         # Dashboard feature (services only)
│   ├── practice/          # Practice feature (services, types)
│   ├── translation/       # Translation feature (services, types, actions)
│   └── vocabulary/        # Vocabulary feature (services, types)
│
├── components/             # All UI Components (organized by feature)
│   ├── ui/                # Shadcn components
│   ├── common/            # Reusable components (merged from shared + molecules + organisms)
│   ├── layout/            # Layout components
│   ├── debug/             # Debug components
│   ├── home/              # Home page components
│   ├── providers/         # Context providers
│   ├── auth/              # Auth UI components (moved from features/auth/components)
│   ├── dashboard/         # Dashboard UI components (moved from features/dashboard/components)
│   ├── practice/          # Practice UI components (moved from features/practice/components)
│   ├── translation/       # Translation UI components (moved from features/translation/components)
│   └── vocabulary/        # Vocabulary UI components (moved from features/vocabulary/components)
│
├── utils/                  # All utilities (merged from core + lib + infrastructure)
│   ├── ai/                # AI services
│   ├── api/               # API utilities
│   ├── auth/              # Auth utilities (from lib)
│   ├── config/            # Configuration (from core)
│   ├── constants/         # Constants (from core)
│   ├── database/          # Database utilities (from infrastructure)
│   ├── hooks/             # All hooks (merged from shared + features)
│   ├── schema/            # Validation schemas (from core)
│   ├── types/             # Global types (from core)
│   ├── index.ts           # Main utils export
│   └── logger.ts          # Logger utility
│
├── collections/           # PayloadCMS collections
├── middleware.ts          # Next.js middleware
├── payload.config.ts      # Payload config
└── payload-types.ts       # Payload types
```

### **Perubahan Utama:**

#### **1. Consolidation (Penggabungan):**
- ✅ **core/ + lib/ + infrastructure/** → **utils/**
- ✅ **shared/components/ + molecules/ + organisms/** → **components/common/**
- ✅ **All hooks from features/** → **utils/hooks/**

#### **2. Elimination (Penghapusan):**
- ❌ **Atomic design complexity** (atoms/molecules/organisms)
- ❌ **Duplicate folders** (core, lib, infrastructure, shared)
- ❌ **Feature-specific hook folders**
- ❌ **Feature-specific component folders**
- ❌ **Empty directories**

#### **3. Import Path Updates:**
- ✅ **@/core/*** → **@/utils/***
- ✅ **@/lib/*** → **@/utils/auth/***
- ✅ **@/infrastructure/*** → **@/utils/***
- ✅ **@/shared/hooks** → **@/utils/hooks**
- ✅ **@/components/molecules** → **@/components/common**
- ✅ **@/components/organisms** → **@/components/common**
- ✅ **@/features/*/components** → **@/components/***

### **Hasil Akhir:**

🎉 **Struktur folder src berhasil disederhanakan dengan:**
- **Tidak ada duplikasi** folder atau fungsi
- **Tidak ada folder kosong**
- **Import paths yang konsisten** dan mudah dipahami
- **Kode tetap berfungsi** seperti sebelumnya
- **Navigasi yang lebih mudah** dengan struktur yang flat
- **Maintenance yang lebih simple** dengan single source of truth
