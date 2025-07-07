import type { CollectionConfig } from 'payload'

export const Vocabulary: CollectionConfig = {
  slug: 'vocabulary',
  admin: {
    useAsTitle: 'word',
    defaultColumns: ['word', 'translation', 'customer', 'status', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      // Users can only read their own vocabulary
      if (user?.collection === 'customers') {
        return {
          customer: {
            equals: user.id,
          },
        }
      }
      return true // Admins can read all
    },
    create: ({ req: { user } }) => {
      return user?.collection === 'customers' || user?.collection === 'users'
    },
    update: ({ req: { user } }) => {
      if (user?.collection === 'customers') {
        return {
          customer: {
            equals: user.id,
          },
        }
      }
      return true
    },
    delete: ({ req: { user } }) => {
      if (user?.collection === 'customers') {
        return {
          customer: {
            equals: user.id,
          },
        }
      }
      return true
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
  },
}
