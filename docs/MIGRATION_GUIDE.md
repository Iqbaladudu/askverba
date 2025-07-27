# AskVerba Architecture Migration Guide

## Overview

This guide outlines the step-by-step process to migrate your existing AskVerba codebase to the new scalable architecture. The migration is designed to be incremental and non-breaking.

## Migration Strategy

### Phase 1: Foundation Setup ✅
- [x] Create new directory structure
- [x] Set up core configuration system
- [x] Implement centralized error handling
- [x] Create base repository patterns
- [x] Set up development tools and standards

### Phase 2: Core Infrastructure Migration
- [ ] Move existing utilities to `src/core/utils/`
- [ ] Migrate constants to `src/core/constants/`
- [ ] Update import paths throughout the codebase
- [ ] Implement new logging system

### Phase 3: Domain Restructuring
- [ ] Migrate translation features to `src/domains/translation/`
- [ ] Migrate authentication features to `src/domains/auth/`
- [ ] Migrate vocabulary features to `src/domains/vocabulary/`
- [ ] Update component imports and exports

### Phase 4: API Layer Migration
- [ ] Migrate API routes to use new middleware
- [ ] Implement new validation schemas
- [ ] Update error handling in API routes
- [ ] Migrate server actions to new structure

### Phase 5: Component Architecture
- [ ] Move shared components to `src/shared/components/`
- [ ] Implement new layout components
- [ ] Update component imports throughout the app
- [ ] Remove old component structure

### Phase 6: Testing and Cleanup
- [ ] Add comprehensive tests
- [ ] Remove old unused files
- [ ] Update documentation
- [ ] Performance optimization

## Detailed Migration Steps

### Step 1: Update Import Paths

#### Before:
```typescript
import { translateWithCache } from '@/lib/services/translationService'
import { ERROR_CODES } from '@/lib/constants'
import { logger } from '@/lib/utils'
```

#### After:
```typescript
import { TranslationService } from '@/domains/translation'
import { ERROR_CODES } from '@/core/constants/errors'
import { createLogger } from '@/core/utils/logger'
```

### Step 2: Migrate Services

#### Before:
```typescript
// lib/services/translationService.ts
export async function translateWithCache(request) {
  // Implementation
}
```

#### After:
```typescript
// domains/translation/services/TranslationService.ts
export class TranslationService {
  async translate(request: TranslationRequest) {
    // Implementation
  }
}
```

### Step 3: Update API Routes

#### Before:
```typescript
// app/api/translate/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Handle request
  } catch (error) {
    // Error handling
  }
}
```

#### After:
```typescript
// app/api/translate/route.ts
import { withErrorHandler, withAuth } from '@/infrastructure/api/middleware'
import { validateBody, translationRequestSchema } from '@/infrastructure/api/validation'

export const POST = withErrorHandler(
  withAuth(async (request, authContext) => {
    const body = await validateBody(translationRequestSchema)(request)
    // Handle request with proper validation and auth
  })
)
```

### Step 4: Migrate Components

#### Before:
```typescript
// components/translator.tsx
export function Translator() {
  // Component implementation
}
```

#### After:
```typescript
// domains/translation/components/TranslationInterface.tsx
export function TranslationInterface() {
  // Component implementation
}

// Export from domain index
// domains/translation/index.ts
export { TranslationInterface } from './components/TranslationInterface'
```

### Step 5: Update Configuration

#### Before:
```typescript
// Multiple config files scattered
const config = {
  apiUrl: process.env.API_URL,
  // Other config
}
```

#### After:
```typescript
// Use centralized config
import { appConfig, isFeatureEnabled } from '@/core/config'

const apiUrl = appConfig.app.url
const isNewFeatureEnabled = isFeatureEnabled('new_feature')
```

## Migration Checklist

### Core Infrastructure
- [ ] Move `src/lib/utils.ts` → `src/core/utils/`
- [ ] Move constants → `src/core/constants/`
- [ ] Update all import statements
- [ ] Replace console.log with logger
- [ ] Implement centralized error handling

### Domain Migration
- [ ] Create domain directories
- [ ] Move feature-specific code to domains
- [ ] Create domain index files
- [ ] Update imports to use domain exports

### API Migration
- [ ] Add error handling middleware to all routes
- [ ] Add authentication middleware where needed
- [ ] Implement request validation
- [ ] Update response formats

### Component Migration
- [ ] Move shared components to `src/shared/components/`
- [ ] Move domain-specific components to domains
- [ ] Update component imports
- [ ] Implement new layout components

### Database Migration
- [ ] Implement repository pattern
- [ ] Update database queries to use repositories
- [ ] Add proper error handling
- [ ] Implement caching where appropriate

## Breaking Changes

### Import Path Changes
All import paths will change. Use find-and-replace to update:

```bash
# Example replacements
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/@\/lib\/utils/@\/core\/utils/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/@\/lib\/constants/@\/core\/constants/g'
```

### Component Structure Changes
- Components are now organized by domain and shared categories
- Layout components have new props and structure
- Form components use new validation patterns

### API Response Format Changes
- All API responses now use standardized format
- Error responses have consistent structure
- Pagination metadata is standardized

## Testing Strategy

### Unit Tests
- Test core utilities and services
- Test domain business logic
- Test component functionality

### Integration Tests
- Test API routes with middleware
- Test database operations
- Test authentication flows

### E2E Tests
- Test critical user journeys
- Test cross-domain interactions
- Test error scenarios

## Rollback Plan

If issues arise during migration:

1. **Immediate Rollback**: Keep old structure alongside new
2. **Gradual Rollback**: Revert specific domains/features
3. **Full Rollback**: Restore from backup before migration

## Performance Considerations

### Bundle Size
- New architecture may initially increase bundle size
- Implement code splitting by domain
- Use dynamic imports for large features

### Runtime Performance
- Repository pattern adds abstraction layer
- Implement caching strategies
- Monitor performance metrics

## Post-Migration Tasks

### Documentation
- [ ] Update API documentation
- [ ] Update component documentation
- [ ] Update development guide
- [ ] Create architecture diagrams

### Monitoring
- [ ] Set up error monitoring
- [ ] Monitor performance metrics
- [ ] Track feature flag usage
- [ ] Monitor bundle size

### Optimization
- [ ] Implement code splitting
- [ ] Optimize database queries
- [ ] Add caching layers
- [ ] Optimize component rendering

## Timeline

### Week 1: Foundation
- Set up new directory structure
- Implement core infrastructure
- Update development tools

### Week 2: Domain Migration
- Migrate translation domain
- Migrate authentication domain
- Update imports and exports

### Week 3: API and Components
- Migrate API routes
- Migrate component structure
- Update validation and error handling

### Week 4: Testing and Cleanup
- Add comprehensive tests
- Remove old code
- Performance optimization
- Documentation updates

## Support and Resources

### Getting Help
- Check migration guide for common issues
- Review architecture documentation
- Ask team members for assistance
- Create issues for blockers

### Useful Commands
```bash
# Find all import statements to update
grep -r "from '@/lib" src/

# Find all component imports
grep -r "from '@/components" src/

# Check for unused files
npx unimported

# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Run tests
pnpm test
```

## Success Criteria

Migration is complete when:
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] All features work as expected
- [ ] Performance is maintained or improved
- [ ] Documentation is updated
- [ ] Team is trained on new architecture
