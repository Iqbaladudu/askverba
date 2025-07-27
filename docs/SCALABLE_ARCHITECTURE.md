# AskVerba Scalable Architecture Design

## Architecture Overview

This document outlines the new scalable architecture for AskVerba, following Next.js 15 App Router best practices, PayloadCMS integration patterns, and domain-driven design principles.

## Core Principles

1. **Domain-Driven Design**: Features organized by business domains
2. **Separation of Concerns**: Clear boundaries between layers
3. **Dependency Inversion**: High-level modules don't depend on low-level modules
4. **Single Responsibility**: Each module has one reason to change
5. **Open/Closed Principle**: Open for extension, closed for modification

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (app)/                   # Main application routes
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page
│   │   ├── (auth)/              # Authentication routes
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/         # Dashboard routes
│   │   │   ├── layout.tsx       # Dashboard layout
│   │   │   ├── page.tsx         # Dashboard home
│   │   │   ├── translate/
│   │   │   ├── vocabulary/
│   │   │   ├── practice/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   └── translate/           # Public translation page
│   ├── (payload)/               # PayloadCMS admin
│   └── api/                     # API routes
│       ├── auth/
│       ├── translation/
│       ├── vocabulary/
│       ├── practice/
│       └── analytics/
├── core/                        # Core business logic & infrastructure
│   ├── config/                  # Configuration management
│   │   ├── app.config.ts        # Application configuration
│   │   ├── database.config.ts   # Database configuration
│   │   ├── ai.config.ts         # AI service configuration
│   │   └── feature-flags.ts     # Feature flags
│   ├── constants/               # Application constants
│   │   ├── routes.ts            # Route constants
│   │   ├── errors.ts            # Error constants
│   │   └── validation.ts        # Validation constants
│   ├── types/                   # Core type definitions
│   │   ├── api.types.ts         # API response types
│   │   ├── auth.types.ts        # Authentication types
│   │   └── common.types.ts      # Common shared types
│   └── utils/                   # Core utilities
│       ├── logger.ts            # Logging utility
│       ├── validation.ts        # Validation utilities
│       ├── encryption.ts        # Security utilities
│       └── date.ts              # Date utilities
├── domains/                     # Business domains (features)
│   ├── auth/                    # Authentication domain
│   │   ├── components/          # Auth-specific components
│   │   ├── hooks/               # Auth hooks
│   │   ├── services/            # Auth business logic
│   │   ├── types/               # Auth types
│   │   ├── utils/               # Auth utilities
│   │   └── index.ts             # Public API
│   ├── translation/             # Translation domain
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   ├── vocabulary/              # Vocabulary domain
│   ├── practice/                # Practice domain
│   ├── analytics/               # Analytics domain
│   └── user/                    # User management domain
├── infrastructure/              # External integrations & services
│   ├── database/                # Database layer
│   │   ├── payload/             # PayloadCMS integration
│   │   ├── repositories/        # Data access layer
│   │   └── migrations/          # Database migrations
│   ├── ai/                      # AI service integrations
│   │   ├── providers/           # AI provider implementations
│   │   ├── prompts/             # AI prompts
│   │   └── cache/               # AI response caching
│   ├── storage/                 # File storage
│   ├── email/                   # Email service
│   └── monitoring/              # Monitoring & logging
├── shared/                      # Shared across domains
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Base UI components (shadcn)
│   │   ├── forms/               # Form components
│   │   ├── layout/              # Layout components
│   │   └── feedback/            # Feedback components
│   ├── hooks/                   # Shared hooks
│   │   ├── useApi.ts            # API hooks
│   │   ├── useLocalStorage.ts   # Storage hooks
│   │   └── useDebounce.ts       # Utility hooks
│   ├── providers/               # Context providers
│   │   ├── QueryProvider.tsx    # React Query provider
│   │   ├── ThemeProvider.tsx    # Theme provider
│   │   └── AuthProvider.tsx     # Auth provider
│   └── styles/                  # Shared styles
│       ├── globals.css          # Global CSS
│       └── components.css       # Component styles
├── collections/                 # PayloadCMS collections
├── middleware.ts                # Next.js middleware
└── payload.config.ts            # PayloadCMS configuration
```

## Layer Architecture

### 1. Presentation Layer (`app/`, `domains/*/components/`)
- Next.js App Router pages and layouts
- React components for UI
- Form handling and validation
- Client-side state management

### 2. Application Layer (`domains/*/services/`)
- Business logic and use cases
- Orchestration of domain operations
- Application-specific rules
- Command and query handlers

### 3. Domain Layer (`domains/*/types/`, `domains/*/utils/`)
- Core business entities and value objects
- Domain-specific business rules
- Domain events and aggregates
- Pure business logic (no external dependencies)

### 4. Infrastructure Layer (`infrastructure/`)
- External service integrations
- Database access and repositories
- File storage and caching
- Third-party API clients

### 5. Shared Kernel (`core/`, `shared/`)
- Common utilities and helpers
- Shared types and constants
- Cross-cutting concerns
- Reusable components and hooks

## Key Architectural Patterns

### 1. Repository Pattern
```typescript
// infrastructure/database/repositories/BaseRepository.ts
export abstract class BaseRepository<T> {
  abstract findById(id: string): Promise<T | null>
  abstract findMany(query: QueryOptions): Promise<T[]>
  abstract create(data: CreateData<T>): Promise<T>
  abstract update(id: string, data: UpdateData<T>): Promise<T>
  abstract delete(id: string): Promise<void>
}
```

### 2. Service Layer Pattern
```typescript
// domains/translation/services/TranslationService.ts
export class TranslationService {
  constructor(
    private translationRepo: TranslationRepository,
    private aiProvider: AIProvider,
    private cacheService: CacheService
  ) {}

  async translateText(request: TranslationRequest): Promise<TranslationResult> {
    // Business logic here
  }
}
```

### 3. Factory Pattern for AI Providers
```typescript
// infrastructure/ai/providers/AIProviderFactory.ts
export class AIProviderFactory {
  static create(provider: AIProviderType): AIProvider {
    switch (provider) {
      case 'mistral': return new MistralProvider()
      case 'xai': return new XAIProvider()
      default: throw new Error(`Unknown provider: ${provider}`)
    }
  }
}
```

### 4. Command Query Responsibility Segregation (CQRS)
```typescript
// domains/translation/services/commands/TranslateCommand.ts
export class TranslateCommand {
  constructor(
    private translationService: TranslationService,
    private eventBus: EventBus
  ) {}

  async execute(command: TranslateCommandData): Promise<TranslationResult> {
    const result = await this.translationService.translate(command)
    await this.eventBus.publish(new TranslationCompletedEvent(result))
    return result
  }
}
```

## Benefits of This Architecture

1. **Scalability**: Easy to add new features without affecting existing code
2. **Maintainability**: Clear separation of concerns and single responsibility
3. **Testability**: Each layer can be tested independently
4. **Flexibility**: Easy to swap implementations (e.g., different AI providers)
5. **Team Collaboration**: Clear boundaries for different team members
6. **Code Reusability**: Shared components and utilities across domains
7. **Performance**: Optimized data access and caching strategies

## Migration Strategy

1. **Phase 1**: Create new directory structure
2. **Phase 2**: Move core utilities and types
3. **Phase 3**: Restructure domains one by one
4. **Phase 4**: Update imports and dependencies
5. **Phase 5**: Add tests and documentation
6. **Phase 6**: Remove old structure

## Next Steps

1. Implement the new directory structure
2. Create base classes and interfaces
3. Move existing code to new structure
4. Update all imports and references
5. Add comprehensive testing
6. Update documentation
