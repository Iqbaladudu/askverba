'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Globe,
  MessageCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  Star,
  Users,
  Trophy,
} from 'lucide-react'

const Hero: React.FC = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const floatingAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: 'reverse' as const,
      ease: 'easeInOut',
    },
  }

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }

  // Stats data
  const stats = [
    { number: '15+', text: 'Languages', icon: Globe },
    { number: '50K+', text: 'Users', icon: Users },
    { number: '98%', text: 'Accuracy', icon: Trophy },
  ]

  // Feature highlights
  const features = [
    {
      icon: MessageCircle,
      text: 'Natural Conversation',
      color: 'bg-blue-500',
    },
    {
      icon: BookOpen,
      text: 'Smart Learning',
      color: 'bg-purple-500',
    },
    {
      icon: Sparkles,
      text: 'AI-Powered',
      color: 'bg-orange-500',
    },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Colored Orbs */}
        <motion.div
          animate={floatingAnimation}
          className="absolute -top-40 -right-40 w-80 h-80 bg-[#FF5B9E]/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 1 },
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        />

        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,91,158,0.1)_1px,_transparent_0)] [background-size:50px_50px] opacity-30" />
      </div>

      <div className="container px-4 sm:px-6 lg:px-8 mx-auto relative z-10">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Beta Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <Badge
              variant="outline"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#FF5B9E]/10 border-[#FF5B9E]/20 text-[#FF5B9E] hover:bg-[#FF5B9E]/20 transition-colors"
            >
              <Star className="w-4 h-4" />
              <span>AI-Powered Language Learning</span>
              <Sparkles className="w-4 h-4" />
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.div variants={itemVariants} className="mb-6">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              <span className="block mb-2">Master Languages with</span>
              <span className="text-[#FF5B9E]">Natural AI</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Experience the future of language learning. Get instant translations, cultural context,
            and personalized lessons powered by advanced AI.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
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
            className="grid grid-cols-3 gap-6 sm:gap-8 mb-16 max-w-2xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-[#FF5B9E] group-hover:text-[#E54A8C] transition-colors" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#FF5B9E] mb-1">
                  {stat.number}
                </div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {stat.text}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="relative group"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 group-hover:shadow-xl transition-all duration-300">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} mb-4`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {feature.text}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Experience the power of AI in language learning
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Central Visual Element */}
          <motion.div variants={itemVariants} className="relative max-w-lg mx-auto">
            <motion.div animate={pulseAnimation} className="relative">
              {/* Main Circle */}
              <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto bg-[#FF5B9E]/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-xl">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-[#FF5B9E] rounded-2xl flex items-center justify-center">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">AskVerba</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Your AI Language Partner
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Language Tags */}
              {['🇺🇸 EN', '🇮🇩 ID', '🇯🇵 JP', '🇪🇸 ES', '🇫🇷 FR', '🇩🇪 DE'].map((lang, index) => {
                const angle = (index * 60 * Math.PI) / 180
                const radius = 120
                const x = Math.cos(angle) * radius
                const y = Math.sin(angle) * radius

                return (
                  <motion.div
                    key={lang}
                    className="absolute top-1/2 left-1/2 hidden sm:block"
                    style={{
                      x: x,
                      y: y,
                      transform: 'translate(-50%, -50%)',
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: [y, y - 10, y],
                    }}
                    transition={{
                      opacity: { delay: 0.5 + index * 0.1, duration: 0.5 },
                      scale: { delay: 0.5 + index * 0.1, duration: 0.5 },
                      y: {
                        duration: 4,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        delay: index * 0.5,
                      },
                    }}
                  >
                    <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-sm font-medium whitespace-nowrap">
                      {lang}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={itemVariants} className="mt-16">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 uppercase tracking-wide font-medium">
              Trusted by learners worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 opacity-60">
              {['Harvard', 'MIT', 'Stanford', 'Cambridge', 'Oxford'].map((brand, idx) => (
                <motion.div
                  key={idx}
                  className="text-lg sm:text-xl font-bold text-gray-400 dark:text-gray-600"
                  whileHover={{ scale: 1.1, color: '#FF5B9E' }}
                  transition={{ duration: 0.2 }}
                >
                  {brand}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
