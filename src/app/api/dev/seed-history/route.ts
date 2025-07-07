import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Sample translation data for development
const sampleTranslations = [
  {
    originalText: "Hello, how are you today?",
    translatedText: "Halo, apa kabar hari ini?",
    mode: "simple",
    targetLanguage: "Indonesian",
    sourceLanguage: "English",
    isFavorite: false,
  },
  {
    originalText: "I would like to order some food please",
    translatedText: "Saya ingin memesan makanan",
    mode: "simple", 
    targetLanguage: "Indonesian",
    sourceLanguage: "English",
    isFavorite: true,
  },
  {
    originalText: "The weather is beautiful today, perfect for a walk in the park",
    translatedText: "Cuaca hari ini sangat indah, sempurna untuk berjalan-jalan di taman",
    mode: "detailed",
    targetLanguage: "Indonesian", 
    sourceLanguage: "English",
    isFavorite: false,
  },
  {
    originalText: "Can you help me find the nearest hospital?",
    translatedText: "Bisakah Anda membantu saya menemukan rumah sakit terdekat?",
    mode: "simple",
    targetLanguage: "Indonesian",
    sourceLanguage: "English", 
    isFavorite: true,
  },
  {
    originalText: "I'm learning Indonesian and it's quite challenging but very rewarding",
    translatedText: "Saya sedang belajar bahasa Indonesia dan cukup menantang tetapi sangat bermanfaat",
    mode: "detailed",
    targetLanguage: "Indonesian",
    sourceLanguage: "English",
    isFavorite: false,
  },
  {
    originalText: "Thank you very much for your help",
    translatedText: "Terima kasih banyak atas bantuan Anda",
    mode: "simple",
    targetLanguage: "Indonesian", 
    sourceLanguage: "English",
    isFavorite: false,
  },
  {
    originalText: "Where is the nearest train station?",
    translatedText: "Di mana stasiun kereta terdekat?",
    mode: "simple",
    targetLanguage: "Indonesian",
    sourceLanguage: "English",
    isFavorite: true,
  },
  {
    originalText: "I love Indonesian culture and food, especially rendang and nasi gudeg",
    translatedText: "Saya suka budaya dan makanan Indonesia, terutama rendang dan nasi gudeg",
    mode: "detailed", 
    targetLanguage: "Indonesian",
    sourceLanguage: "English",
    isFavorite: true,
  },
  {
    originalText: "Good morning, have a great day!",
    translatedText: "Selamat pagi, semoga harimu menyenangkan!",
    mode: "simple",
    targetLanguage: "Indonesian",
    sourceLanguage: "English", 
    isFavorite: false,
  },
  {
    originalText: "The Indonesian archipelago consists of thousands of islands with diverse cultures and languages",
    translatedText: "Kepulauan Indonesia terdiri dari ribuan pulau dengan budaya dan bahasa yang beragam",
    mode: "detailed",
    targetLanguage: "Indonesian",
    sourceLanguage: "English",
    isFavorite: false,
  }
]

export async function POST(request: NextRequest) {
  try {
    // Get customer ID from request body
    const { customerId } = await request.json()
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    // Create sample translation history entries
    const createdTranslations = []
    
    for (let i = 0; i < sampleTranslations.length; i++) {
      const translation = sampleTranslations[i]
      
      // Create with different timestamps to simulate history
      const createdAt = new Date()
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30)) // Random date within last 30 days
      createdAt.setHours(Math.floor(Math.random() * 24)) // Random hour
      createdAt.setMinutes(Math.floor(Math.random() * 60)) // Random minute

      const result = await payload.create({
        collection: 'translation-history',
        data: {
          ...translation,
          customer: customerId,
          createdAt: createdAt.toISOString(),
          updatedAt: createdAt.toISOString(),
        }
      })
      
      createdTranslations.push(result)
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdTranslations.length} sample translation history entries`,
      data: createdTranslations
    })

  } catch (error) {
    console.error('Error seeding translation history:', error)
    return NextResponse.json(
      { error: 'Failed to seed translation history' },
      { status: 500 }
    )
  }
}

// GET endpoint to check existing data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })
    
    const existingTranslations = await payload.find({
      collection: 'translation-history',
      where: {
        customer: {
          equals: customerId
        }
      },
      limit: 100
    })

    return NextResponse.json({
      success: true,
      count: existingTranslations.totalDocs,
      data: existingTranslations.docs
    })

  } catch (error) {
    console.error('Error fetching translation history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch translation history' },
      { status: 500 }
    )
  }
}
