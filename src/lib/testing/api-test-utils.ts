/**
 * API testing utilities for comprehensive endpoint testing
 * Provides helpers for testing API routes with proper setup and teardown
 */

import { NextRequest } from 'next/server'
import { createMocks } from 'node-mocks-http'

// Types
export interface TestUser {
  id: string
  email: string
  name: string
  token: string
}

export interface ApiTestContext {
  user?: TestUser
  headers?: Record<string, string>
  cookies?: Record<string, string>
}

export interface ApiTestResponse {
  status: number
  data: any
  headers: Record<string, string>
  cookies: Record<string, string>
}

// Mock data generators
export const mockData = {
  user: (overrides: Partial<TestUser> = {}): TestUser => ({
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    token: 'mock-jwt-token',
    ...overrides,
  }),

  vocabulary: (overrides: any = {}) => ({
    id: 'vocab-123',
    customer: 'test-user-123',
    word: 'hello',
    translation: 'halo',
    definition: 'A greeting',
    example: 'Hello, how are you?',
    difficulty: 'easy',
    status: 'new',
    sourceLanguage: 'English',
    targetLanguage: 'Indonesian',
    tags: [{ tag: 'greeting' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  translation: (overrides: any = {}) => ({
    id: 'trans-123',
    customer: 'test-user-123',
    originalText: 'Hello world',
    translatedText: 'Halo dunia',
    mode: 'simple',
    sourceLanguage: 'English',
    targetLanguage: 'Indonesian',
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  practiceSession: (overrides: any = {}) => ({
    id: 'practice-123',
    customer: 'test-user-123',
    sessionType: 'flashcard',
    score: 85,
    timeSpent: 300000, // 5 minutes
    difficulty: 'medium',
    words: [
      {
        vocabularyId: 'vocab-123',
        isCorrect: true,
        timeSpent: 5000,
        attempts: 1,
        userAnswer: 'halo',
      },
    ],
    metadata: {
      totalQuestions: 10,
      correctAnswers: 8,
      averageTimePerQuestion: 30000,
      streakCount: 3,
    },
    createdAt: new Date().toISOString(),
    ...overrides,
  }),
}

// API test client
export class ApiTestClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private defaultCookies: Record<string, string>

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
    this.defaultCookies = {}
  }

  setAuth(user: TestUser): void {
    this.defaultHeaders.Authorization = `Bearer ${user.token}`
    this.defaultCookies['auth-token'] = user.token
    this.defaultCookies['auth-customer'] = JSON.stringify(user)
  }

  clearAuth(): void {
    delete this.defaultHeaders.Authorization
    delete this.defaultCookies['auth-token']
    delete this.defaultCookies['auth-customer']
  }

  private createRequest(
    method: string,
    path: string,
    options: {
      body?: any
      headers?: Record<string, string>
      cookies?: Record<string, string>
      query?: Record<string, string>
    } = {}
  ): NextRequest {
    const url = new URL(path, this.baseUrl)
    
    // Add query parameters
    if (options.query) {
      Object.entries(options.query).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const headers = new Headers({
      ...this.defaultHeaders,
      ...options.headers,
    })

    // Add cookies
    const cookies = { ...this.defaultCookies, ...options.cookies }
    if (Object.keys(cookies).length > 0) {
      const cookieString = Object.entries(cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ')
      headers.set('Cookie', cookieString)
    }

    const requestInit: RequestInit = {
      method,
      headers,
    }

    if (options.body && method !== 'GET') {
      requestInit.body = typeof options.body === 'string' 
        ? options.body 
        : JSON.stringify(options.body)
    }

    return new NextRequest(url.toString(), requestInit)
  }

  async get(path: string, options: Omit<Parameters<typeof this.createRequest>[2], 'body'> = {}): Promise<ApiTestResponse> {
    const request = this.createRequest('GET', path, options)
    return this.executeRequest(request)
  }

  async post(path: string, body?: any, options: Omit<Parameters<typeof this.createRequest>[2], 'body'> = {}): Promise<ApiTestResponse> {
    const request = this.createRequest('POST', path, { ...options, body })
    return this.executeRequest(request)
  }

  async put(path: string, body?: any, options: Omit<Parameters<typeof this.createRequest>[2], 'body'> = {}): Promise<ApiTestResponse> {
    const request = this.createRequest('PUT', path, { ...options, body })
    return this.executeRequest(request)
  }

  async delete(path: string, options: Omit<Parameters<typeof this.createRequest>[2], 'body'> = {}): Promise<ApiTestResponse> {
    const request = this.createRequest('DELETE', path, options)
    return this.executeRequest(request)
  }

  private async executeRequest(request: NextRequest): Promise<ApiTestResponse> {
    // This is a mock implementation - in real tests, you'd call your actual API handlers
    // For now, return a mock response
    return {
      status: 200,
      data: { success: true, message: 'Mock response' },
      headers: {},
      cookies: {},
    }
  }
}

// Test database utilities
export class TestDatabase {
  private static instance: TestDatabase
  private collections: Map<string, any[]> = new Map()

  static getInstance(): TestDatabase {
    if (!TestDatabase.instance) {
      TestDatabase.instance = new TestDatabase()
    }
    return TestDatabase.instance
  }

  async seed(collection: string, data: any[]): Promise<void> {
    this.collections.set(collection, [...data])
  }

  async find(collection: string, filter: any = {}): Promise<any[]> {
    const items = this.collections.get(collection) || []
    
    if (Object.keys(filter).length === 0) {
      return items
    }

    return items.filter(item => {
      return Object.entries(filter).every(([key, value]) => {
        return item[key] === value
      })
    })
  }

  async findOne(collection: string, filter: any): Promise<any | null> {
    const items = await this.find(collection, filter)
    return items[0] || null
  }

  async create(collection: string, data: any): Promise<any> {
    const items = this.collections.get(collection) || []
    const newItem = {
      id: `${collection}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    }
    items.push(newItem)
    this.collections.set(collection, items)
    return newItem
  }

  async update(collection: string, id: string, data: any): Promise<any | null> {
    const items = this.collections.get(collection) || []
    const index = items.findIndex(item => item.id === id)
    
    if (index === -1) return null

    items[index] = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    this.collections.set(collection, items)
    return items[index]
  }

  async delete(collection: string, id: string): Promise<boolean> {
    const items = this.collections.get(collection) || []
    const index = items.findIndex(item => item.id === id)
    
    if (index === -1) return false

    items.splice(index, 1)
    this.collections.set(collection, items)
    return true
  }

  async clear(collection?: string): Promise<void> {
    if (collection) {
      this.collections.delete(collection)
    } else {
      this.collections.clear()
    }
  }

  async count(collection: string, filter: any = {}): Promise<number> {
    const items = await this.find(collection, filter)
    return items.length
  }
}

// Test setup and teardown utilities
export class TestSetup {
  private client: ApiTestClient
  private db: TestDatabase
  private testUser: TestUser | null = null

  constructor() {
    this.client = new ApiTestClient()
    this.db = TestDatabase.getInstance()
  }

  async beforeEach(): Promise<void> {
    // Clear database
    await this.db.clear()
    
    // Clear auth
    this.client.clearAuth()
    this.testUser = null
  }

  async afterEach(): Promise<void> {
    // Cleanup
    await this.db.clear()
    this.client.clearAuth()
  }

  async createTestUser(overrides: Partial<TestUser> = {}): Promise<TestUser> {
    this.testUser = mockData.user(overrides)
    
    // Seed user in database
    await this.db.create('customers', {
      id: this.testUser.id,
      email: this.testUser.email,
      name: this.testUser.name,
    })

    // Set auth
    this.client.setAuth(this.testUser)
    
    return this.testUser
  }

  async seedVocabulary(count: number = 5, userId?: string): Promise<any[]> {
    const customerId = userId || this.testUser?.id || 'test-user'
    const vocabulary = []
    
    for (let i = 0; i < count; i++) {
      const vocab = await this.db.create('vocabulary', mockData.vocabulary({
        customer: customerId,
        word: `word-${i}`,
        translation: `translation-${i}`,
      }))
      vocabulary.push(vocab)
    }
    
    return vocabulary
  }

  async seedTranslations(count: number = 3, userId?: string): Promise<any[]> {
    const customerId = userId || this.testUser?.id || 'test-user'
    const translations = []
    
    for (let i = 0; i < count; i++) {
      const translation = await this.db.create('translations', mockData.translation({
        customer: customerId,
        originalText: `text-${i}`,
        translatedText: `translated-${i}`,
      }))
      translations.push(translation)
    }
    
    return translations
  }

  async seedPracticeSessions(count: number = 2, userId?: string): Promise<any[]> {
    const customerId = userId || this.testUser?.id || 'test-user'
    const sessions = []
    
    for (let i = 0; i < count; i++) {
      const session = await this.db.create('practice-sessions', mockData.practiceSession({
        customer: customerId,
        score: 70 + (i * 10),
      }))
      sessions.push(session)
    }
    
    return sessions
  }

  getClient(): ApiTestClient {
    return this.client
  }

  getDatabase(): TestDatabase {
    return this.db
  }

  getTestUser(): TestUser | null {
    return this.testUser
  }
}

// Assertion helpers
export const assertions = {
  // API response assertions
  expectSuccess: (response: ApiTestResponse, expectedStatus: number = 200) => {
    expect(response.status).toBe(expectedStatus)
    expect(response.data.success).toBe(true)
  },

  expectError: (response: ApiTestResponse, expectedStatus: number, expectedMessage?: string) => {
    expect(response.status).toBe(expectedStatus)
    expect(response.data.success).toBe(false)
    if (expectedMessage) {
      expect(response.data.error).toContain(expectedMessage)
    }
  },

  expectValidationError: (response: ApiTestResponse, field?: string) => {
    expect(response.status).toBe(400)
    expect(response.data.error).toContain('Validation')
    if (field) {
      expect(response.data.details).toContainEqual(
        expect.objectContaining({ path: expect.arrayContaining([field]) })
      )
    }
  },

  expectRateLimit: (response: ApiTestResponse) => {
    expect(response.status).toBe(429)
    expect(response.data.error).toContain('Rate limit')
    expect(response.headers['Retry-After']).toBeDefined()
  },

  expectUnauthorized: (response: ApiTestResponse) => {
    expect(response.status).toBe(401)
    expect(response.data.error).toContain('Authentication')
  },

  // Data structure assertions
  expectVocabularyStructure: (vocab: any) => {
    expect(vocab).toMatchObject({
      id: expect.any(String),
      customer: expect.any(String),
      word: expect.any(String),
      translation: expect.any(String),
      difficulty: expect.stringMatching(/^(easy|medium|hard)$/),
      status: expect.stringMatching(/^(new|learning|mastered)$/),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })
  },

  expectTranslationStructure: (translation: any) => {
    expect(translation).toMatchObject({
      id: expect.any(String),
      customer: expect.any(String),
      originalText: expect.any(String),
      translatedText: expect.any(String),
      mode: expect.stringMatching(/^(simple|detailed)$/),
      createdAt: expect.any(String),
    })
  },

  expectPracticeSessionStructure: (session: any) => {
    expect(session).toMatchObject({
      id: expect.any(String),
      customer: expect.any(String),
      sessionType: expect.stringMatching(/^(flashcard|multiple_choice|typing|listening)$/),
      score: expect.any(Number),
      timeSpent: expect.any(Number),
      difficulty: expect.stringMatching(/^(easy|medium|hard)$/),
      words: expect.any(Array),
      createdAt: expect.any(String),
    })
  },
}

// Export global test setup instance
export const testSetup = new TestSetup()
