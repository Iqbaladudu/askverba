import type { CollectionConfig } from 'payload'

export const UserProgress: CollectionConfig = {
  slug: 'user-progress',
  admin: {
    useAsTitle: 'customer',
    defaultColumns: ['customer', 'currentStreak', 'totalWordsLearned', 'updatedAt'],
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
      unique: true,
    },
    // Streak tracking
    {
      name: 'currentStreak',
      type: 'number',
      defaultValue: 0,
      label: 'Current Daily Streak',
    },
    {
      name: 'longestStreak',
      type: 'number',
      defaultValue: 0,
      label: 'Longest Streak',
    },
    {
      name: 'lastActivityDate',
      type: 'date',
      label: 'Last Activity Date',
    },
    // Learning statistics
    {
      name: 'totalWordsLearned',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'masteredWords',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'learningWords',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'newWords',
      type: 'number',
      defaultValue: 0,
    },
    // Translation statistics
    {
      name: 'totalTranslations',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'todayTranslations',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'thisWeekTranslations',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'averageAccuracy',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 100,
    },
    // Study time tracking
    {
      name: 'totalStudyTimeMinutes',
      type: 'number',
      defaultValue: 0,
      label: 'Total Study Time (minutes)',
    },
    {
      name: 'todayStudyTimeMinutes',
      type: 'number',
      defaultValue: 0,
      label: 'Today Study Time (minutes)',
    },
    {
      name: 'averageStudyTimePerDay',
      type: 'number',
      defaultValue: 0,
      label: 'Average Study Time Per Day (minutes)',
    },
    // Level and achievements
    {
      name: 'currentLevel',
      type: 'select',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Elementary', value: 'elementary' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Upper Intermediate', value: 'upper-intermediate' },
        { label: 'Advanced', value: 'advanced' },
        { label: 'Expert', value: 'expert' },
      ],
      defaultValue: 'beginner',
    },
    {
      name: 'totalAchievements',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'experiencePoints',
      type: 'number',
      defaultValue: 0,
      label: 'XP Points',
    },
    // Weekly activity data (for heatmap)
    {
      name: 'weeklyActivity',
      type: 'array',
      maxRows: 7,
      fields: [
        {
          name: 'day',
          type: 'text',
          required: true,
        },
        {
          name: 'wordsLearned',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'accuracy',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'studyTimeMinutes',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'translationsCount',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
    // Performance metrics
    {
      name: 'averageResponseTime',
      type: 'number',
      defaultValue: 0,
      label: 'Average Response Time (seconds)',
    },
    {
      name: 'difficultyBreakdown',
      type: 'group',
      fields: [
        {
          name: 'easy',
          type: 'group',
          fields: [
            { name: 'accuracy', type: 'number', defaultValue: 0 },
            { name: 'count', type: 'number', defaultValue: 0 },
          ],
        },
        {
          name: 'medium',
          type: 'group',
          fields: [
            { name: 'accuracy', type: 'number', defaultValue: 0 },
            { name: 'count', type: 'number', defaultValue: 0 },
          ],
        },
        {
          name: 'hard',
          type: 'group',
          fields: [
            { name: 'accuracy', type: 'number', defaultValue: 0 },
            { name: 'count', type: 'number', defaultValue: 0 },
          ],
        },
      ],
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
