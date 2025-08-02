/**
 * Client-side API layer for calling API routes
 * This replaces the direct server action calls in client components
 */

// Helper function to create URLSearchParams without undefined values
function createCleanParams(params: Record<string, any>): URLSearchParams {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== null),
  )
  return new URLSearchParams(filteredParams)
}

// Base API function for client-side requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

// User Progress API
export const userProgressAPI = {
  async get(customerId: string) {
    return apiRequest(`/user-progress?customerId=${customerId}`)
  },

  async create(data: any) {
    return apiRequest('/user-progress', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: any) {
    return apiRequest(`/user-progress/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async upsert(customerId: string, data: any) {
    return apiRequest('/user-progress', {
      method: 'PUT',
      body: JSON.stringify({ customerId, data }),
    })
  },
}

// Vocabulary API (using custom endpoint to avoid conflicts with Payload admin)
export const vocabularyAPI = {
  async getByCustomer(customerId: string, options: any = {}) {
    const params = createCleanParams({
      customerId,
      ...options,
    })
    return apiRequest(`/custom/vocabulary?${params.toString()}`)
  },

  async create(data: any) {
    return apiRequest('/custom/vocabulary', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: any) {
    return apiRequest('/custom/vocabulary', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    })
  },

  async delete(id: string) {
    return apiRequest(`/custom/vocabulary?id=${id}`, {
      method: 'DELETE',
    })
  },

  async getStats(customerId: string) {
    return apiRequest(`/custom/vocabulary/stats?customerId=${customerId}`)
  },
}

// Translation History API
export const translationHistoryAPI = {
  async getByCustomer(customerId: string, options: any = {}) {
    const params = createCleanParams({
      customerId,
      ...options,
    })
    return apiRequest(`/translation-history?${params.toString()}`)
  },

  async create(data: any) {
    return apiRequest('/translation-history', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: any) {
    return apiRequest(`/translation-history/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string) {
    return apiRequest(`/translation-history/${id}`, {
      method: 'DELETE',
    })
  },

  async getStats(customerId: string) {
    return apiRequest(`/translation-history/stats?customerId=${customerId}`)
  },
}

// Learning Goals API
export const learningGoalsAPI = {
  async getByCustomer(customerId: string, options: any = {}) {
    const params = createCleanParams({
      customerId,
      ...options,
    })
    return apiRequest(`/learning-goals?${params.toString()}`)
  },

  async create(data: any) {
    return apiRequest('/learning-goals', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: any) {
    return apiRequest(`/learning-goals/${id}`, {
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
    return apiRequest(`/user-preferences?customerId=${customerId}`)
  },

  async create(data: any) {
    return apiRequest('/user-preferences', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: any) {
    return apiRequest(`/user-preferences/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async upsert(customerId: string, data: any) {
    return apiRequest('/user-preferences', {
      method: 'PUT',
      body: JSON.stringify({ customerId, data }),
    })
  },
}

// Achievements API
export const achievementsAPI = {
  async getAll() {
    return apiRequest('/achievements')
  },

  async getUserAchievements(customerId: string) {
    return apiRequest(`/user-achievements?customerId=${customerId}`)
  },

  async unlockAchievement(customerId: string, achievementId: string, progress = 100) {
    return apiRequest('/user-achievements', {
      method: 'POST',
      body: JSON.stringify({
        customerId,
        achievementId,
        progress,
      }),
    })
  },
}

// Practice Sessions API
export const practiceAPI = {
  async getByCustomer(customerId: string, options: any = {}) {
    const params = createCleanParams({
      customerId,
      ...options,
    })
    return apiRequest(`/practice-sessions?${params.toString()}`)
  },

  async create(data: any) {
    return apiRequest('/practice-sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: any) {
    return apiRequest(`/practice-sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string) {
    return apiRequest(`/practice-sessions/${id}`, {
      method: 'DELETE',
    })
  },

  async getStats(customerId: string) {
    return apiRequest(`/practice-sessions/stats?customerId=${customerId}`)
  },

  async getWordsForPractice(customerId: string, options: any = {}) {
    const params = createCleanParams({
      customerId,
      ...options,
    })
    return apiRequest(`/vocabulary/practice?${params.toString()}`)
  },
}

// Helper function to get current customer ID
export async function getCurrentCustomerId(): Promise<string | null> {
  try {
    const response = await apiRequest('/auth/me')
    return response.user?.id || null
  } catch (error) {
    console.error('Error getting current customer:', error)
    return null
  }
}
