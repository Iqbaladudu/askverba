import React from 'react'
import './styles.css'
import { ReactQueryWrapper, AuthProvider } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl), // Add metadataBase
  title: {
    default:
      'AskVerba | Integrated Translation, Vocabulary Storage & Flashcards for Language Learners',
    template: '%s | AskVerba',
  },
  description:
    'Master new languages with AskVerba: integrated translation, personalized vocabulary storage, interactive flashcards, and contextual learning tools—designed for language learners of all levels.',
  robots: {
    // Add robots meta tag
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  keywords: [
    'language learning',
    'integrated translation',
    'vocabulary storage',
    'flashcards',
    'contextual translation',
    'language app',
    'learn new languages',
    'language flashcards',
    'vocabulary builder',
    'language practice',
    'language tools',
    'multilingual',
    'language education',
    'language learners',
  ],
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <SpeedInsights />
        <Analytics />
        <ReactQueryWrapper>
          <AuthProvider>
            <main>{children}</main>
            <Toaster />
          </AuthProvider>
        </ReactQueryWrapper>
      </body>
    </html>
  )
}
