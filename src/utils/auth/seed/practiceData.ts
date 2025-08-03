import { getPayload } from 'payload'
import config from '@payload-config'

export async function seedPracticeData() {
  try {
    const payload = await getPayload({ config })

    // Seed achievements
    const achievements = [
      {
        title: 'First Steps',
        description: 'Complete your first practice session',
        icon: '🎯',
        slug: 'first_practice',
        category: 'practice',
        points: 10,
        isActive: true,
        requirements: {
          type: 'practice_sessions',
          value: 1,
          condition: 'gte',
        },
      },
      {
        title: 'Perfect Practice',
        description: 'Score 100% in a practice session',
        icon: '💯',
        slug: 'perfect_score',
        category: 'practice',
        points: 25,
        isActive: true,
        requirements: {
          type: 'accuracy',
          value: 100,
          condition: 'gte',
        },
      },
      {
        title: 'Speed Demon',
        description: 'Complete a practice session in under 2 minutes',
        icon: '⚡',
        slug: 'speed_demon',
        category: 'practice',
        points: 20,
        isActive: true,
        requirements: {
          type: 'time_spent',
          value: 120,
          condition: 'lte',
        },
      },
      {
        title: 'Consistency King',
        description: 'Practice for 7 days in a row',
        icon: '👑',
        slug: 'consistency_king',
        category: 'streak',
        points: 50,
        isActive: true,
        requirements: {
          type: 'streak_days',
          value: 7,
          condition: 'gte',
        },
      },
      {
        title: 'Practice Master',
        description: 'Complete 50 practice sessions',
        icon: '🏆',
        slug: 'practice_master',
        category: 'practice',
        points: 100,
        isActive: true,
        requirements: {
          type: 'practice_sessions',
          value: 50,
          condition: 'gte',
        },
      },
    ]

    console.log('Seeding achievements...')
    for (const achievement of achievements) {
      try {
        // Check if achievement already exists
        const existing = await payload.find({
          collection: 'achievements',
          where: {
            slug: { equals: achievement.slug },
          },
          limit: 1,
        })

        if (existing.docs.length === 0) {
          await payload.create({
            collection: 'achievements',
            data: achievement,
          })
          console.log(`✓ Created achievement: ${achievement.title}`)
        } else {
          console.log(`- Achievement already exists: ${achievement.title}`)
        }
      } catch (error) {
        console.error(`Error creating achievement ${achievement.title}:`, error)
      }
    }

    console.log('Practice data seeding completed!')
    return true
  } catch (error) {
    console.error('Error seeding practice data:', error)
    return false
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPracticeData()
    .then(() => {
      console.log('Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}
