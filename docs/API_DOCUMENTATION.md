# AskVerba API Documentation

## Overview

AskVerba provides a comprehensive REST API for translation, vocabulary management, and practice sessions. The API is built with Next.js 14+ best practices, including proper error handling, rate limiting, caching, and security measures.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://askverba.com`

## Authentication

The API uses JWT-based authentication with HTTP-only cookies for security.

### Authentication Headers

```
Authorization: Bearer <jwt_token>
```

### Authentication Cookies

- `auth-token`: JWT token
- `auth-customer`: User information (JSON)

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per 15 minutes
- **Translation endpoints**: 30 requests per minute
- **Vocabulary endpoints**: 100 requests per minute
- **Practice endpoints**: 50 requests per minute
- **Global per user**: 200 requests per minute
- **Global per IP**: 100 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: When the rate limit resets

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {},
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "req_123456789"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Authentication required or failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `INTERNAL_SERVER_ERROR`: Server error

## API Endpoints

### Authentication

#### POST /api/auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/logout

Logout and clear authentication cookies.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Translation

#### POST /api/translate

Translate text with optional history saving.

**Request Body:**
```json
{
  "text": "Hello world",
  "mode": "simple",
  "saveToHistory": true
}
```

**Parameters:**
- `text` (string, required): Text to translate (max 5000 characters)
- `mode` (enum, required): Translation mode (`simple` | `detailed`)
- `saveToHistory` (boolean, optional): Save to user's translation history

**Response:**
```json
{
  "success": true,
  "data": {
    "result": {
      "translatedText": "Halo dunia",
      "sourceLanguage": "English",
      "targetLanguage": "Indonesian",
      "vocabulary": [
        {
          "word": "hello",
          "translation": "halo",
          "definition": "A greeting"
        }
      ]
    },
    "fromCache": false,
    "processingTime": 1250
  }
}
```

#### GET /api/translate

Get user's translation history.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `mode` (enum, optional): Filter by mode (`simple` | `detailed`)
- `search` (string, optional): Search in text
- `dateFrom` (string, optional): Filter from date (ISO format)
- `dateTo` (string, optional): Filter to date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "docs": [
      {
        "id": "trans_123",
        "originalText": "Hello world",
        "translatedText": "Halo dunia",
        "mode": "simple",
        "sourceLanguage": "English",
        "targetLanguage": "Indonesian",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalDocs": 1,
    "page": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

#### DELETE /api/translate

Delete a translation from history.

**Query Parameters:**
- `id` (string, required): Translation ID

**Response:**
```json
{
  "success": true,
  "message": "Translation deleted successfully"
}
```

### Vocabulary

#### POST /api/vocabulary

Create a new vocabulary entry.

**Request Body:**
```json
{
  "word": "hello",
  "translation": "halo",
  "definition": "A greeting",
  "example": "Hello, how are you?",
  "difficulty": "easy",
  "status": "new",
  "sourceLanguage": "English",
  "targetLanguage": "Indonesian",
  "tags": [
    { "tag": "greeting" },
    { "tag": "common" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "vocab_123",
    "customer": "user_123",
    "word": "hello",
    "translation": "halo",
    "definition": "A greeting",
    "example": "Hello, how are you?",
    "difficulty": "easy",
    "status": "new",
    "sourceLanguage": "English",
    "targetLanguage": "Indonesian",
    "tags": [
      { "tag": "greeting" },
      { "tag": "common" }
    ],
    "practiceCount": 0,
    "accuracy": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/vocabulary

Get user's vocabulary with filtering and pagination.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `status` (enum, optional): Filter by status (`new` | `learning` | `mastered`)
- `difficulty` (enum, optional): Filter by difficulty (`easy` | `medium` | `hard`)
- `search` (string, optional): Search in word, translation, or definition
- `sortBy` (string, optional): Sort field (default: `createdAt`)
- `sortOrder` (enum, optional): Sort order (`asc` | `desc`, default: `desc`)

**Response:**
```json
{
  "success": true,
  "data": {
    "docs": [
      {
        "id": "vocab_123",
        "word": "hello",
        "translation": "halo",
        "definition": "A greeting",
        "difficulty": "easy",
        "status": "new",
        "practiceCount": 0,
        "accuracy": 0,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalDocs": 1,
    "page": 1,
    "totalPages": 1
  }
}
```

#### PUT /api/vocabulary

Update a vocabulary entry.

**Request Body:**
```json
{
  "id": "vocab_123",
  "status": "learning",
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "vocab_123",
    "status": "learning",
    "difficulty": "medium",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### DELETE /api/vocabulary

Delete a vocabulary entry.

**Query Parameters:**
- `id` (string, required): Vocabulary ID

**Response:**
```json
{
  "success": true,
  "message": "Vocabulary entry deleted successfully"
}
```

### Practice Sessions

#### POST /api/practice

Create a new practice session.

**Request Body:**
```json
{
  "sessionType": "flashcard",
  "score": 85,
  "timeSpent": 300000,
  "difficulty": "medium",
  "words": [
    {
      "vocabularyId": "vocab_123",
      "isCorrect": true,
      "timeSpent": 5000,
      "attempts": 1,
      "userAnswer": "halo"
    }
  ],
  "metadata": {
    "totalQuestions": 10,
    "correctAnswers": 8,
    "averageTimePerQuestion": 30000,
    "streakCount": 3
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "practice_123",
    "customer": "user_123",
    "sessionType": "flashcard",
    "score": 85,
    "timeSpent": 300000,
    "difficulty": "medium",
    "words": [...],
    "metadata": {...},
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/practice

Get user's practice sessions.

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `sessionType` (enum, optional): Filter by type (`flashcard` | `multiple_choice` | `typing` | `listening`)
- `difficulty` (enum, optional): Filter by difficulty
- `dateFrom` (string, optional): Filter from date
- `dateTo` (string, optional): Filter to date

**Response:**
```json
{
  "success": true,
  "data": {
    "docs": [
      {
        "id": "practice_123",
        "sessionType": "flashcard",
        "score": 85,
        "timeSpent": 300000,
        "difficulty": "medium",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalDocs": 1,
    "page": 1,
    "totalPages": 1
  }
}
```

#### GET /api/practice/stats

Get practice statistics.

**Query Parameters:**
- `period` (enum, optional): Time period (`day` | `week` | `month` | `year`, default: `week`)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSessions": 15,
    "averageScore": 82.5,
    "totalTimeSpent": 4500000,
    "streakCount": 7,
    "sessionsByType": {
      "flashcard": 8,
      "multiple_choice": 4,
      "typing": 3
    },
    "progressByDay": [
      {
        "date": "2024-01-01",
        "sessions": 2,
        "averageScore": 85,
        "timeSpent": 600000
      }
    ]
  }
}
```

## Caching

The API implements multi-layer caching:

1. **Redis Cache**: For translation results and frequently accessed data
2. **Next.js Cache**: For server-side rendered data
3. **Request Deduplication**: Prevents duplicate simultaneous requests

Cache headers:
- `X-Cache-Status`: `HIT` | `MISS` | `STALE`
- `X-Cache-TTL`: Time to live in seconds

## Security

### HTTPS

All production traffic must use HTTPS.

### CORS

CORS is configured to allow requests from:
- Production: `https://askverba.com`
- Development: `http://localhost:3000`

### Security Headers

The API includes security headers:
- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Input Validation

All inputs are validated and sanitized:
- HTML tags are stripped
- JavaScript protocols are removed
- Event handlers are removed
- Length limits are enforced

## Performance

### Response Times

Target response times:
- Authentication: < 500ms
- Translation: < 2000ms
- Vocabulary operations: < 300ms
- Practice sessions: < 500ms

### Monitoring

The API includes comprehensive monitoring:
- Performance metrics
- Error tracking
- Rate limit monitoring
- Cache hit rates

## Development

### Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=mongodb://localhost:27017/askverba
PAYLOAD_SECRET=your-secret-key

# Redis (optional, falls back to mock)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Authentication
JWT_SECRET=your-jwt-secret

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# External Services
OPENAI_API_KEY=your-openai-key
GOOGLE_TRANSLATE_API_KEY=your-google-translate-key
```

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

3. Start development server:
```bash
npm run dev
```

4. Run tests:
```bash
npm run test
npm run test:api  # API-specific tests
npm run test:e2e  # End-to-end tests
```

### Testing

The API includes comprehensive testing utilities:

```typescript
import { testSetup, mockData, assertions } from '@/lib/testing/api-test-utils'

describe('Vocabulary API', () => {
  beforeEach(async () => {
    await testSetup.beforeEach()
    await testSetup.createTestUser()
  })

  it('should create vocabulary entry', async () => {
    const client = testSetup.getClient()
    const response = await client.post('/api/vocabulary', mockData.vocabulary())

    assertions.expectSuccess(response, 201)
    assertions.expectVocabularyStructure(response.data.data)
  })
})
```

## Support

For API support, please contact:
- Email: api-support@askverba.com
- Documentation: https://docs.askverba.com
- Status Page: https://status.askverba.com
