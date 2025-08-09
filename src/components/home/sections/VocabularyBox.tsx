"use client"

import React from "react"
import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type VocabItem = {
  word: string
  translation: string
  type: "noun" | "verb" | "adjective" | "phrase" | "idiom" | "adverb" | "preposition"
  difficulty: "easy" | "medium" | "hard"
  context: string
}

interface VocabularyBoxProps {
  items: VocabItem[]
  title?: string
  className?: string
}

const difficultyColors: Record<VocabItem["difficulty"], string> = {
  easy: "from-emerald-400 to-emerald-600",
  medium: "from-amber-400 to-amber-600",
  hard: "from-rose-400 to-rose-600",
}

export function VocabularyBox({ items, title = "Vocabulary", className }: VocabularyBoxProps) {
  if (!items || items.length === 0) return null

  return (
    <section className={cn("w-full", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
          {title}
        </h3>
        <Badge variant="outline" className="rounded-full">{items.length} words</Badge>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-2 overflow-x-auto">
          {items.map((it, idx) => (
            <motion.div
              key={`${it.word}-${idx}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="min-w-[200px] rounded-2xl p-4 bg-white/80 dark:bg-neutral-900/70 border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm hover:shadow-md relative overflow-hidden"
            >
              <div className={cn("absolute inset-x-0 -bottom-8 h-16 blur-2xl opacity-30 bg-gradient-to-r", difficultyColors[it.difficulty])} />
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-base font-bold tracking-tight">
                    <span className="text-neutral-900 dark:text-white">{it.word}</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-[#FF5B9E] to-[#E54A8C] text-white border-0">{it.type}</Badge>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-snug">
                  {it.translation}
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="text-xs text-neutral-500 dark:text-neutral-400"
                >
                  {it.context}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </section>
  )
}

