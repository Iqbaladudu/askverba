import type { CollectionConfig } from 'payload'

export const UserPreferences: CollectionConfig = {
  slug: 'user-preferences',
  admin: {
    useAsTitle: 'customer',
    defaultColumns: ['customer', 'preferredLanguagePair', 'defaultTranslationMode', 'updatedAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      // Users can only read their own preferences
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
      unique: true,
    },
    // Language preferences
    {
      name: 'preferredLanguagePair',
      type: 'select',
      options: [
        { label: 'English → Indonesian', value: 'en-id' },
        { label: 'Indonesian → English', value: 'id-en' },
        { label: 'English → Spanish', value: 'en-es' },
        { label: 'English → French', value: 'en-fr' },
      ],
      defaultValue: 'en-id',
    },
    {
      name: 'nativeLanguage',
      type: 'text',
      defaultValue: 'Indonesian',
    },
    {
      name: 'learningLanguages',
      type: 'array',
      fields: [
        {
          name: 'language',
          type: 'text',
          required: true,
        },
        {
          name: 'proficiencyLevel',
          type: 'select',
          options: [
            { label: 'Beginner', value: 'beginner' },
            { label: 'Elementary', value: 'elementary' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Upper Intermediate', value: 'upper-intermediate' },
            { label: 'Advanced', value: 'advanced' },
            { label: 'Expert', value: 'expert' },
          ],
        },
      ],
    },
    // Translation preferences
    {
      name: 'defaultTranslationMode',
      type: 'select',
      options: [
        { label: 'Simple', value: 'simple' },
        { label: 'Detailed', value: 'detailed' },
      ],
      defaultValue: 'simple',
    },
    {
      name: 'autoSaveTranslations',
      type: 'checkbox',
      defaultValue: true,
      label: 'Auto-save translations to history',
    },
    {
      name: 'autoAddToVocabulary',
      type: 'checkbox',
      defaultValue: false,
      label: 'Auto-add new words to vocabulary',
    },
    // Learning preferences
    {
      name: 'dailyGoalWords',
      type: 'number',
      defaultValue: 5,
      label: 'Daily vocabulary goal',
    },
    {
      name: 'dailyGoalTranslations',
      type: 'number',
      defaultValue: 10,
      label: 'Daily translation goal',
    },
    {
      name: 'studyReminderTime',
      type: 'text',
      label: 'Study reminder time (HH:MM)',
      admin: {
        description: 'Time for daily study reminders (24-hour format)',
      },
    },
    {
      name: 'weeklyGoalWords',
      type: 'number',
      defaultValue: 35,
      label: 'Weekly vocabulary goal',
    },
    // UI preferences
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
      name: 'fontSize',
      type: 'select',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
      defaultValue: 'medium',
    },
    {
      name: 'showPronunciation',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show pronunciation guides',
    },
    {
      name: 'enableSoundEffects',
      type: 'checkbox',
      defaultValue: true,
      label: 'Enable sound effects',
    },
    // Notification preferences
    {
      name: 'emailNotifications',
      type: 'group',
      fields: [
        {
          name: 'dailyReminders',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'weeklyProgress',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'achievements',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'goalDeadlines',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'pushNotifications',
      type: 'group',
      fields: [
        {
          name: 'studyReminders',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'streakReminders',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'newFeatures',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    // Privacy preferences
    {
      name: 'profileVisibility',
      type: 'select',
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Friends Only', value: 'friends' },
        { label: 'Private', value: 'private' },
      ],
      defaultValue: 'private',
    },
    {
      name: 'shareProgress',
      type: 'checkbox',
      defaultValue: false,
      label: 'Allow sharing progress with friends',
    },
    {
      name: 'dataCollection',
      type: 'checkbox',
      defaultValue: true,
      label: 'Allow anonymous usage data collection for improvement',
    },
    // Advanced preferences
    {
      name: 'aiModelPreference',
      type: 'select',
      options: [
        { label: 'Balanced (Recommended)', value: 'balanced' },
        { label: 'Fast', value: 'fast' },
        { label: 'Accurate', value: 'accurate' },
      ],
      defaultValue: 'balanced',
    },
    {
      name: 'maxTranslationLength',
      type: 'number',
      defaultValue: 500,
      label: 'Maximum translation length (characters)',
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
