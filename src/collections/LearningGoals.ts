import type { CollectionConfig } from 'payload'

export const LearningGoals: CollectionConfig = {
  slug: 'learning-goals',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'customer', 'category', 'status', 'deadline'],
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
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Goal Title',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Goal Description',
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Custom', value: 'custom' },
      ],
      required: true,
    },
    {
      name: 'target',
      type: 'number',
      required: true,
      label: 'Target Number',
    },
    {
      name: 'current',
      type: 'number',
      defaultValue: 0,
      label: 'Current Progress',
    },
    {
      name: 'unit',
      type: 'select',
      options: [
        { label: 'Words', value: 'words' },
        { label: 'Translations', value: 'translations' },
        { label: 'Minutes', value: 'minutes' },
        { label: 'Days', value: 'days' },
        { label: 'Sessions', value: 'sessions' },
      ],
      required: true,
    },
    {
      name: 'deadline',
      type: 'date',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Paused', value: 'paused' },
      ],
      defaultValue: 'active',
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
      defaultValue: 'medium',
    },
    {
      name: 'isRecurring',
      type: 'checkbox',
      defaultValue: false,
      label: 'Recurring Goal',
    },
    {
      name: 'recurringPeriod',
      type: 'select',
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
      ],
      admin: {
        condition: (data) => data.isRecurring,
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        condition: (data) => data.status === 'completed',
      },
    },
    {
      name: 'reward',
      type: 'text',
      label: 'Completion Reward',
      admin: {
        description: 'Achievement or reward for completing this goal',
      },
    },
    {
      name: 'milestones',
      type: 'array',
      fields: [
        {
          name: 'percentage',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
        },
        {
          name: 'description',
          type: 'text',
          required: true,
        },
        {
          name: 'achieved',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'achievedAt',
          type: 'date',
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

        // Auto-update status based on progress and deadline
        if (data.target && data.current) {
          const progressPercentage = (data.current / data.target) * 100

          if (progressPercentage >= 100 && data.status !== 'completed') {
            data.status = 'completed'
            data.completedAt = new Date().toISOString()
          } else if (new Date(data.deadline) < new Date() && data.status === 'active') {
            data.status = 'overdue'
          }
        }

        return data
      },
    ],
  },
}
