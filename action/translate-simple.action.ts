import { translateWithCache } from '@/lib/services/translationService'
import { SimpleTranslationResult } from '@/components/schema'

export async function translateSimpleAction(
  text: string,
  userId?: string,
  saveToHistory: boolean = false,
): Promise<{
  result: SimpleTranslationResult
  fromCache?: boolean
  processingTime?: number
}> {
  try {
    const response = await translateWithCache({
      text,
      mode: 'simple',
      userId,
      saveToHistory,
    })

    return {
      result: response.result as SimpleTranslationResult,
      fromCache: response.fromCache,
      processingTime: response.processingTime,
    }
  } catch (error) {
    console.error('translateSimple error:', error)
    throw new Error('Failed to translate text')
  }
}
