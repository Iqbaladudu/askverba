import type { CollectionConfig } from 'payload'

export const UserPreferences: CollectionConfig = {
  slug: 'user-preferences',
  admin: {
    useAsTitle: 'customer',
    defaultColumns: ['customer', 'language', 'theme', 'updatedAt'],
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
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'language',
      type: 'select',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Indonesian', value: 'id' },
      ],
      defaultValue: 'id',
    },
    {
      name: 'theme',
      type: 'select',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'System', value: 'system' },
      ],
      defaultValue: 'system',
    },
    {
      name: 'notifications',
      type: 'group',
      fields: [
        {
          name: 'email',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'push',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'practice',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'achievements',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'practiceSettings',
      type: 'group',
      fields: [
        {
          name: 'defaultDifficulty',
          type: 'select',
          options: [
            { label: 'Easy', value: 'easy' },
            { label: 'Medium', value: 'medium' },
            { label: 'Hard', value: 'hard' },
          ],
          defaultValue: 'medium',
        },
        {
          name: 'sessionLength',
          type: 'number',
          min: 5,
          max: 60,
          defaultValue: 20,
          admin: {
            description: 'Default practice session length in minutes',
          },
        },
        {
          name: 'autoSpeak',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Automatically speak words during practice',
          },
        },
        {
          name: 'showHints',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show hints during practice',
          },
        },
      ],
    },
    {
      name: 'translationSettings',
      type: 'group',
      fields: [
        {
          name: 'defaultMode',
          type: 'select',
          options: [
            { label: 'Simple', value: 'simple' },
            { label: 'Detailed', value: 'detailed' },
          ],
          defaultValue: 'simple',
        },
        {
          name: 'autoExtractVocabulary',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'saveHistory',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
  ],
}
