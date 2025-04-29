import { z } from 'zod'

// Schema for single term data (3 words or less)
const singleTermDataSchema = z.object({
  title: z.string(),
  main_translation: z.string(),
  meanings: z.string(),
  linguistic_analysis: z.string(),
  examples: z.string(),
  collocations: z.string(),
  comparisons: z.string(),
  usage_tips: z.string(),
})

// Schema for paragraph data (more than 3 words)
const paragraphDataSchema = z.object({
  title: z.string(),
  full_translation: z.string(),
  structure_analysis: z.string(),
  key_vocabulary: z.string(),
  cultural_context: z.string(),
  stylistic_notes: z.string(),
  alternative_translations: z.string(),
  learning_points: z.string(),
})

// Discriminated union schema
export const translationResultSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('single_term'),
    data: singleTermDataSchema,
  }),
  z.object({
    type: z.literal('paragraph'),
    data: paragraphDataSchema,
  }),
])

export type TranslationResult = z.infer<typeof translationResultSchema>
