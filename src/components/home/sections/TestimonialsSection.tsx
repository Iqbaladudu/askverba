'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { testimonials } from '../../../lib/data'

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white"
        >
          What Our Users Say
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              viewport={{ once: true, amount: 0.5 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300"
            >
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-16 h-16 rounded-full mb-4 object-cover border-2 border-[#FF5B9E]"
              />
              <Quote className="w-6 h-6 text-[#FF5B9E]/50 mb-3" />
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm italic leading-relaxed">
                &quot;{testimonial.quote}&quot;
              </p>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {testimonial.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
