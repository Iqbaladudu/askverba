# AskVerba Development Guide

## Architecture Overview

AskVerba follows a scalable, domain-driven architecture with clear separation of concerns. This guide will help you understand the project structure and development practices.

## Project Structure

```
src/
├── app/                          # Next.js App Router
├── core/                         # Core business logic & infrastructure
│   ├── config/                   # Configuration management
│   ├── constants/                # Application constants
│   ├── types/                    # Core type definitions
│   └── utils/                    # Core utilities
├── domains/                      # Business domains (features)
│   ├── auth/                     # Authentication domain
│   ├── translation/              # Translation domain
│   ├── vocabulary/               # Vocabulary domain
│   ├── practice/                 # Practice domain
│   └── analytics/                # Analytics domain
├── infrastructure/               # External integrations & services
│   ├── database/                 # Database layer
│   ├── ai/                       # AI service integrations
│   └── api/                      # API infrastructure
├── shared/                       # Shared across domains
│   ├── components/               # Reusable UI components
│   ├── hooks/                    # Shared hooks
│   └── providers/                # Context providers
└── collections/                  # PayloadCMS collections
```

## Development Principles

### 1. Domain-Driven Design
- Features are organized by business domains
- Each domain has its own components, services, types, and utilities
- Clear boundaries between domains
- Public APIs through index.ts files

### 2. Separation of Concerns
- **Presentation Layer**: React components and pages
- **Application Layer**: Business logic and use cases
- **Domain Layer**: Core business entities and rules
- **Infrastructure Layer**: External services and data access

### 3. Type Safety
- Strict TypeScript configuration
- Comprehensive type definitions
- Zod schemas for runtime validation
- Type-safe API responses

### 4. Error Handling
- Centralized error handling
- Consistent error codes and messages
- Proper error boundaries
- Graceful degradation

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- pnpm (preferred) or npm
- MongoDB database
- Environment variables configured

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd askverba

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Generate PayloadCMS types
pnpm generate:types

# Start development server
pnpm dev
```

### Environment Variables
Required environment variables:
- `DATABASE_URI`: MongoDB connection string
- `PAYLOAD_SECRET`: PayloadCMS secret (32+ characters)
- `MISTRAL_API_KEY` or `XAI_API_KEY`: AI service API key

Optional environment variables:
- `SMTP_*`: Email service configuration
- `SENTRY_DSN`: Error monitoring
- `LOG_LEVEL`: Logging level (error, warn, info, debug)

## Development Workflow

### 1. Feature Development
When adding a new feature:

1. **Identify the Domain**: Determine which domain the feature belongs to
2. **Create Types**: Define TypeScript interfaces in `domains/{domain}/types/`
3. **Implement Services**: Add business logic in `domains/{domain}/services/`
4. **Create Components**: Build UI components in `domains/{domain}/components/`
5. **Add API Routes**: Create API endpoints in `app/api/`
6. **Write Tests**: Add unit and integration tests
7. **Update Documentation**: Document the new feature

### 2. Code Organization

#### Domain Structure
```
domains/{domain}/
├── components/           # Domain-specific components
├── hooks/               # Domain-specific hooks
├── services/            # Business logic
├── types/               # Type definitions
├── utils/               # Domain utilities
└── index.ts             # Public API
```

#### Component Structure
```
components/
├── ui/                  # Base UI components (shadcn)
├── forms/               # Form components
├── layout/              # Layout components
├── feedback/            # Feedback components
└── data-display/        # Data display components
```

### 3. API Development

#### API Route Structure
```typescript
// app/api/{resource}/route.ts
import { withErrorHandler, withAuth } from '@/infrastructure/api/middleware'
import { validateBody } from '@/infrastructure/api/validation'
import { createSuccessResponse } from '@/core/types/api.types'

export const POST = withErrorHandler(
  withAuth(async (request, authContext) => {
    const body = await validateBody(schema)(request)
    
    // Business logic here
    const result = await service.create(body)
    
    return NextResponse.json(createSuccessResponse(result))
  })
)
```

#### Server Actions
```typescript
// domains/{domain}/actions/{action}.ts
'use server'

import { withServerActionErrorHandler } from '@/infrastructure/api/middleware'
import { getCurrentUser } from '@/lib/actions/auth.actions'

export const createResource = withServerActionErrorHandler(
  async (data: CreateResourceData) => {
    const user = await getCurrentUser()
    if (!user) throw new AuthError()
    
    // Business logic here
    return await service.create(data)
  }
)
```

### 4. Database Operations

#### Repository Pattern
```typescript
// infrastructure/database/repositories/{Resource}Repository.ts
import { BaseRepository } from './BaseRepository'

export class ResourceRepository extends BaseRepository<ResourceEntity> {
  constructor() {
    super('resources')
  }

  async findByUserId(userId: string) {
    return await this.findMany({
      where: { user: { equals: userId } }
    })
  }
}
```

### 5. Component Development

#### Shared Components
```typescript
// shared/components/{category}/{Component}.tsx
import { cn } from '@/lib/utils'

interface ComponentProps {
  // Props definition
}

export function Component({ ...props }: ComponentProps) {
  return (
    <div className={cn('base-classes', props.className)}>
      {/* Component content */}
    </div>
  )
}
```

#### Domain Components
```typescript
// domains/{domain}/components/{Component}.tsx
import { useQuery } from '@tanstack/react-query'
import { service } from '../services'

export function DomainComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['domain-data'],
    queryFn: () => service.getData()
  })

  if (isLoading) return <div>Loading...</div>
  
  return <div>{/* Component content */}</div>
}
```

## Code Quality Standards

### 1. TypeScript
- Use strict mode
- Define proper interfaces and types
- Avoid `any` type
- Use type guards when necessary

### 2. React
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices
- Use React Query for data fetching

### 3. Styling
- Use Tailwind CSS for styling
- Follow mobile-first approach
- Use CSS variables for theming
- Maintain consistent spacing and typography

### 4. Testing
- Write unit tests for utilities and services
- Write integration tests for API routes
- Write component tests for complex components
- Maintain good test coverage

### 5. Performance
- Implement lazy loading where appropriate
- Optimize images and assets
- Use React.memo for expensive components
- Monitor Core Web Vitals

## Configuration Management

### Feature Flags
```typescript
import { isFeatureEnabled } from '@/core/config'

if (isFeatureEnabled('new_feature')) {
  // New feature code
}
```

### Environment Configuration
```typescript
import { appConfig } from '@/core/config'

const apiUrl = appConfig.app.url
const isDev = appConfig.app.isDevelopment
```

## Error Handling

### API Errors
```typescript
import { ApiError, ERROR_CODES } from '@/infrastructure/api/middleware'

throw new ApiError(
  ERROR_CODES.VALIDATION.INVALID_FORMAT,
  'Invalid input data',
  422
)
```

### Client Errors
```typescript
import { toast } from 'sonner'

try {
  await apiCall()
} catch (error) {
  toast.error('Something went wrong')
  console.error(error)
}
```

## Deployment

### Build Process
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Environment Setup
- Configure environment variables
- Set up database connections
- Configure external services
- Set up monitoring and logging

## Contributing

1. Follow the established architecture patterns
2. Write comprehensive tests
3. Update documentation
4. Follow code review process
5. Ensure type safety
6. Maintain performance standards

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [PayloadCMS Documentation](https://payloadcms.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Support

For questions or issues:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Follow the issue template
