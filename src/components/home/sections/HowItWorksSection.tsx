'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, CheckCircle, Zap } from 'lucide-react'

export const workflowSteps = [
  {
    icon: <Zap className="w-7 h-7 text-white" />,
    title: 'Type or Paste',
    desc: 'Enter your English text or phrase. No registration needed.',
    color: 'bg-[#FF5B9E]',
  },
  {
    icon: <Brain className="w-7 h-7 text-white" />,
    title: 'AI Translates & Analyzes',
    desc: 'Get instant, accurate translation with deep linguistic insights.',
    color: 'bg-blue-500',
  },
  {
    icon: <CheckCircle className="w-7 h-7 text-white" />,
    title: 'Learn & Practice',
    desc: 'Explore vocabulary, context, and tips. Listen and copy results easily.',
    color: 'bg-purple-500',
  },
]

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white"
        >
          How It Works in 3 Simple Steps
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {workflowSteps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              viewport={{ once: true, amount: 0.5 }}
              className="flex flex-col items-center text-center bg-gray-50 dark:bg-gray-950 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow duration-300"
            >
              <div className={`mb-4 rounded-full p-4 ${step.color} shadow-lg`}>{step.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
