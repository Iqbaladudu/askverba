'use client'

/* UX: Unified navbar for both landing page and dashboard with authentication state handling */
/* DESIGN: Dashboard-style design that adapts based on authentication status */

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Menu,
  MessageSquare,
  X,
  User,
  LogOut,
  Search,
  Bell,
  Settings,
  Home,
  Languages,
  BookOpen,
  BarChart3,
  History,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { logoutCustomerAction } from 'action/logout.action'
import { toast } from 'sonner'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

// Landing page navigation items (when not authenticated)
const LANDING_NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Translate', href: '/translate', icon: Languages },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

// Dashboard navigation items (when authenticated)
const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Vocabulary', href: '/dashboard/vocabulary', icon: BookOpen },
  { label: 'History', href: '/dashboard/history', icon: History },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
]

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { isAuthenticated, customer, logout, isLoading } = useAuth()
  const pathname = usePathname()

  // Determine if we're in dashboard mode
  const isDashboard = pathname?.startsWith('/dashboard')

  // Choose navigation items based on authentication state
  const navItems = isAuthenticated ? DASHBOARD_NAV_ITEMS : LANDING_NAV_ITEMS

  const handleLogout = async () => {
    try {
      await logoutCustomerAction()
      logout()
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-neutral-200">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 group">
          <span className="bg-primary-500 p-2 rounded-xl">
            <MessageSquare className="h-6 w-6 text-white" />
          </span>
          <span className="text-xl font-bold text-primary-500 tracking-tight">AskVerba</span>
          {isDashboard && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Dashboard
            </Badge>
          )}
        </Link>

        {/* Search Bar - Only for authenticated users */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search translations, vocabulary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-neutral-50 border-neutral-200 focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {!isAuthenticated &&
            navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-2 rounded-lg text-neutral-700 font-medium hover:text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500 transition"
              >
                {item.label}
              </Link>
            ))}

          {/* Right Actions */}
          {!isLoading && (
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {/* Search Button - Mobile only */}
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Search className="h-5 w-5" />
                  </Button>

                  {/* Notifications */}
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary-500 rounded-full"></span>
                  </Button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 px-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-600" />
                        </div>
                        <span className="hidden md:block text-sm font-medium">
                          {customer?.name || 'User'}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{customer?.name}</p>
                          <p className="text-xs text-neutral-500">{customer?.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings" className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-600 focus:text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-primary-500 text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-primary-600 transition"
                  >
                    <Link href="/register">Try Free</Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-neutral-700"
                aria-label="Open menu"
              >
                {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] bg-white border-l border-neutral-200 px-0"
            >
              <div className="flex flex-col gap-6 mt-12 px-6">
                <Link
                  href={isAuthenticated ? '/dashboard' : '/'}
                  className="flex items-center gap-2 mb-6"
                  onClick={() => setOpen(false)}
                >
                  <span className="bg-primary-500 p-2 rounded-xl">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </span>
                  <span className="text-lg font-bold text-primary-500">AskVerba</span>
                  {isDashboard && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Dashboard
                    </Badge>
                  )}
                </Link>

                {/* Mobile Search - Only for authenticated users */}
                {isAuthenticated && (
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-neutral-50 border-neutral-200"
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Items */}
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors',
                        isActive
                          ? 'bg-primary-100 text-primary-700 border border-primary-200'
                          : 'text-neutral-700 hover:text-primary-500 hover:bg-neutral-50',
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {item.icon && <item.icon className="h-5 w-5" />}
                      {item.label}
                    </Link>
                  )
                })}

                {/* Mobile Auth section */}
                {!isLoading && (
                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-neutral-50 rounded-lg">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-900">{customer?.name}</p>
                            <p className="text-xs text-neutral-500">{customer?.email}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Button
                            asChild
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            onClick={() => setOpen(false)}
                          >
                            <Link href="/dashboard/settings">
                              <Settings className="h-4 w-4" />
                              Settings
                            </Link>
                          </Button>
                          <Button
                            onClick={() => {
                              handleLogout()
                              setOpen(false)
                            }}
                            variant="ghost"
                            className="w-full justify-start gap-3 text-red-600 hover:text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          asChild
                          variant="outline"
                          className="w-full"
                          onClick={() => setOpen(false)}
                        >
                          <Link href="/login">Login</Link>
                        </Button>
                        <Button
                          asChild
                          className="w-full bg-primary-500 text-white font-semibold py-2 rounded-lg shadow hover:bg-primary-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          <Link href="/register">Try Free</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Navbar
