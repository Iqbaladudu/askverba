// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Customers } from './collections/Customers'
import { Vocabulary } from './collections/Vocabulary'
import { TranslationHistory } from './collections/TranslationHistory'
import { UserProgress } from './collections/UserProgress'
import { LearningGoals } from './collections/LearningGoals'
import { UserPreferences } from './collections/UserPreferences'
import { Achievements, UserAchievements } from './collections/Achievements'
import { PracticeSessions } from './collections/PracticeSessions'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Customers,
    Vocabulary,
    TranslationHistory,
    UserProgress,
    LearningGoals,
    UserPreferences,
    Achievements,
    UserAchievements,
    PracticeSessions,
  ],
  editor: lexicalEditor(),
  csrf: ['localhost:3000'],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
