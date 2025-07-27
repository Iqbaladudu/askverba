import type { CollectionConfig } from 'payload'

export const Vocabulary: CollectionConfig = {
  slug: 'vocabulary',
  admin: {
    useAsTitle: 'word',
    defaultColumns: ['word', 'translation', 'customer', 'status', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      return user?.collection === 'customers' || user?.collection === 'users'
    },
    create: ({ req: { user } }) => {
      return user?.collection === 'customers' || user?.collection === 'users'
    },
    update: ({ req: { user } }) => {
      if (user?.collection === 'customers' || user?.collection === 'users') {
        return true
      }
      return false
    },
    delete: ({ req: { user } }) => {
      if (user?.collection === 'customers' || user?.collection === 'users') {
        return true
      }
      return false
    },
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'word',
      type: 'text',
      required: true,
      label: 'Word/Phrase',
    },
    {
      name: 'translation',
      type: 'text',
      required: true,
      label: 'Translation',
    },
    {
      name: 'pronunciation',
      type: 'text',
      label: 'Pronunciation (IPA)',
    },
    {
      name: 'definition',
      type: 'textarea',
      label: 'Definition',
    },
    {
      name: 'example',
      type: 'textarea',
      label: 'Example Sentence',
    },
    {
      name: 'difficulty',
      type: 'select',
      options: [
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
      ],
      defaultValue: 'medium',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Learning', value: 'learning' },
        { label: 'Mastered', value: 'mastered' },
      ],
      defaultValue: 'new',
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'practiceCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'accuracy',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 100,
      admin: {
        position: 'sidebar',
        description: 'Accuracy percentage (0-100)',
      },
    },
    {
      name: 'lastPracticed',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sourceLanguage',
      type: 'text',
      defaultValue: 'English',
    },
    {
      name: 'targetLanguage',
      type: 'text',
      defaultValue: 'Indonesian',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // Auto-assign customer if creating from authenticated session
        if (operation === 'create' && req.user?.collection === 'customers') {
          data.customer = req.user.id
        }
        return data
      },
    ],
    beforeValidate: [
      async ({ data, operation, req, originalDoc }) => {
        // Ensure data exists
        if (!data) {
          return data
        }

        // Prevent duplicate vocabulary entries for the same customer
        if (operation === 'create' || (operation === 'update' && data.word)) {
          const payload = req.payload

          // Normalize the word for comparison (lowercase, trim)
          const normalizedWord = data.word?.toLowerCase().trim()

          if (!normalizedWord || !data.customer) {
            return data
          }

          // Build query to check for existing vocabulary
          const baseQuery = {
            customer: { equals: data.customer },
            word: { equals: normalizedWord },
            sourceLanguage: { equals: data.sourceLanguage || 'English' },
            targetLanguage: { equals: data.targetLanguage || 'Indonesian' },
          }

          // For updates, exclude the current document
          const whereQuery =
            operation === 'update' && originalDoc?.id
              ? {
                  and: [baseQuery, { id: { not_equals: originalDoc.id } }],
                }
              : baseQuery

          try {
            const existingVocabulary = await payload.find({
              collection: 'vocabulary',
              where: whereQuery,
              limit: 1,
            })

            if (existingVocabulary.docs.length > 0) {
              const existing = existingVocabulary.docs[0]
              throw new Error(
                `Vocabulary "${data.word}" already exists for this language pair (${data.sourceLanguage || 'English'} → ${data.targetLanguage || 'Indonesian'}). ` +
                  `Existing entry: "${existing.word}" → "${existing.translation}"`,
              )
            }

            // Normalize the word in data for consistent storage
            data.word = normalizedWord
          } catch (error) {
            // Re-throw validation errors
            if (error instanceof Error && error.message.includes('already exists')) {
              throw error
            }
            // Log other errors but don't block the operation
            console.error('Error checking for duplicate vocabulary:', error)
          }
        }

        return data
      },
    ],
  },
}
