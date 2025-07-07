import type { CollectionConfig } from 'payload'

export const TranslationHistory: CollectionConfig = {
  slug: 'translation-history',
  admin: {
    useAsTitle: 'originalText',
    defaultColumns: ['originalText', 'customer', 'mode', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      // Users can only read their own translation history
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
      name: 'originalText',
      type: 'textarea',
      required: true,
      label: 'Original Text',
    },
    {
      name: 'translatedText',
      type: 'textarea',
      required: true,
      label: 'Translated Text',
    },
    {
      name: 'sourceLanguage',
      type: 'text',
      required: true,
      defaultValue: 'English',
    },
    {
      name: 'targetLanguage',
      type: 'text',
      required: true,
      defaultValue: 'Indonesian',
    },
    {
      name: 'mode',
      type: 'select',
      options: [
        { label: 'Simple', value: 'simple' },
        { label: 'Detailed', value: 'detailed' },
      ],
      required: true,
    },
    {
      name: 'characterCount',
      type: 'number',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'confidence',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        position: 'sidebar',
        description: 'Translation confidence percentage',
      },
    },
    {
      name: 'isFavorite',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'detailedResult',
      type: 'json',
      label: 'Detailed Translation Result',
      admin: {
        description: 'Stores the full detailed translation result for complex translations',
      },
    },
    {
      name: 'processingTime',
      type: 'number',
      label: 'Processing Time (ms)',
      admin: {
        position: 'sidebar',
        description: 'Time taken to process the translation',
      },
    },
    {
      name: 'aiModel',
      type: 'text',
      label: 'AI Model Used',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // Auto-assign customer if creating from authenticated session
        if (operation === 'create' && req.user?.collection === 'customers') {
          data.customer = req.user.id
        }
        
        // Auto-calculate character count
        if (data.originalText) {
          data.characterCount = data.originalText.length
        }
        
        return data
      },
    ],
  },
}
