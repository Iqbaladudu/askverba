'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, MousePointer, Languages, BookOpen, Headphones } from 'lucide-react'

export function FeaturesOverviewSection() {
  const features = [
    {
      icon: Languages,
      title: 'Accurate Translation',
      desc: 'High-precision AI translation with cultural nuance.',
    },
    {
      icon: BookOpen,
      title: 'Vocabulary Builder',
      desc: 'Extract key words and save them in one click.',
    },
    {
      icon: Headphones,
      title: 'Audio & Pronunciation',
      desc: 'Listen to natural pronunciation instantly.',
    },
    {
      icon: MousePointer,
      title: 'Interactive UI',
      desc: 'Modern, minimal, and delightful micro-interactions.',
    },
    { icon: Sparkles, title: 'Context Aware', desc: 'Detailed mode to understand tone and usage.' },
    {
      icon: BookOpen, // You can swap to a flashcard icon if available
      title: 'Practice with Flashcards',
      desc: 'Master vocabulary faster with interactive flashcard practice mode.',
    },
  ]

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-transparent to-neutral-50/60 dark:to-neutral-900/40">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300 ring-1 ring-primary-500/10 px-2.5 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            What you&#39;ll get
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-neutral-900 dark:text-white">
            Everything you need to learn faster
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto">
            Thoughtfully designed features that keep you focused and motivated.
          </p>
        </div>

        <div className="mt-10 mx-auto max-w-6xl">
          <div className="grid justify-center items-center grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.05, duration: 0.3, ease: 'easeOut' }}
                className="h-full"
              >
                <Card className="group relative h-full overflow-hidden rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-950/40 transition-all duration-300 ring-1 ring-black/0 hover:ring-black/5 hover:-translate-y-1 hover:shadow-lg">
                  {/* subtle top highlight */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

                  <CardContent className="p-5 sm:p-6 text-center flex flex-col h-full">
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-primary-500/15 to-primary-500/5 text-primary-600 dark:text-primary-400 flex items-center justify-center ring-1 ring-primary-500/20 group-hover:ring-primary-500/30 transition-transform duration-300 mx-auto group-hover:scale-105">
                      <f.icon className="h-5 w-5" />
                    </div>

                    <div className="mt-3.5 sm:mt-4 font-semibold text-neutral-900 dark:text-white text-base sm:text-lg">
                      {f.title}
                    </div>
                    <p className="mt-1.5 text-sm md:text-[15px] leading-snug text-neutral-600 dark:text-neutral-400">
                      {f.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
