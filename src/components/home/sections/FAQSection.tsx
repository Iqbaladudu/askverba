'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Is AskVerba free?',
    a: 'You can try AskVerba for free with certain limits. For full and unlimited features, a subscription plan is available.',
  },
  {
    q: 'How accurate are the translations?',
    a: 'We use modern AI models with internal validation. The Detailed mode provides context, tone, and alternative translations.',
  },
  {
    q: 'Can I practice vocabulary?',
    a: 'Yes. Each translation can extract key vocabulary. You can practice with flashcards in the dashboard.',
  },
]

export function FAQSection() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(0)

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white text-center">
          Frequently Asked Questions
        </h2>
        <div className="mt-8 divide-y divide-neutral-200 dark:divide-neutral-800">
          {faqs.map((item, idx) => {
            const open = openIdx === idx
            return (
              <div key={idx} className="py-4">
                <button
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => setOpenIdx(open ? null : idx)}
                >
                  <span className="font-medium text-neutral-900 dark:text-white">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : 'rotate-0'}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 text-neutral-600 dark:text-neutral-300 overflow-hidden"
                    >
                      {item.a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
