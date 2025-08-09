import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { Navbar } from '@/components/common'
import {
  HeroSection,
  TestimonialsSection,
  SimpleTranslationSection,
  DetailedTranslationSection,
  FeaturesOverviewSection,
  FlashcardPracticeLanding,
  FAQSection,
  CTASection,
  Footer,
} from '@/components/home/sections'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  await payload.auth({ headers })

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesOverviewSection />
        <SimpleTranslationSection />
        <DetailedTranslationSection />
        <TestimonialsSection />
        <FlashcardPracticeLanding />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
