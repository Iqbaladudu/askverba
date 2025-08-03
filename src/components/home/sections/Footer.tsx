'use client'

import React from 'react'
import Link from 'next/link'
import { Github, Linkedin, MessageSquare, Twitter } from 'lucide-react'
import { footerLinks } from '@/lib/data'

export const socialLinks = [
  { icon: <Twitter className="h-5 w-5" />, href: '#', label: 'Twitter' },
  { icon: <Github className="h-5 w-5" />, href: '#', label: 'GitHub' },
  { icon: <Linkedin className="h-5 w-5" />, href: '#', label: 'LinkedIn' },
]

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="bg-[#FF5B9E] p-2 rounded-xl">
                <MessageSquare className="h-6 w-6 text-white" />
              </span>
              <span className="text-xl font-bold text-[#FF5B9E] tracking-tight">AskVerba</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-sm leading-relaxed">
              Your AI-powered partner for mastering new languages through natural conversation and
              deep understanding. Experience the future of language learning today.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#FF5B9E] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Follow Us</h4>
            <div className="flex gap-4">
              {socialLinks.map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  className="text-gray-500 dark:text-gray-400 hover:text-[#FF5B9E] transition-colors duration-200"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} AskVerba. All rights reserved. Made with ❤️ for
            language learners worldwide.
          </p>
        </div>
      </div>
    </footer>
  )
}
