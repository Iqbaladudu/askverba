import { translateWithCache } from '@/lib/services/translationService'

export async function translateDetailedAction(
  text: string,
  userId?: string,
  saveToHistory: boolean = false,
) {
  try {
    const response = await translateWithCache({
      text,
      mode: 'detailed',
      userId,
      saveToHistory,
    })

    return {
      result: response.result,
      fromCache: response.fromCache,
      processingTime: response.processingTime,
    }
  } catch (error) {
    console.error('translateDetailed error:', error)
    throw new Error('Failed to translate text')
  }
}
