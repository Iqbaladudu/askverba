import type { CollectionConfig } from 'payload'

export const Achievements: CollectionConfig = {
  slug: 'achievements',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'difficulty', 'isActive'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Achievement Title',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Achievement Description',
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Vocabulary', value: 'vocabulary' },
        { label: 'Translation', value: 'translation' },
        { label: 'Streak', value: 'streak' },
        { label: 'Study Time', value: 'study-time' },
        { label: 'Accuracy', value: 'accuracy' },
        { label: 'Goals', value: 'goals' },
        { label: 'Special', value: 'special' },
      ],
      required: true,
    },
    {
      name: 'difficulty',
      type: 'select',
      options: [
        { label: 'Bronze', value: 'bronze' },
        { label: 'Silver', value: 'silver' },
        { label: 'Gold', value: 'gold' },
        { label: 'Platinum', value: 'platinum' },
        { label: 'Diamond', value: 'diamond' },
      ],
      required: true,
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Icon Name (Lucide)',
      admin: {
        description: 'Lucide icon name for the achievement',
      },
    },
    {
      name: 'badgeImage',
      type: 'relationship',
      relationTo: 'media',
      label: 'Badge Image',
    },
    {
      name: 'color',
      type: 'text',
      label: 'Badge Color (Hex)',
      defaultValue: '#FF5B9E',
    },
    {
      name: 'requirements',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Words Learned', value: 'words_learned' },
            { label: 'Translations Count', value: 'translations_count' },
            { label: 'Streak Days', value: 'streak_days' },
            { label: 'Study Time Hours', value: 'study_time_hours' },
            { label: 'Accuracy Percentage', value: 'accuracy_percentage' },
            { label: 'Goals Completed', value: 'goals_completed' },
            { label: 'Custom', value: 'custom' },
          ],
          required: true,
        },
        {
          name: 'target',
          type: 'number',
          required: true,
          label: 'Target Value',
        },
        {
          name: 'customCondition',
          type: 'textarea',
          label: 'Custom Condition (JSON)',
          admin: {
            condition: (data) => data.requirements?.type === 'custom',
            description: 'JSON object describing custom achievement conditions',
          },
        },
      ],
    },
    {
      name: 'rewards',
      type: 'group',
      fields: [
        {
          name: 'experiencePoints',
          type: 'number',
          defaultValue: 0,
          label: 'XP Reward',
        },
        {
          name: 'title',
          type: 'text',
          label: 'Title Reward',
        },
        {
          name: 'specialFeature',
          type: 'text',
          label: 'Special Feature Unlock',
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active Achievement',
    },
    {
      name: 'isHidden',
      type: 'checkbox',
      defaultValue: false,
      label: 'Hidden Achievement',
      admin: {
        description: 'Hidden achievements are not shown until unlocked',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Display Order',
    },
  ],
}

// User Achievements (Junction table)
export const UserAchievements: CollectionConfig = {
  slug: 'user-achievements',
  admin: {
    useAsTitle: 'achievement',
    defaultColumns: ['customer', 'achievement', 'unlockedAt'],
  },
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
    },
    {
      name: 'achievement',
      type: 'relationship',
      relationTo: 'achievements',
      required: true,
    },
    {
      name: 'unlockedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'progress',
      type: 'number',
      defaultValue: 0,
      label: 'Progress towards achievement',
    },
    {
      name: 'isNotified',
      type: 'checkbox',
      defaultValue: false,
      label: 'User has been notified',
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
