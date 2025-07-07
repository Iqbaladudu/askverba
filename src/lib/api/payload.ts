import { getAuthTokenFromDocument, getAuthTokenHybrid } from '@/lib/auth-cookies'

const PAYLOAD_API_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000'

// Get token from server-side cookies via API route
async function getTokenFromServer(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/token', {
      method: 'GET',
      credentials: 'include', // Include cookies
    })

    if (response.ok) {
      const data = await response.json()
      return data.token || null
    }
    return null
  } catch (error) {
    console.error('Error getting token from server:', error)
    return null
  }
}

// Enhanced token retrieval with server fallback
async function getAuthToken(): Promise<string | null> {
  // Try client-side cookies first (non-httpOnly)
  const clientToken = getAuthTokenHybrid()
  if (clientToken) {
    console.log('Token found via client cookies')
    return clientToken
  }

  // Fallback to server-side cookies via API (httpOnly)
  console.log('Trying server-side token...')
  const serverToken = await getTokenFromServer()
  if (serverToken) {
    console.log('Token found via server API')
    return serverToken
  }

  console.log('No token found anywhere')
  return null
}

// Base API function
async function payloadAPI(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken()
  console.log('=== PayloadAPI Debug ===')
  console.log('Endpoint:', endpoint)
  console.log('Token from enhanced method:', token)
  console.log('Method:', options.method || 'GET')

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `JWT ${token}` }),
    ...options.headers,
  }

  console.log('Request headers:', headers)
  console.log('Request body:', options.body)

  const response = await fetch(`${PAYLOAD_API_URL}/api${endpoint}`, {
    headers,
    ...options,
  })

  console.log('API Response status:', response.status)
  console.log('API Response headers:', Object.fromEntries(response.headers.entries()))

  if (!response.ok) {
    const errorText = await response.text()
    console.error('API Error details:', errorText)
    console.log('=== End PayloadAPI Debug ===')
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  const result = await response.json()
  console.log('API Success result:', result)
  console.log('=== End PayloadAPI Debug ===')
  return result
}

// User Progress API
export const userProgressAPI = {
  async get(customerId: string) {
    return payloadAPI(`/user-progress?where[customer][equals]=${customerId}&limit=1`)
  },

  async create(data: any) {
    return payloadAPI('/user-progress', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: any) {
    return payloadAPI(`/user-progress/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async upsert(customerId: string, data: any) {
    try {
      const existing = await this.get(customerId)
      if (existing.docs.length > 0) {
        return this.update(existing.docs[0].id, data)
      } else {
        return this.create({ ...data, customer: customerId })
      }
    } catch (error) {
      return this.create({ ...data, customer: customerId })
    }
  },
}

// Vocabulary API
export const vocabularyAPI = {
  async getByCustomer(customerId: string, options: any = {}) {
    const { limit = 50, page = 1, status, difficulty, search } = options
    let query = `where[customer][equals]=${customerId}&limit=${limit}&page=${page}`

    if (status) query += `&where[status][equals]=${status}`
    if (difficulty) query += `&where[difficulty][equals]=${difficulty}`
    if (search) query += `&where[word][contains]=${encodeURIComponent(search)}`

    return payloadAPI(`/vocabulary?${query}`)
  },

  async create(data: any) {
    return payloadAPI('/vocabulary', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: any) {
    return payloadAPI(`/vocabulary/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string) {
    return payloadAPI(`/vocabulary/${id}`, {
      method: 'DELETE',
    })
  },

  async getStats(customerId: string) {
    const all = await this.getByCustomer(customerId, { limit: 1000 })
    const docs = all.docs || []

    return {
      totalWords: docs.length,
      masteredWords: docs.filter((w: any) => w.status === 'mastered').length,
      learningWords: docs.filter((w: any) => w.status === 'learning').length,
      newWords: docs.filter((w: any) => w.status === 'new').length,
    }
  },
}

// Translation History API
export const translationHistoryAPI = {
  async getByCustomer(customerId: string, options: any = {}) {
    const { limit = 50, page = 1, mode, isFavorite, search } = options
    let query = `where[customer][equals]=${customerId}&limit=${limit}&page=${page}&sort=-createdAt`

    if (mode) query += `&where[mode][equals]=${mode}`
    if (isFavorite !== undefined) query += `&where[isFavorite][equals]=${isFavorite}`
    if (search) query += `&where[originalText][contains]=${encodeURIComponent(search)}`

    return payloadAPI(`/translation-history?${query}`)
  },

  async create(data: any) {
    return payloadAPI('/translation-history', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: any) {
    return payloadAPI(`/translation-history/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string) {
    return payloadAPI(`/translation-history/${id}`, {
      method: 'DELETE',
    })
  },

  async getStats(customerId: string) {
    const all = await this.getByCustomer(customerId, { limit: 1000 })
    const docs = all.docs || []

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - 7)

    // Generate recent activity for the last 7 days
    const recentActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const count = docs.filter((t: any) => {
        const createdAt = new Date(t.createdAt)
        return createdAt >= dayStart && createdAt <= dayEnd
      }).length

      recentActivity.push({
        date: date.toISOString().split('T')[0],
        count,
      })
    }

    // Find longest translation
    const longestTranslation =
      docs.length > 0 ? Math.max(...docs.map((t: any) => t.characterCount || 0)) : 0

    return {
      totalTranslations: docs.length,
      todayTranslations: docs.filter((t: any) => new Date(t.createdAt) >= today).length,
      thisWeekTranslations: docs.filter((t: any) => new Date(t.createdAt) >= thisWeek).length,
      favoriteTranslations: docs.filter((t: any) => t.isFavorite).length,
      averageCharacterCount:
        docs.length > 0
          ? Math.round(
              docs.reduce((sum: number, t: any) => sum + (t.characterCount || 0), 0) / docs.length,
            )
          : 0,
      longestTranslation,
      recentActivity,
    }
  },
}

// Learning Goals API
export const learningGoalsAPI = {
  async getByCustomer(customerId: string, options: any = {}) {
    const { status = 'active', category } = options
    let query = `where[customer][equals]=${customerId}&where[status][equals]=${status}&sort=-createdAt`

    if (category) query += `&where[category][equals]=${category}`

    return payloadAPI(`/learning-goals?${query}`)
  },

  async create(data: any) {
    return payloadAPI('/learning-goals', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: any) {
    return payloadAPI(`/learning-goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async updateProgress(id: string, current: number) {
    return this.update(id, { current })
  },
}

// User Preferences API
export const userPreferencesAPI = {
  async get(customerId: string) {
    return payloadAPI(`/user-preferences?where[customer][equals]=${customerId}&limit=1`)
  },

  async create(data: any) {
    return payloadAPI('/user-preferences', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: any) {
    return payloadAPI(`/user-preferences/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async upsert(customerId: string, data: any) {
    try {
      const existing = await this.get(customerId)
      if (existing.docs.length > 0) {
        return this.update(existing.docs[0].id, data)
      } else {
        return this.create({ ...data, customer: customerId })
      }
    } catch (error) {
      return this.create({ ...data, customer: customerId })
    }
  },
}

// Achievements API
export const achievementsAPI = {
  async getAll() {
    return payloadAPI('/achievements?where[isActive][equals]=true&sort=order')
  },

  async getUserAchievements(customerId: string) {
    return payloadAPI(
      `/user-achievements?where[customer][equals]=${customerId}&populate=achievement`,
    )
  },

  async unlockAchievement(customerId: string, achievementId: string, progress = 100) {
    return payloadAPI('/user-achievements', {
      method: 'POST',
      body: JSON.stringify({
        customer: customerId,
        achievement: achievementId,
        progress,
        unlockedAt: new Date().toISOString(),
      }),
    })
  },
}

// Practice Sessions API
export const practiceAPI = {
  async getByCustomer(customerId: string, options: any = {}) {
    const { limit = 50, page = 1, sessionType } = options
    let query = `where[customer][equals]=${customerId}&limit=${limit}&page=${page}&sort=-createdAt`

    if (sessionType) query += `&where[sessionType][equals]=${sessionType}`

    return payloadAPI(`/practice-sessions?${query}`)
  },

  async create(data: any) {
    return payloadAPI('/practice-sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: any) {
    return payloadAPI(`/practice-sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string) {
    return payloadAPI(`/practice-sessions/${id}`, {
      method: 'DELETE',
    })
  },

  async getStats(customerId: string) {
    const sessions = await this.getByCustomer(customerId, { limit: 1000 })

    if (!sessions.docs || sessions.docs.length === 0) {
      return {
        totalSessions: 0,
        totalTimeSpent: 0,
        averageScore: 0,
        currentStreak: 0,
        sessionTypes: {},
        recentSessions: [],
      }
    }

    const totalSessions = sessions.docs.length
    const totalTimeSpent = sessions.docs.reduce(
      (sum: number, session: any) => sum + (session.timeSpent || 0),
      0,
    )
    const totalScore = sessions.docs.reduce(
      (sum: number, session: any) => sum + (session.score || 0),
      0,
    )
    const averageScore = totalSessions > 0 ? Math.round(totalScore / totalSessions) : 0

    // Calculate streak (consecutive days with practice)
    const sessionDates = sessions.docs
      .map((session: any) => new Date(session.createdAt).toDateString())
      .filter((date: string, index: number, arr: string[]) => arr.indexOf(date) === index)
      .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime())

    let currentStreak = 0
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

    if (sessionDates.includes(today) || sessionDates.includes(yesterday)) {
      const startDate = sessionDates.includes(today) ? today : yesterday
      const checkDate = new Date(startDate)

      for (const dateStr of sessionDates) {
        if (dateStr === checkDate.toDateString()) {
          currentStreak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
    }

    // Session types breakdown
    const sessionTypes = sessions.docs.reduce((acc: any, session: any) => {
      const type = session.sessionType || 'unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    return {
      totalSessions,
      totalTimeSpent,
      averageScore,
      currentStreak,
      sessionTypes,
      recentSessions: sessions.docs.slice(0, 5),
    }
  },

  async getWordsForPractice(customerId: string, options: any = {}) {
    const { limit = 20, difficulty, status } = options
    let query = `where[customer][equals]=${customerId}&limit=${limit}`

    if (difficulty) query += `&where[difficulty][equals]=${difficulty}`
    if (status) query += `&where[status][equals]=${status}`

    // Sort by spaced repetition algorithm (least recently practiced first, then by accuracy)
    query += '&sort=lastPracticed,accuracy'

    return vocabularyAPI.getByCustomer(customerId, { limit, difficulty, status })
  },
}

// Helper function to get current customer ID
export async function getCurrentCustomerId(): Promise<string | null> {
  try {
    const token = getAuthTokenFromDocument()
    if (!token) return null

    const response = await payloadAPI('/customers/me')
    return response.user?.id || null
  } catch (error) {
    console.error('Error getting current customer:', error)
    return null
  }
}
