'use server'

import { generateObject } from 'ai'
import {
  EN_ID_DETAILED_TRANSLATOR_PROMPT,
  SIMPLE_TRANSLATE_SYSTEM_PROMPT,
} from '@/utils/constants/prompt'
import { createMistral } from '@ai-sdk/mistral'
import {
  TranslationResult,
  translationResultSchema,
  SimpleTranslationResult,
  simpleTranslationSchema,
} from '@/utils/schema'
import { createXai } from '@ai-sdk/xai'

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY

export const mistral = createMistral({
  apiKey: MISTRAL_API_KEY,
})

export const xai = createXai({
  apiKey: process.env.XAI_API_KEY,
})

export async function translateSimple(text: string): Promise<SimpleTranslationResult> {
  try {
    const result = await generateObject({
      model: mistral('mistral-medium-latest'),
      schema: simpleTranslationSchema,
      system: SIMPLE_TRANSLATE_SYSTEM_PROMPT,
      prompt: text,
      temperature: 0.5, // Lower temperature for more consistent results
    })

    return result.object
  } catch (error) {
    console.error('translateSimple error:', error)
    throw new Error('Failed to generate simple translation')
  }
}

export async function translateDetailed(text: string): Promise<TranslationResult> {
  console.log(text)
  try {
    const result = await generateObject({
      model: mistral('mistral-medium-latest'),
      schema: translationResultSchema,
      system: EN_ID_DETAILED_TRANSLATOR_PROMPT,
      prompt: text,
      temperature: 0.5, // Lower temperature for more consistent results
    })

    return result.object
  } catch (error) {
    console.error('translateDetailed error:', error)
    throw new Error('Failed to generate detailed translation')
  }
}
