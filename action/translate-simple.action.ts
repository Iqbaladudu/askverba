import { translateSimple } from '@/lib/translate'

export async function translateSimpleAction(text: string) {
  try {
    console.log(text)
    const result = await translateSimple(text)
    return result
  } catch (error) {
    console.error('translateSimple error:', error)
    throw new Error('Failed to translate text')
  }
}
