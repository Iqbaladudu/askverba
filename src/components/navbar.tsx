'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, X, MessageSquare } from 'lucide-react'

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
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm'
          : 'bg-white dark:bg-gray-900'
      }`}
    >
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#80EF80] rounded-md"
          >
            <div className="flex items-center">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-[#FF5B9E] to-[#FFBD83] p-1.5 rounded-lg mr-2"
              >
                <MessageSquare className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-[#FF5B9E] to-[#FFBD83] bg-clip-text text-transparent">
                AskVerba
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) =>
              item.isButton ? (
                <Button
                  key={item.label}
                  asChild
                  className="bg-gradient-to-r from-[#80EF80] to-[#63c7ff] text-white hover:shadow-md transition-all duration-300 hover:scale-105"
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ) : (
                <Button
                  key={item.label}
                  variant="ghost"
                  asChild
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
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
                  className="h-9 w-9 text-gray-700 dark:text-gray-300"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[280px] sm:w-[350px] bg-white dark:bg-gray-900"
              >
                <div className="flex flex-col space-y-6 mt-8">
                  {navItems.map((item) => (
                    <Button
                      key={item.label}
                      variant={item.isButton ? 'default' : 'ghost'}
                      className={
                        item.isButton
                          ? 'bg-gradient-to-r from-[#80EF80] to-[#63c7ff] text-white w-full'
                          : 'justify-start text-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }
                      onClick={() => setIsOpen(false)}
                      asChild
                    >
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  ))}
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
