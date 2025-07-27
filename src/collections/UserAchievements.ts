import type { CollectionConfig } from 'payload'

export const UserAchievements: CollectionConfig = {
  slug: 'user-achievements',
  admin: {
    useAsTitle: 'achievement',
    defaultColumns: ['customer', 'achievement', 'progress', 'unlockedAt'],
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
      name: 'achievement',
      type: 'relationship',
      relationTo: 'achievements',
      required: true,
    },
    {
      name: 'progress',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
      defaultValue: 0,
      admin: {
        description: 'Progress percentage (0-100)',
      },
    },
    {
      name: 'unlockedAt',
      type: 'date',
      admin: {
        description: 'When the achievement was unlocked (null if not unlocked)',
      },
    },
    {
      name: 'isUnlocked',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether the achievement has been unlocked',
      },
    },
  ],
}
