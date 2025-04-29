'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Globe, MessageCircle, BookOpen, ArrowRight, Sparkles } from 'lucide-react'

const Hero: React.FC = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  }

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: 'reverse' as const,
      ease: 'easeInOut',
    },
  }

  const glowAnimation = {
    boxShadow: [
      '0 0 0 rgba(255, 91, 158, 0)',
      '0 0 20px rgba(255, 91, 158, 0.5)',
      '0 0 0 rgba(255, 91, 158, 0)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse' as const,
    },
  }

  // Language bubbles data
  const languages = [
    { name: 'English', icon: '🇬🇧', delay: 0 },
    { name: 'Español', icon: '🇪🇸', delay: 0.1 },
    { name: '日本語', icon: '🇯🇵', delay: 0.2 },
    { name: 'Français', icon: '🇫🇷', delay: 0.3 },
    { name: 'Deutsch', icon: '🇩🇪', delay: 0.4 },
    { name: '한국어', icon: '🇰🇷', delay: 0.5 },
  ]

  return (
    <section className="relative overflow-hidden py-10 md:pt-16 md:pb-32">
      {/* Background decorations - adjusted for mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-[5%] w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-gradient-to-r from-[#FF5B9E] to-[#FFBD83] opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-10 right-[5%] w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-gradient-to-r from-[#FF5B9E] to-[#FFBD83] opacity-10 blur-3xl"></div>
        <div className="absolute top-1/4 right-[10%] w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-[#FF5B9E] opacity-5 blur-2xl"></div>
      </div>

      {/* Floating dots pattern - reduced for mobile */}
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`dot-${i}`}
            className="absolute rounded-full bg-[#FF5B9E]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="container px-4 mx-auto relative">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Main content - reordered for mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              {/* Heading */}
              <motion.div className="mb-5 sm:mb-6 relative" variants={itemVariants}>
                <motion.span
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-[#FF5B9E]/10 text-[#FF5B9E] mb-4"
                  animate={glowAnimation}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Cara baru belajar bahasa</span>
                </motion.span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight mb-3 sm:mb-4">
                  <span className="block">Kuasai Bahasa Baru dengan</span>
                  <span className="bg-gradient-to-r from-[#FF5B9E] to-[#FFBD83] bg-clip-text text-transparent">
                    Interaksi Alami
                  </span>
                </h1>
              </motion.div>

              {/* Description - font size adjusted for mobile */}
              <motion.p
                className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed"
                variants={itemVariants}
              >
                Belajar bahasa tidak harus serumit yang dibayangkan. Dengan AskVerba, nikmati
                percakapan natural, pelafalan otentik, dan pendekatan berbasis AI yang menyesuaikan
                dengan gaya belajarmu.
              </motion.p>

              {/* Call to action buttons - responsive for mobile */}
              <motion.div
                className="flex flex-col xs:flex-row flex-wrap gap-3 sm:gap-4 mb-8"
                variants={itemVariants}
              >
                <Button
                  size="lg"
                  className="w-full xs:w-auto bg-gradient-to-r from-[#FF5B9E] to-[#FFBD83] hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl px-5 sm:px-6 py-5 sm:py-6 h-auto text-sm sm:text-base"
                >
                  <span>Mulai Belajar</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  asChild
                  size="lg"
                  className="w-full xs:w-auto border-gray-200 dark:border-gray-700 hover:border-[#FF5B9E] hover:text-[#FF5B9E] transition-all duration-300 rounded-xl px-5 sm:px-6 py-5 sm:py-6 h-auto text-sm sm:text-base"
                >
                  <Link href={'/translate'}>Coba Demo Gratis</Link>
                </Button>
              </motion.div>

              {/* Stats - improved for mobile */}
              <motion.div
                className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-8"
                variants={itemVariants}
              >
                {[
                  { number: '12+', text: 'Bahasa Tersedia' },
                  { number: '4M+', text: 'Pengguna' },
                  { number: '95%', text: 'Tingkat Kelulusan' },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-lg xs:text-xl md:text-2xl font-bold bg-gradient-to-r from-[#FF5B9E] to-[#FFBD83] bg-clip-text text-transparent mb-0.5 sm:mb-1">
                      {stat.number}
                    </div>
                    <div className="text-[10px] xs:text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      {stat.text}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Language interactive visual - significantly improved for mobile */}
            <motion.div
              className="relative mt-2 sm:mt-0 order-first md:order-last mb-6 md:mb-0"
              variants={itemVariants}
            >
              <div className="relative mx-auto max-w-[280px] sm:max-w-[340px] md:max-w-none aspect-square">
                {/* Central element - conversation - adjusted size for mobile */}
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
                  animate={floatingAnimation}
                >
                  <div className="relative w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] rounded-full bg-gradient-to-r from-[#FF5B9E]/20 to-[#FFBD83]/20 backdrop-blur-md flex items-center justify-center">
                    <div className="absolute inset-2 rounded-full border-2 border-dashed border-[#FF5B9E]/30 animate-spin-slow"></div>
                    <div className="w-[85%] h-[85%] rounded-full bg-white dark:bg-gray-900 shadow-xl flex items-center justify-center overflow-hidden p-4 sm:p-6">
                      <div className="text-center">
                        <div className="relative w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-3 sm:mb-4">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF5B9E] to-[#FFBD83] opacity-20 animate-pulse"></div>
                          <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                            <Globe className="w-8 sm:w-10 h-8 sm:h-10 text-[#FF5B9E]" />
                          </div>
                        </div>
                        <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">AskVerba</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Asisten bahasa dengan AI yang mengerti kebutuhanmu
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating language bubbles - adjusted for mobile */}
                {languages.map((lang, index) => {
                  // Calculate position around the circle - smaller radius for mobile
                  const angle = (index * (360 / languages.length) * Math.PI) / 180
                  const baseRadius = 140 // Base distance from center
                  const responsiveRadius =
                    typeof window !== 'undefined' && window.innerWidth < 640
                      ? baseRadius * 0.8
                      : baseRadius
                  const radius =
                    typeof window !== 'undefined' && window.innerWidth < 480
                      ? baseRadius * 0.7
                      : responsiveRadius
                  const x = Math.cos(angle) * radius
                  const y = Math.sin(angle) * radius

                  // Hide some languages on smallest screens to avoid overcrowding
                  const hiddenOnTinyScreen =
                    index > 3 && typeof window !== 'undefined' && window.innerWidth < 360

                  return (
                    <motion.div
                      key={lang.name}
                      className={`absolute top-1/2 left-1/2 ${hiddenOnTinyScreen ? 'hidden' : 'block'}`}
                      style={{
                        x: x,
                        y: y,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        transition: { delay: 0.5 + lang.delay, duration: 0.5 },
                      }}
                      whileHover={{
                        scale: 1.1,
                        boxShadow: '0 10px 25px -5px rgba(255, 91, 158, 0.3)',
                      }}
                    >
                      <div className="transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg px-2 sm:px-3 py-1 sm:py-2 flex items-center gap-1 sm:gap-2 border border-gray-100 dark:border-gray-700">
                        <span className="text-lg sm:text-2xl">{lang.icon}</span>
                        <span className="font-medium text-xs sm:text-sm whitespace-nowrap">
                          {lang.name}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}

                {/* Learning features - optimized position and size for mobile */}
                {[
                  {
                    icon: <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />,
                    text: 'Percakapan',
                    position: 'top-[5%] left-[20%] sm:top-0 sm:left-1/4',
                  },
                  {
                    icon: <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />,
                    text: 'Kosakata',
                    position: 'bottom-[15%] left-[10%] sm:bottom-10 sm:left-10',
                  },
                  {
                    icon: <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />,
                    text: 'Pelafalan',
                    position: 'bottom-[10%] right-[8%] sm:bottom-5 sm:right-5',
                  },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    className={`absolute ${feature.position} bg-white dark:bg-gray-800 shadow-lg rounded-full px-2 sm:px-4 py-1 sm:py-2 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: 0.8 + idx * 0.2, duration: 0.5 },
                    }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-[#FF5B9E] to-[#FFBD83] flex items-center justify-center text-white">
                      {feature.icon}
                    </div>
                    <span className="font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Trusted by brands - responsive for mobile */}
          <motion.div className="mt-10 sm:mt-16 md:mt-24 text-center" variants={itemVariants}>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
              DIPERCAYA OLEH INSTITUSI PENDIDIKAN TERKEMUKA
            </p>
            <div className="flex flex-wrap justify-center gap-4 xs:gap-6 sm:gap-8 md:gap-16 opacity-70">
              {['Harvard', 'Cambridge', 'Oxford', 'MIT', 'Stanford'].map((brand, idx) => (
                <motion.div
                  key={idx}
                  className="text-base sm:text-lg md:text-xl font-semibold text-gray-400 dark:text-gray-600"
                  whileHover={{ scale: 1.05, color: '#FF5B9E' }}
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
