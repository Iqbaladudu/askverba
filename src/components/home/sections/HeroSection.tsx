'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Star, Sparkles, Play, Zap, Globe } from 'lucide-react'
import { heroStats, fadeInUpVariants, itemVariants } from '@/lib/data'
import { useRouter } from 'next/navigation'

export const HeroSection: React.FC = () => {
  const router = useRouter()

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-[#FF5B9E]/5 dark:from-gray-950 dark:via-gray-900 dark:to-[#FF5B9E]/10 overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0">
        {/* Primary gradient mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,91,158,0.15)_0%,_transparent_50%)] opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(99,102,241,0.1)_0%,_transparent_50%)] opacity-40" />

        {/* Animated grid pattern */}
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(rgba(255,91,158,0.03)_1px,_transparent_1px),linear-gradient(90deg,rgba(255,91,158,0.03)_1px,_transparent_1px)] [background-size:60px_60px]"
          animate={{
            backgroundPosition: ['0px 0px', '60px 60px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#FF5B9E]/10 rounded-full blur-xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"
          animate={{
            y: [0, 15, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      <div className="container mx-auto mt-3 px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeInUpVariants}
          className="max-w-5xl mx-auto text-center flex flex-col items-center"
        >
          {/* Enhanced Beta Badge */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Badge
              variant="outline"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-gradient-to-r from-[#FF5B9E]/10 to-blue-500/10 border border-[#FF5B9E]/30 text-[#FF5B9E] hover:bg-gradient-to-r hover:from-[#FF5B9E]/20 hover:to-blue-500/20 transition-all duration-300 rounded-full shadow-lg backdrop-blur-sm"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              AI-Powered Language Learning
              <Star className="w-4 h-4 fill-current" />
            </Badge>
          </motion.div>

          {/* Enhanced Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="mt-8 text-5xl sm:text-6xl lg:text-8xl font-black leading-[0.9] tracking-tight text-gray-900 dark:text-white"
          >
            <span className="block">Master Languages</span>
            <span className="block mt-2">
              with{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#FF5B9E] via-[#E54A8C] to-[#FF5B9E] bg-clip-text text-transparent animate-pulse">
                  Smart AI
                </span>
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-[#FF5B9E]/20 to-blue-500/20 rounded-lg blur-lg"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                    scale: [0.95, 1.05, 0.95],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </span>
            </span>
          </motion.h1>

          {/* Enhanced Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-xl sm:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Experience the future of language learning with{' '}
            <span className="font-semibold text-[#FF5B9E]">instant translation</span>,{' '}
            <span className="font-semibold text-blue-600">contextual insights</span>, and{' '}
            <span className="font-semibold text-purple-600">personalized practice</span>
          </motion.p>

          {/* Enhanced CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => router.push('/register')}
                size="lg"
                className="group relative w-full sm:w-auto bg-gradient-to-r from-[#FF5B9E] to-[#E54A8C] hover:from-[#E54A8C] hover:to-[#D63384] text-white shadow-2xl hover:shadow-[#FF5B9E]/25 transition-all duration-500 px-10 py-7 text-xl font-bold rounded-2xl overflow-hidden cursor-pointer"
              >
                <span className="relative z-10 flex items-center">
                  <Zap className="mr-3 h-6 w-6" />
                  Start Learning Now
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="group w-full sm:w-auto border-2 border-gray-300 dark:border-gray-600 hover:border-[#FF5B9E] hover:text-[#FF5B9E] hover:bg-gradient-to-r hover:from-[#FF5B9E]/5 hover:to-blue-500/5 transition-all duration-500 px-10 py-7 text-xl font-bold rounded-2xl backdrop-blur-sm"
              >
                <Link href="/translate" className="flex items-center">
                  <Play className="mr-3 h-6 w-6 group-hover:text-[#FF5B9E] transition-colors duration-300" />
                  Try Free Demo
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Enhanced Stats Section */}
          <motion.div
            variants={itemVariants}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {heroStats.map((stat, idx) => (
              <motion.div
                key={idx}
                className="group relative"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:border-[#FF5B9E]/30 transition-all duration-500">
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF5B9E]/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 flex flex-col items-center text-center">
                    <motion.div
                      className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-[#FF5B9E]/10 to-blue-500/10 group-hover:from-[#FF5B9E]/20 group-hover:to-blue-500/20 transition-all duration-500"
                      whileHover={{ rotate: 5 }}
                    >
                      <stat.icon className="w-8 h-8 text-[#FF5B9E] group-hover:scale-110 transition-transform duration-300" />
                    </motion.div>

                    <motion.span
                      className="text-4xl font-black bg-gradient-to-r from-[#FF5B9E] to-blue-600 bg-clip-text text-transparent mb-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + idx * 0.1, type: 'spring', stiffness: 200 }}
                    >
                      {stat.number}
                    </motion.span>

                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                      {stat.text}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced Trust Indicator */}
          <motion.div variants={itemVariants} className="mt-20">
            <motion.p
              className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-8 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Trusted by learners worldwide
            </motion.p>

            {/* Feature highlights */}
            <motion.div
              className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              {[
                { icon: Globe, text: '15+ Languages', color: 'text-blue-500' },
                { icon: Zap, text: 'Instant Results', color: 'text-[#FF5B9E]' },
                { icon: Star, text: '98% Accuracy', color: 'text-purple-500' },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50 hover:border-[#FF5B9E]/30 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + idx * 0.1 }}
                >
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
