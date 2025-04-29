'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, MessageSquare } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  isButton?: boolean
}

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  // Navigation items
  const navItems: NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Login', href: '/login' },
    { label: 'Register', href: '/register', isButton: true },
  ]

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 border-b ${
        scrolled
          ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-md shadow-md border-b-[#eaeaea]/60 dark:border-b-[#222]/60'
          : 'bg-white dark:bg-gray-950 border-b-transparent'
      }`}
    >
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF5B9E] rounded-lg"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-[#FF5B9E] to-[#FFBD83] p-2 rounded-2xl shadow-lg"
            >
              <MessageSquare className="h-7 w-7 text-white" />
            </motion.div>
            <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-[#FF5B9E] to-[#FFBD83] bg-clip-text text-transparent tracking-tight drop-shadow-sm">
              AskVerba
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navItems.map((item) =>
              item.isButton ? (
                <Button
                  key={item.label}
                  asChild
                  className="bg-gradient-to-r from-[#80EF80] to-[#63c7ff] text-white font-semibold px-6 py-2 rounded-xl shadow hover:scale-105 hover:shadow-lg transition-all duration-200 border-0"
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gradient-to-r hover:from-[#FF5B9E]/10 hover:to-[#FFBD83]/10 dark:hover:from-[#FF5B9E]/10 dark:hover:to-[#FFBD83]/10 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#FF5B9E]"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          {/* Mobile Navigation Trigger */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-gray-700 dark:text-gray-200 hover:bg-[#FF5B9E]/10 dark:hover:bg-[#FF5B9E]/10 transition"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[280px] sm:w-[350px] bg-white dark:bg-gray-950 border-l border-gray-100 dark:border-gray-800 px-0"
              >
                <div className="flex flex-col space-y-4 mt-14 px-4">
                  {navItems.map((item) =>
                    item.isButton ? (
                      <Button
                        key={item.label}
                        asChild
                        className="bg-gradient-to-r from-[#80EF80] to-[#63c7ff] text-white w-full font-semibold py-2 rounded-xl shadow hover:scale-105 hover:shadow-lg transition-all duration-200 border-0"
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href={item.href}>{item.label}</Link>
                      </Button>
                    ) : (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="w-full px-4 py-2 rounded-lg text-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gradient-to-r hover:from-[#FF5B9E]/10 hover:to-[#FFBD83]/10 dark:hover:from-[#FF5B9E]/10 dark:hover:to-[#FFBD83]/10 transition-all duration-150"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ),
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
