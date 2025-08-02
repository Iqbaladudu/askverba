# Feature-First Organization Structure

## 🎯 **Prinsip Utama**

**"Semua kode yang berkaitan dengan satu feature dikumpulkan dalam satu folder"**

Setiap feature akan memiliki struktur lengkap:
- Components (UI)
- Hooks (Logic)
- Services (API/Business Logic)
- Types (TypeScript)
- Utils (Helper functions)
- Contexts (State management)
- Actions (Server actions)

## 📁 **Struktur Baru**

```
src/
├── features/                   # Feature modules (domain-driven)
│   ├── auth/                  # Authentication feature
│   │   ├── components/        # Auth UI components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── withAuth.tsx
│   │   │   └── index.ts
│   │   ├── hooks/            # Auth-specific hooks
│   │   │   ├── useAuth.ts
│   │   │   └── index.ts
│   │   ├── contexts/         # Auth contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── index.ts
│   │   ├── services/         # Auth services
│   │   │   ├── authService.ts
│   │   │   └── index.ts
│   │   ├── actions/          # Server actions
│   │   │   ├── login.ts
│   │   │   ├── register.ts
│   │   │   └── index.ts
│   │   ├── types/            # Auth types
│   │   │   └── index.ts
│   │   ├── utils/            # Auth utilities
│   │   │   └── index.ts
│   │   └── index.ts          # Feature public API
│   │
│   ├── translation/          # Translation feature
│   │   ├── components/       # Translation UI
│   │   ├── hooks/           # Translation hooks
│   │   ├── services/        # Translation services
│   │   ├── actions/         # Translation actions
│   │   ├── types/           # Translation types
│   │   ├── utils/           # Translation utilities
│   │   └── index.ts
│   │
│   ├── vocabulary/          # Vocabulary feature
│   │   ├── components/      # Vocabulary UI
│   │   ├── hooks/          # Vocabulary hooks
│   │   ├── services/       # Vocabulary services
│   │   ├── types/          # Vocabulary types
│   │   ├── utils/          # Vocabulary utilities
│   │   └── index.ts
│   │
│   ├── practice/           # Practice feature
│   │   ├── components/     # Practice UI
│   │   ├── hooks/         # Practice hooks
│   │   ├── services/      # Practice services
│   │   ├── types/         # Practice types
│   │   ├── utils/         # Practice utilities
│   │   └── index.ts
│   │
│   └── dashboard/         # Dashboard feature
│       ├── components/    # Dashboard UI
│       ├── hooks/        # Dashboard hooks
│       ├── services/     # Dashboard services
│       ├── types/        # Dashboard types
│       ├── utils/        # Dashboard utilities
│       └── index.ts
│
├── shared/                # Shared across features
│   ├── components/       # Reusable UI components
│   ├── hooks/           # Generic hooks
│   ├── utils/           # Generic utilities
│   └── types/           # Shared types
│
├── core/                # Core application
│   ├── config/         # App configuration
│   ├── constants/      # App constants
│   ├── types/          # Global types
│   └── utils/          # Core utilities
│
├── infrastructure/     # External integrations
│   ├── api/           # API client
│   ├── database/      # Database layer
│   └── ai/            # AI services
│
├── components/        # Only for atomic design UI
│   ├── ui/           # Shadcn components
│   ├── atoms/        # Basic UI atoms
│   ├── molecules/    # UI molecules
│   └── organisms/    # UI organisms
│
└── app/              # Next.js routes
    ├── (app)/        # App routes
    └── api/          # API routes
```

## 🔄 **Migration Plan**

### 1. **Auth Feature Consolidation**
- Move `src/contexts/AuthContext.tsx` → `src/features/auth/contexts/`
- Move auth-related hooks → `src/features/auth/hooks/`
- Consolidate auth services → `src/features/auth/services/`

### 2. **Translation Feature Consolidation**
- Move translation components → `src/features/translation/components/`
- Move translation hooks → `src/features/translation/hooks/`
- Keep translation services in `src/features/translation/services/`

### 3. **Vocabulary Feature Consolidation**
- Move vocabulary components → `src/features/vocabulary/components/`
- Move vocabulary hooks → `src/features/vocabulary/hooks/`
- Keep vocabulary services in `src/features/vocabulary/services/`

### 4. **Practice Feature Consolidation**
- Move practice components → `src/features/practice/components/`
- Move practice hooks → `src/features/practice/hooks/`
- Keep practice services in `src/features/practice/services/`

### 5. **Dashboard Feature Consolidation**
- Move dashboard components → `src/features/dashboard/components/`
- Move dashboard hooks → `src/features/dashboard/hooks/`
- Keep dashboard services in `src/features/dashboard/services/`

## 🎯 **Benefits**

1. **Cohesion**: Semua kode terkait satu feature dalam satu tempat
2. **Maintainability**: Mudah menemukan dan memodifikasi kode
3. **Scalability**: Mudah menambah feature baru
4. **Team Collaboration**: Developer bisa fokus pada satu feature
5. **Testing**: Mudah membuat test untuk satu feature lengkap
6. **Code Reuse**: Jelas mana yang shared vs feature-specific

## 📋 **Import Patterns**

```typescript
// Feature internal imports (preferred)
import { LoginForm } from './components/LoginForm'
import { useAuth } from './hooks/useAuth'

// Cross-feature imports (when needed)
import { TranslationService } from '@/features/translation'
import { VocabularyHooks } from '@/features/vocabulary'

// Shared imports
import { Button } from '@/shared/components'
import { formatDate } from '@/shared/utils'

// Core imports
import { API_ENDPOINTS } from '@/core/constants'
import { ApiResponse } from '@/core/types'
```

This structure follows the principle: **"Everything related to a feature lives together"**
