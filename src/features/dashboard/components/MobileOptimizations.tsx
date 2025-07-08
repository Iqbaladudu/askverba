'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// Mobile-optimized container with safe areas
interface MobileContainerProps {
  children: React.ReactNode
  className?: string
  withBottomPadding?: boolean
}

export function MobileContainer({ 
  children, 
  className, 
  withBottomPadding = true 
}: MobileContainerProps) {
  return (
    <div className={cn(
      'min-h-screen bg-neutral-50',
      'safe-area-pt', // Top safe area for notch/status bar
      withBottomPadding && 'pb-20 safe-area-pb', // Bottom safe area for navigation
      className
    )}>
      {children}
    </div>
  )
}

// Mobile-optimized card with better touch targets
interface MobileCardProps {
  children: React.ReactNode
  className?: string
  interactive?: boolean
  onClick?: () => void
}

export function MobileCard({ 
  children, 
  className, 
  interactive = false,
  onClick 
}: MobileCardProps) {
  return (
    <div 
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-neutral-200',
        'p-4 mx-4 mb-4',
        interactive && 'active:scale-[0.98] transition-transform duration-150 cursor-pointer',
        interactive && 'hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// Mobile-optimized input with better touch targets
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export function MobileInput({ 
  label, 
  error, 
  icon, 
  className, 
  ...props 
}: MobileInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full px-4 py-4 text-base border border-neutral-300 rounded-xl',
            'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'placeholder:text-neutral-400',
            'min-h-[48px]', // Minimum touch target size
            icon && 'pl-12',
            error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

// Mobile-optimized textarea
interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function MobileTextarea({ 
  label, 
  error, 
  className, 
  ...props 
}: MobileTextareaProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-4 py-4 text-base border border-neutral-300 rounded-xl',
          'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'placeholder:text-neutral-400 resize-none',
          'min-h-[120px]',
          error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

// Mobile-optimized select dropdown
interface MobileSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function MobileSelect({ 
  label, 
  error, 
  options, 
  className, 
  ...props 
}: MobileSelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-4 py-4 text-base border border-neutral-300 rounded-xl',
          'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'bg-white appearance-none',
          'min-h-[48px]',
          error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

// Mobile-optimized floating action button
interface MobileFABProps {
  children: React.ReactNode
  onClick: () => void
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
}

export function MobileFAB({ 
  children, 
  onClick, 
  className,
  position = 'bottom-right'
}: MobileFABProps) {
  const positionClasses = {
    'bottom-right': 'bottom-24 right-6',
    'bottom-left': 'bottom-24 left-6',
    'bottom-center': 'bottom-24 left-1/2 transform -translate-x-1/2'
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed z-40 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg',
        'flex items-center justify-center',
        'active:scale-95 transition-transform duration-150',
        'hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300',
        positionClasses[position],
        className
      )}
    >
      {children}
    </button>
  )
}

// Mobile-optimized modal/bottom sheet
interface MobileModalProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  title?: string
  className?: string
}

export function MobileModal({ 
  children, 
  isOpen, 
  onClose, 
  title, 
  className 
}: MobileModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className={cn(
        'relative w-full max-w-md bg-white rounded-t-3xl',
        'max-h-[90vh] overflow-hidden',
        'animate-in slide-in-from-bottom duration-300',
        className
      )}>
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-neutral-300 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="px-6 pb-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  )
}

// Mobile-optimized toast notification
interface MobileToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  isVisible: boolean
  onClose: () => void
}

export function MobileToast({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose 
}: MobileToastProps) {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  const typeClasses = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
    warning: 'bg-yellow-600 text-white'
  }

  if (!isVisible) return null

  return (
    <div className={cn(
      'fixed top-safe-area-top left-4 right-4 z-50',
      'px-4 py-3 rounded-xl shadow-lg',
      'animate-in slide-in-from-top duration-300',
      typeClasses[type]
    )}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{message}</p>
        <button 
          onClick={onClose}
          className="ml-4 text-white/80 hover:text-white"
        >
          ×
        </button>
      </div>
    </div>
  )
}
