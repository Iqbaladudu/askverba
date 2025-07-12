import type { CollectionConfig } from 'payload'

export const PracticeSessions: CollectionConfig = {
  slug: 'practice-sessions',
  access: {
    read: ({ req: { user } }) => {
      if (user?.collection === 'customers' || user?.collection === 'users') return true
      else return false
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (user?.collection === 'customers' || user?.collection === 'users') return true
      else return false
    },
    delete: ({ req: { user } }) => {
      if (user?.collection === 'customers' || user?.collection === 'users') return true
      else return false
    },
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      index: true,
    },
    {
      name: 'sessionType',
      type: 'select',
      required: true,
      options: [
        { label: 'Flashcard', value: 'flashcard' },
        { label: 'Multiple Choice', value: 'multiple_choice' },
        { label: 'Fill in Blanks', value: 'fill_blanks' },
        { label: 'Listening', value: 'listening' },
        { label: 'Spelling', value: 'spelling' },
        { label: 'Mixed Review', value: 'mixed' },
      ],
      index: true,
    },
    {
      name: 'words',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'vocabulary',
          type: 'relationship',
          relationTo: 'vocabulary',
          required: true,
        },
        {
          name: 'isCorrect',
          type: 'checkbox',
          required: true,
        },
        {
          name: 'timeSpent',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'attempts',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: 1,
        },
        {
          name: 'userAnswer',
          type: 'text',
        },
        {
          name: 'correctAnswer',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'score',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
    },
    {
      name: 'totalWords',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'correctWords',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'timeSpent',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Time spent in seconds',
      },
    },
    {
      name: 'difficulty',
      type: 'select',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
      ],
      defaultValue: 'beginner',
    },
    {
      name: 'completedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional session metadata (settings, preferences, etc.)',
      },
    },
  ],
  timestamps: true,
  admin: {
    useAsTitle: 'sessionType',
    defaultColumns: ['customer', 'sessionType', 'score', 'totalWords', 'completedAt'],
    listSearchableFields: ['customer', 'sessionType'],
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Update vocabulary practice statistics after session completion
        if (operation === 'create' && doc.words) {
          const payload = req.payload

          for (const wordResult of doc.words) {
            try {
              // Get current vocabulary item
              const vocabulary = await payload.findByID({
                collection: 'vocabulary',
                id: wordResult.vocabulary,
              })

              if (vocabulary) {
                // Calculate new practice statistics
                const currentPracticeCount = vocabulary.practiceCount || 0
                const currentAccuracy = vocabulary.accuracy || 0
                const newPracticeCount = currentPracticeCount + 1

                // Calculate new accuracy (weighted average)
                const newAccuracy =
                  currentPracticeCount === 0
                    ? wordResult.isCorrect
                      ? 100
                      : 0
                    : Math.round(
                        (currentAccuracy * currentPracticeCount +
                          (wordResult.isCorrect ? 100 : 0)) /
                          newPracticeCount,
                      )

                // Update vocabulary item
                await payload.update({
                  collection: 'vocabulary',
                  id: wordResult.vocabulary,
                  data: {
                    practiceCount: newPracticeCount,
                    accuracy: newAccuracy,
                    lastPracticed: new Date(),
                  },
                })
              }
            } catch (error) {
              console.error('Error updating vocabulary practice stats:', error)
            }
          }
        }
      },
    ],
  },
}
