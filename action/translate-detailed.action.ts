import { translateDetailed } from '@/lib/translate'

export async function translateDetailedAction(text: string) {
  try {
    const result = await translateDetailed(text)
    console.log(result.data)
    return result.data
  } catch (error) {
    console.error('translateSimple error:', error)
    throw new Error('Failed to translate text')
  }
}
