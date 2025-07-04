'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Wrench, ArrowLeft } from 'lucide-react'

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      {/* Animated Icon */}
      <motion.div
        className="p-6 bg-[#FF5B9E] rounded-full shadow-lg"
        animate={{
          rotate: [0, 15, -15, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        <Wrench className="h-12 w-12 text-white" />
      </motion.div>

      {/* Title */}
      <motion.h1
        className="mt-6 text-3xl sm:text-4xl font-extrabold text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Halaman Sedang Dibangun
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="mt-4 text-center text-gray-600 dark:text-gray-400 max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Kami sedang bekerja keras untuk menghadirkan pengalaman terbaik bagi Anda. Sementara itu,
        Anda dapat kembali ke halaman utama atau menjelajahi fitur lainnya.
      </motion.p>

      {/* Buttons */}
      <motion.div
        className="mt-6 flex flex-wrap gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Button
          asChild
          className="bg-[#FF5B9E] hover:bg-[#E54A8C] text-white shadow-md hover:shadow-lg"
        >
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
        <Button
          variant="outline"
          asChild
          className="border-gray-300 dark:border-gray-700 hover:border-[#FF5B9E] hover:text-[#FF5B9E]"
        >
          <Link href="/contact">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Hubungi Kami
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}

export default NotFoundPage
