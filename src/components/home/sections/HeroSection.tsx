'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Star, Sparkles } from 'lucide-react'
import { heroStats, trustBrands, fadeInUpVariants, itemVariants } from '../../../lib/data'

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 overflow-hidden py-20 sm:py-0">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,91,158,0.08)_1px,_transparent_0)] [background-size:40px_40px] opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeInUpVariants}
          className="max-w-4xl mx-auto text-center flex flex-col items-center"
        >
          {/* Beta Badge */}
          <motion.div variants={itemVariants}>
            <Badge
              variant="outline"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#FF5B9E]/10 border-[#FF5B9E]/20 text-[#FF5B9E] hover:bg-[#FF5B9E]/20 transition-colors"
            >
              <Star className="w-4 h-4" />
              AI-Powered Language Learning
              <Sparkles className="w-4 h-4" />
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white"
          >
            Master Languages with <span className="text-[#FF5B9E] drop-shadow-lg">Natural AI</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-4 text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Instantly translate, learn, and converse in 15+ languages with AI. Personalized,
            accurate, and fun.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto bg-[#FF5B9E] hover:bg-[#E54A8C] text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg font-semibold rounded-2xl"
            >
              <span>Start Learning Free</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="w-full sm:w-auto border-2 border-gray-200 dark:border-gray-700 hover:border-[#FF5B9E] hover:text-[#FF5B9E] hover:bg-[#FF5B9E]/5 transition-all duration-300 px-8 py-6 text-lg font-semibold rounded-2xl"
            >
              <Link href="/translate">Try Demo</Link>
            </Button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-xl mx-auto"
          >
            {heroStats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <stat.icon className="w-7 h-7 text-[#FF5B9E] mb-2" />
                <span className="text-2xl font-bold text-[#FF5B9E]">{stat.number}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{stat.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Trust Indicator */}
          <motion.div variants={itemVariants} className="mt-12">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
              Trusted by learners worldwide
            </p>
            {/* <div className="flex flex-wrap justify-center gap-6 opacity-60">
              {trustBrands.map((brand, idx) => (
                <span
                  key={idx}
                  className="text-base sm:text-lg font-bold text-gray-400 dark:text-gray-600"
                >
                  {brand}
                </span>
              ))}
            </div> */}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
