import type { CollectionConfig } from 'payload'

export const PracticeSessions: CollectionConfig = {
  slug: 'practice-sessions',
  admin: {
    useAsTitle: 'sessionType',
    defaultColumns: ['sessionType', 'customer', 'score', 'timeSpent', 'createdAt'],
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
      name: 'sessionType',
      type: 'select',
      options: [
        { label: 'Flashcard', value: 'flashcard' },
        { label: 'Multiple Choice', value: 'multiple_choice' },
        { label: 'Fill Blanks', value: 'fill_blanks' },
        { label: 'Listening', value: 'listening' },
        { label: 'Mixed', value: 'mixed' },
      ],
      required: true,
    },
    {
      name: 'words',
      type: 'array',
      fields: [
        {
          name: 'vocabularyId',
          type: 'text',
          required: true,
        },
        {
          name: 'isCorrect',
          type: 'checkbox',
          defaultValue: false,
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
        },
        {
          name: 'userAnswer',
          type: 'text',
        },
      ],
    },
    {
      name: 'score',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
      admin: {
        description: 'Score percentage (0-100)',
      },
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
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
      ],
      defaultValue: 'medium',
    },
    {
      name: 'metadata',
      type: 'group',
      fields: [
        {
          name: 'totalQuestions',
          type: 'number',
          min: 1,
        },
        {
          name: 'correctAnswers',
          type: 'number',
          min: 0,
        },
        {
          name: 'averageTimePerQuestion',
          type: 'number',
          min: 0,
        },
        {
          name: 'streakCount',
          type: 'number',
          min: 0,
          defaultValue: 0,
        },
      ],
    },
  ],
}
