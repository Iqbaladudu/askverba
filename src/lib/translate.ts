'use server'

import { generateObject, generateText } from 'ai'
import { EN_ID_DETAILED_TRANSLATOR_PROMPT, SIMPLE_TRANSLATE_SYSTEM_PROMPT } from '@/constant/prompt'
import { createMistral } from '@ai-sdk/mistral'
import { TranslationResult, translationResultSchema } from '@/components/schema'
import { createXai } from '@ai-sdk/xai'

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY

export const mistral = createMistral({
  apiKey: MISTRAL_API_KEY,
})

export const xai = createXai({
  apiKey: process.env.XAI_API_KEY,
})

export async function translateSimple(text: string) {
  const result = await generateText({
    model: xai('grok-3-mini-fast-latest'),
    system: SIMPLE_TRANSLATE_SYSTEM_PROMPT,
    prompt: `${text}`,
  })

  return result.text
}

export async function translateDetailed(text: string): Promise<TranslationResult> {
  try {
    const result = await generateObject({
      model: mistral('mistral-large-2402'),
      schema: translationResultSchema,
      system: EN_ID_DETAILED_TRANSLATOR_PROMPT,
      prompt: text,
    })

    return result.object
  } catch (error) {
    console.error('translateDetailed error:', error)
    throw new Error('Failed to generate detailed translation')
  }
}
