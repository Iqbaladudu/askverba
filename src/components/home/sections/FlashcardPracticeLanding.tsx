'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { BookOpen, ArrowRight, Repeat, Sparkles } from 'lucide-react'

interface FlashcardPracticeLandingProps {
  total?: number
  mastered?: number
}

export function FlashcardPracticeLanding({
  total = 0,
  mastered = 0,
}: FlashcardPracticeLandingProps) {
  const progress = useMemo(() => {
    if (total <= 0) return 0
    return Math.round((mastered / total) * 100)
  }, [total, mastered])
  const [flip, setFlip] = useState(false)

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Practice Vocabulary with Flashcards
            </h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-300 max-w-xl">
              Build long-term memory with interactive, high-quality flashcards. Flip, repeat, and
              track your progress over time.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild className="bg-gradient-to-r from-[#FF5B9E] to-[#E54A8C] text-white">
                <Link href="/dashboard/practice">
                  Start Practice <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/vocabulary">
                  Manage Vocabulary <BookOpen className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Flip demo */}
              <Card className="rounded-3xl shadow-xl border-neutral-200/60 dark:border-neutral-800/60">
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-neutral-500 mb-3">Live Demo</div>
                  <div className="[perspective:1000px]">
                    <motion.div
                      className="relative h-40 w-full [transform-style:preserve-3d]"
                      animate={{ rotateY: flip ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                      onClick={() => setFlip((v) => !v)}
                    >
                      <div className="absolute inset-0 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 backface-hidden grid place-content-center">
                        <div className="text-center">
                          <div className="text-sm text-neutral-500">Word</div>
                          <div className="text-2xl font-bold">accomplish</div>
                        </div>
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FF5B9E]/10 to-blue-500/10 border border-neutral-200 dark:border-neutral-800 grid place-content-center [transform:rotateY(180deg)] backface-hidden">
                        <div className="text-center">
                          <div className="text-sm text-neutral-500">Translation</div>
                          <div className="text-2xl font-bold">mencapai; menyelesaikan</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  <div className="mt-3 text-xs text-neutral-500">Click the card to flip</div>
                </CardContent>
              </Card>

              {/* Progress */}
              <Card className="rounded-3xl shadow-xl border-neutral-200/60 dark:border-neutral-800/60">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-neutral-500">Progress</div>
                    <div className="inline-flex items-center gap-2 text-xs rounded-full px-3 py-1 bg-[#FF5B9E]/10 text-[#FF5B9E]">
                      <Sparkles className="h-3.5 w-3.5" /> Smart Learning
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold">
                    {progress}%{' '}
                    <span className="text-sm font-medium text-neutral-500">mastered</span>
                  </div>
                  <Progress value={progress} className="mt-3 h-2" />

                  <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800">
                      <div className="text-2xl font-bold">{total}</div>
                      <div className="text-xs text-neutral-500">Total Words</div>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800">
                      <div className="text-2xl font-bold">{mastered}</div>
                      <div className="text-xs text-neutral-500">Mastered</div>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800">
                      <div className="text-2xl font-bold">{Math.max(total - mastered, 0)}</div>
                      <div className="text-xs text-neutral-500">To Review</div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Button variant="ghost" className="hover:text-[#FF5B9E]">
                      <Repeat className="mr-2 h-4 w-4" /> Repeat Difficult Words
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
