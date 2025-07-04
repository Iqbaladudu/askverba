'use client'

/* UX: Navigasi utama sederhana, responsif, dan mudah diakses untuk AskVerba */
/* DESIGN: Solid color, tipografi tegas, tombol utama menonjol, mobile drawer simpel */

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, MessageSquare, X } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  isButton?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Translate', href: '/translate' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Try Free', href: '/register', isButton: true },
]

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-950/95 shadow border-b-gray-200 dark:border-b-gray-800'
          : 'bg-white dark:bg-gray-950 border-b-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group focus:outline-none">
          <span className="bg-[#FF5B9E] p-2 rounded-xl">
            <MessageSquare className="h-6 w-6 text-white" />
          </span>
          <span className="text-xl font-bold text-[#FF5B9E] tracking-tight">AskVerba</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) =>
            item.isButton ? (
              <Button
                key={item.label}
                asChild
                className="ml-2 bg-[#FF5B9E] text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#E54A8C] transition"
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:text-[#FF5B9E] focus-visible:ring-2 focus-visible:ring-[#FF5B9E] transition"
              >
                {item.label}
              </Link>
            ),
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-gray-700 dark:text-gray-200"
                aria-label="Open menu"
              >
                {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[260px] bg-white dark:bg-gray-950 border-l border-gray-100 dark:border-gray-800 px-0"
            >
              <div className="flex flex-col gap-6 mt-12 px-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 mb-6"
                  onClick={() => setOpen(false)}
                >
                  <span className="bg-[#FF5B9E] p-2 rounded-xl">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </span>
                  <span className="text-lg font-bold text-[#FF5B9E]">AskVerba</span>
                </Link>
                {NAV_ITEMS.map((item) =>
                  item.isButton ? (
                    <Button
                      key={item.label}
                      asChild
                      className="w-full bg-[#FF5B9E] text-white font-semibold py-2 rounded-lg shadow hover:bg-[#E54A8C] transition"
                      onClick={() => setOpen(false)}
                    >
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="w-full px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:text-[#FF5B9E] transition"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
