'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { PracticeSessions, Achievement, UserAchievement } from '@/payload-types'

export interface PracticeAchievementCheck {
  sessionData: {
    sessionType: string
    score: number
    timeSpent: number
    totalWords: number
    correctAnswers: number
    streak?: number
  }
  userStats: {
    totalSessions: number
    averageScore: number
    currentStreak: number
    longestStreak: number
    sessionTypes: Record<string, number>
  }
}

// Define practice achievements
const PRACTICE_ACHIEVEMENTS = [
  {
    id: 'first_practice',
    title: 'First Steps',
    description: 'Complete your first practice session',
    icon: '🎯',
    condition: (data: PracticeAchievementCheck) => data.userStats.totalSessions >= 1,
    points: 10,
  },
  {
    id: 'perfect_score',
    title: 'Perfect Practice',
    description: 'Score 100% in a practice session',
    icon: '💯',
    condition: (data: PracticeAchievementCheck) => data.sessionData.score === 100,
    points: 25,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete a practice session in under 2 minutes',
    icon: '⚡',
    condition: (data: PracticeAchievementCheck) => data.sessionData.timeSpent < 120,
    points: 20,
  },
  {
    id: 'consistency_king',
    title: 'Consistency King',
    description: 'Practice for 7 days in a row',
    icon: '👑',
    condition: (data: PracticeAchievementCheck) => data.userStats.currentStreak >= 7,
    points: 50,
  },
  {
    id: 'practice_master',
    title: 'Practice Master',
    description: 'Complete 50 practice sessions',
    icon: '🏆',
    condition: (data: PracticeAchievementCheck) => data.userStats.totalSessions >= 50,
    points: 100,
  },
  {
    id: 'high_achiever',
    title: 'High Achiever',
    description: 'Maintain an average score of 90% or higher',
    icon: '🌟',
    condition: (data: PracticeAchievementCheck) => 
      data.userStats.averageScore >= 90 && data.userStats.totalSessions >= 10,
    points: 75,
  },
  {
    id: 'flashcard_expert',
    title: 'Flashcard Expert',
    description: 'Complete 20 flashcard practice sessions',
    icon: '📚',
    condition: (data: PracticeAchievementCheck) => 
      (data.userStats.sessionTypes.flashcard || 0) >= 20,
    points: 30,
  },
  {
    id: 'mixed_master',
    title: 'Mixed Master',
    description: 'Complete 10 mixed practice sessions',
    icon: '🎭',
    condition: (data: PracticeAchievementCheck) => 
      (data.userStats.sessionTypes.mixed || 0) >= 10,
    points: 40,
  },
  {
    id: 'marathon_runner',
    title: 'Marathon Runner',
    description: 'Practice for more than 30 minutes in a single session',
    icon: '🏃',
    condition: (data: PracticeAchievementCheck) => data.sessionData.timeSpent > 1800,
    points: 35,
  },
  {
    id: 'streak_legend',
    title: 'Streak Legend',
    description: 'Achieve a 30-day practice streak',
    icon: '🔥',
    condition: (data: PracticeAchievementCheck) => data.userStats.currentStreak >= 30,
    points: 200,
  },
]

/**
 * Check and award practice achievements after a session
 */
export async function checkPracticeAchievements(
  userId: string,
  sessionData: PracticeAchievementCheck['sessionData'],
  userStats: PracticeAchievementCheck['userStats']
): Promise<Achievement[]> {
  try {
    const payload = await getPayload({ config })
    const newAchievements: Achievement[] = []

    // Get user's existing achievements
    const existingAchievements = await payload.find({
      collection: 'user-achievements',
      where: {
        customer: { equals: userId },
      },
      limit: 1000,
    })

    const existingAchievementIds = existingAchievements.docs.map(
      (ua: UserAchievement) => typeof ua.achievement === 'string' 
        ? ua.achievement 
        : ua.achievement?.id
    )

    // Check each achievement
    for (const achievement of PRACTICE_ACHIEVEMENTS) {
      // Skip if user already has this achievement
      if (existingAchievementIds.includes(achievement.id)) {
        continue
      }

      // Check if achievement condition is met
      const checkData: PracticeAchievementCheck = { sessionData, userStats }
      if (achievement.condition(checkData)) {
        try {
          // Find or create the achievement
          let achievementDoc = await payload.find({
            collection: 'achievements',
            where: {
              slug: { equals: achievement.id },
            },
            limit: 1,
          })

          if (achievementDoc.docs.length === 0) {
            // Create the achievement if it doesn't exist
            achievementDoc = await payload.create({
              collection: 'achievements',
              data: {
                title: achievement.title,
                description: achievement.description,
                icon: achievement.icon,
                points: achievement.points,
                slug: achievement.id,
                category: 'practice',
                isActive: true,
              },
            })
            achievementDoc = { docs: [achievementDoc] }
          }

          const achievementId = achievementDoc.docs[0].id

          // Award the achievement to the user
          await payload.create({
            collection: 'user-achievements',
            data: {
              customer: userId,
              achievement: achievementId,
              unlockedAt: new Date().toISOString(),
              progress: 100,
            },
          })

          newAchievements.push(achievementDoc.docs[0])
        } catch (error) {
          console.error(`Error awarding achievement ${achievement.id}:`, error)
        }
      }
    }

    return newAchievements
  } catch (error) {
    console.error('Error checking practice achievements:', error)
    return []
  }
}

/**
 * Get practice achievement progress for a user
 */
export async function getPracticeAchievementProgress(
  userId: string,
  userStats: PracticeAchievementCheck['userStats']
): Promise<Array<{
  achievement: typeof PRACTICE_ACHIEVEMENTS[0]
  isUnlocked: boolean
  progress: number
}>> {
  try {
    const payload = await getPayload({ config })

    // Get user's existing achievements
    const existingAchievements = await payload.find({
      collection: 'user-achievements',
      where: {
        customer: { equals: userId },
      },
      limit: 1000,
    })

    const existingAchievementIds = existingAchievements.docs.map(
      (ua: UserAchievement) => typeof ua.achievement === 'string' 
        ? ua.achievement 
        : ua.achievement?.id
    )

    return PRACTICE_ACHIEVEMENTS.map(achievement => {
      const isUnlocked = existingAchievementIds.includes(achievement.id)
      
      // Calculate progress (simplified - could be more sophisticated)
      let progress = 0
      if (isUnlocked) {
        progress = 100
      } else {
        // Calculate partial progress based on achievement type
        const checkData: PracticeAchievementCheck = { 
          sessionData: {
            sessionType: '',
            score: 0,
            timeSpent: 0,
            totalWords: 0,
            correctAnswers: 0,
          }, 
          userStats 
        }
        
        // Simple progress calculation - can be enhanced
        if (achievement.id === 'practice_master') {
          progress = Math.min((userStats.totalSessions / 50) * 100, 99)
        } else if (achievement.id === 'consistency_king') {
          progress = Math.min((userStats.currentStreak / 7) * 100, 99)
        } else if (achievement.id === 'streak_legend') {
          progress = Math.min((userStats.currentStreak / 30) * 100, 99)
        } else if (achievement.id === 'flashcard_expert') {
          progress = Math.min(((userStats.sessionTypes.flashcard || 0) / 20) * 100, 99)
        } else if (achievement.id === 'mixed_master') {
          progress = Math.min(((userStats.sessionTypes.mixed || 0) / 10) * 100, 99)
        }
      }

      return {
        achievement,
        isUnlocked,
        progress: Math.round(progress),
      }
    })
  } catch (error) {
    console.error('Error getting practice achievement progress:', error)
    return []
  }
}
