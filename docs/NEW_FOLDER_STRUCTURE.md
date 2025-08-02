# AskVerba New Folder Structure

## 🏗️ **Restructured Architecture Overview**

This document outlines the new folder structure for AskVerba following Next.js best practices, atomic design principles, and domain-driven design.

## 📁 **New Directory Structure**

```
src/
├── app/                          # Next.js App Router
│   ├── (app)/                   # Main application routes
│   │   ├── (auth)/             # Authentication routes group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/          # Dashboard routes
│   │   │   ├── analytics/
│   │   │   ├── practice/
│   │   │   ├── vocabulary/
│   │   │   └── settings/
│   │   ├── translate/          # Public translation page
│   │   └── layout.tsx
│   ├── (payload)/              # PayloadCMS admin routes
│   └── api/                    # API routes
│       ├── auth/
│       ├── translation/
│       ├── vocabulary/
│       └── practice/
│
├── components/                   # UI Components (Atomic Design)
│   ├── ui/                     # Shadcn UI components (DO NOT MODIFY)
│   ├── atoms/                  # Basic building blocks
│   │   ├── buttons/
│   │   ├── inputs/
│   │   ├── icons/
│   │   └── typography/
│   ├── molecules/              # Simple component combinations
│   │   ├── forms/
│   │   ├── cards/
│   │   ├── navigation/
│   │   └── feedback/
│   ├── organisms/              # Complex component combinations
│   │   ├── headers/
│   │   ├── sidebars/
│   │   ├── modals/
│   │   └── sections/
│   ├── templates/              # Page-level layouts
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── public/
│   └── providers/              # Context providers
│
├── features/                     # Feature-based modules
│   ├── auth/                   # Authentication feature
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── translation/            # Translation feature
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── vocabulary/             # Vocabulary management
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── practice/               # Practice sessions
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── dashboard/              # Dashboard feature
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       └── utils/
│
├── core/                         # Core application logic
│   ├── config/                 # Configuration files
│   │   ├── database.ts
│   │   ├── auth.ts
│   │   └── app.ts
│   ├── constants/              # Application constants
│   │   ├── routes.ts
│   │   ├── api.ts
│   │   └── ui.ts
│   ├── types/                  # Global TypeScript types
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── common.ts
│   └── utils/                  # Core utility functions
│       ├── validation.ts
│       ├── formatting.ts
│       └── helpers.ts
│
├── infrastructure/               # External integrations
│   ├── api/                    # API layer
│   │   ├── client.ts
│   │   ├── middleware/
│   │   └── validation/
│   ├── database/               # Database layer
│   │   ├── payload/
│   │   └── repositories/
│   ├── ai/                     # AI service integrations
│   │   ├── openai/
│   │   └── translation/
│   ├── storage/                # File storage
│   └── monitoring/             # Logging & analytics
│
├── shared/                       # Shared utilities
│   ├── components/             # Reusable components
│   ├── hooks/                  # Shared custom hooks
│   ├── utils/                  # Shared utility functions
│   └── constants/              # Shared constants
│
├── lib/                          # Legacy lib folder (to be migrated)
│   └── (gradually migrate to appropriate folders)
│
├── hooks/                        # Global custom hooks
│   ├── useAuth.ts
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
│
├── types/                        # Global type definitions
│   ├── payload-types.ts        # Generated PayloadCMS types
│   └── global.d.ts
│
├── collections/                  # PayloadCMS collections
├── middleware.ts                 # Next.js middleware
└── payload.config.ts            # PayloadCMS configuration
```

## 🎯 **Key Principles**

### 1. **Atomic Design Structure**
- **Atoms**: Basic UI elements (buttons, inputs, icons)
- **Molecules**: Simple combinations (form fields, cards)
- **Organisms**: Complex combinations (headers, sidebars)
- **Templates**: Page layouts
- **Pages**: Actual pages (in app/ directory)

### 2. **Feature-Based Organization**
- Each feature is self-contained
- Clear boundaries between features
- Shared code in appropriate shared folders

### 3. **Separation of Concerns**
- **Components**: UI presentation
- **Features**: Business logic
- **Core**: Application-wide logic
- **Infrastructure**: External integrations
- **Shared**: Reusable utilities

### 4. **Path Aliases**
- `@/components/*` - UI components
- `@/features/*` - Feature modules
- `@/core/*` - Core application logic
- `@/infrastructure/*` - External integrations
- `@/shared/*` - Shared utilities

## 🚀 **Migration Benefits**

1. **Better Maintainability**: Clear structure and separation
2. **Improved Scalability**: Easy to add new features
3. **Enhanced Developer Experience**: Intuitive file organization
4. **Reduced Duplication**: Centralized shared components
5. **Better Testing**: Isolated feature modules
6. **Improved Performance**: Better code splitting opportunities

## 📋 **Migration Checklist**

- [x] Create new folder structure
- [x] Migrate core utilities and constants
- [x] Restructure components with atomic design
- [x] Organize features into modules
- [x] Update import paths
- [x] Remove duplicate files
- [x] Clean up empty folders
- [x] Test all functionality
- [x] Update documentation

## 🧹 **Cleanup Summary**

### **Removed Duplicate Files:**
- `src/lib/utils.ts` (duplicate of `src/core/utils/index.ts`)
- `src/lib/actions/auth.actions.ts` (duplicate of `src/features/auth/actions.ts`)

### **Removed Duplicate Folders:**
- `src/domains/` (duplicate of `src/features/`)
- `src/payload/` (duplicate collections and config)
- `src/components/debug-tools/` (duplicate of `src/components/debug/`)

### **Reorganized Files:**
- `src/constant/prompt.ts` → `src/core/constants/prompt.ts`
- `src/types/translator.ts` → `src/features/translation/types/translator.ts`

### **Removed Empty Folders:**
- All empty atomic design folders (`atoms/buttons`, `templates/auth`, etc.)
- Empty infrastructure folders (`storage`, `monitoring`)
- All other empty directories automatically cleaned up
