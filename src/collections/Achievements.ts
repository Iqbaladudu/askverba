import type { CollectionConfig } from 'payload'

export const Achievements: CollectionConfig = {
  slug: 'achievements',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'points', 'isActive'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      return user?.collection === 'users'
    },
    update: ({ req: { user } }) => {
      return user?.collection === 'users'
    },
    delete: ({ req: { user } }) => {
      return user?.collection === 'users'
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'icon',
      type: 'text',
      required: true,
      admin: {
        description: 'Emoji or icon identifier',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier for the achievement',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Practice', value: 'practice' },
        { label: 'Translation', value: 'translation' },
        { label: 'Vocabulary', value: 'vocabulary' },
        { label: 'Streak', value: 'streak' },
        { label: 'General', value: 'general' },
      ],
      required: true,
    },
    {
      name: 'points',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Points awarded for this achievement',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order (lower numbers appear first)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this achievement is currently available',
      },
    },
    {
      name: 'requirements',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Practice Sessions', value: 'practice_sessions' },
            { label: 'Translation Count', value: 'translation_count' },
            { label: 'Vocabulary Count', value: 'vocabulary_count' },
            { label: 'Streak Days', value: 'streak_days' },
            { label: 'Accuracy', value: 'accuracy' },
            { label: 'Time Spent', value: 'time_spent' },
          ],
        },
        {
          name: 'value',
          type: 'number',
          min: 0,
        },
        {
          name: 'condition',
          type: 'select',
          options: [
            { label: 'Greater Than or Equal', value: 'gte' },
            { label: 'Equal To', value: 'eq' },
            { label: 'Less Than or Equal', value: 'lte' },
          ],
          defaultValue: 'gte',
        },
      ],
    },
  ],
}
