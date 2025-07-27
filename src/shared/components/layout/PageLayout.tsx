/**
 * Page Layout Component
 * Provides consistent page structure with proper SEO and accessibility
 */

import React from 'react'
import { Metadata } from 'next'
import { cn } from '@/lib/utils'

// Layout variants
export type LayoutVariant = 'default' | 'centered' | 'sidebar' | 'dashboard' | 'auth'

// Page layout props
export interface PageLayoutProps {
  children: React.ReactNode
  variant?: LayoutVariant
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  background?: 'default' | 'muted' | 'gradient' | 'transparent'
  header?: React.ReactNode
  sidebar?: React.ReactNode
  footer?: React.ReactNode
  breadcrumbs?: React.ReactNode
  actions?: React.ReactNode
}

// Layout configuration
const layoutConfig = {
  maxWidth: {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  },
  padding: {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
  background: {
    default: 'bg-background',
    muted: 'bg-muted/30',
    gradient: 'bg-gradient-to-br from-background to-muted/30',
    transparent: 'bg-transparent',
  },
} as const

/**
 * Main page layout component
 */
export function PageLayout({
  children,
  variant = 'default',
  className,
  maxWidth = 'xl',
  padding = 'md',
  background = 'default',
  header,
  sidebar,
  footer,
  breadcrumbs,
  actions,
}: PageLayoutProps) {
  const containerClasses = cn(
    'min-h-screen',
    layoutConfig.background[background],
    className
  )

  const contentClasses = cn(
    'mx-auto',
    layoutConfig.maxWidth[maxWidth],
    layoutConfig.padding[padding]
  )

  // Render different layout variants
  switch (variant) {
    case 'centered':
      return (
        <div className={containerClasses}>
          <div className="flex min-h-screen items-center justify-center">
            <div className={cn('w-full', layoutConfig.maxWidth[maxWidth], layoutConfig.padding[padding])}>
              {children}
            </div>
          </div>
        </div>
      )

    case 'sidebar':
      return (
        <div className={containerClasses}>
          {header && (
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {header}
            </header>
          )}
          <div className="flex">
            {sidebar && (
              <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 shrink-0 border-r bg-muted/30">
                {sidebar}
              </aside>
            )}
            <main className="flex-1">
              <div className={contentClasses}>
                {breadcrumbs && (
                  <div className="mb-6">
                    {breadcrumbs}
                  </div>
                )}
                {actions && (
                  <div className="mb-6 flex justify-between items-center">
                    <div /> {/* Spacer */}
                    <div className="flex gap-2">
                      {actions}
                    </div>
                  </div>
                )}
                {children}
              </div>
            </main>
          </div>
          {footer && (
            <footer className="border-t bg-muted/30">
              {footer}
            </footer>
          )}
        </div>
      )

    case 'dashboard':
      return (
        <div className={containerClasses}>
          {header && (
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {header}
            </header>
          )}
          <div className="flex">
            {sidebar && (
              <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r bg-muted/30">
                {sidebar}
              </aside>
            )}
            <main className="flex-1 overflow-hidden">
              <div className={contentClasses}>
                {breadcrumbs && (
                  <nav className="mb-6" aria-label="Breadcrumb">
                    {breadcrumbs}
                  </nav>
                )}
                {actions && (
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div /> {/* Title space */}
                    <div className="flex flex-wrap gap-2">
                      {actions}
                    </div>
                  </div>
                )}
                <div className="pb-8">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      )

    case 'auth':
      return (
        <div className={cn(containerClasses, 'flex items-center justify-center')}>
          <div className="w-full max-w-md space-y-6 p-6">
            {children}
          </div>
        </div>
      )

    default:
      return (
        <div className={containerClasses}>
          {header && (
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {header}
            </header>
          )}
          <main>
            <div className={contentClasses}>
              {breadcrumbs && (
                <nav className="mb-6" aria-label="Breadcrumb">
                  {breadcrumbs}
                </nav>
              )}
              {actions && (
                <div className="mb-6 flex justify-end">
                  <div className="flex gap-2">
                    {actions}
                  </div>
                </div>
              )}
              {children}
            </div>
          </main>
          {footer && (
            <footer className="border-t bg-muted/30 mt-16">
              {footer}
            </footer>
          )}
        </div>
      )
  }
}

/**
 * Page header component
 */
export interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumbs?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {breadcrumbs && (
        <nav aria-label="Breadcrumb">
          {breadcrumbs}
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Section container component
 */
export interface SectionProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
  className?: string
  variant?: 'default' | 'card' | 'bordered'
}

export function Section({
  children,
  title,
  description,
  actions,
  className,
  variant = 'default',
}: SectionProps) {
  const sectionClasses = cn(
    'space-y-6',
    {
      'rounded-lg border bg-card p-6': variant === 'card',
      'border-l-4 border-primary pl-6': variant === 'bordered',
    },
    className
  )

  return (
    <section className={sectionClasses}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            {title && (
              <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

/**
 * Grid layout component
 */
export interface GridLayoutProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function GridLayout({
  children,
  columns = 1,
  gap = 'md',
  className,
}: GridLayoutProps) {
  const gridClasses = cn(
    'grid',
    {
      'grid-cols-1': columns === 1,
      'grid-cols-1 md:grid-cols-2': columns === 2,
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': columns === 3,
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': columns === 4,
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6': columns === 6,
      'grid-cols-12': columns === 12,
    },
    {
      'gap-4': gap === 'sm',
      'gap-6': gap === 'md',
      'gap-8': gap === 'lg',
    },
    className
  )

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

/**
 * Stack layout component
 */
export interface StackLayoutProps {
  children: React.ReactNode
  direction?: 'vertical' | 'horizontal'
  spacing?: 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  className?: string
}

export function StackLayout({
  children,
  direction = 'vertical',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  className,
}: StackLayoutProps) {
  const stackClasses = cn(
    'flex',
    {
      'flex-col': direction === 'vertical',
      'flex-row': direction === 'horizontal',
    },
    {
      'gap-2': spacing === 'sm',
      'gap-4': spacing === 'md',
      'gap-6': spacing === 'lg',
    },
    {
      'items-start': align === 'start',
      'items-center': align === 'center',
      'items-end': align === 'end',
      'items-stretch': align === 'stretch',
    },
    {
      'justify-start': justify === 'start',
      'justify-center': justify === 'center',
      'justify-end': justify === 'end',
      'justify-between': justify === 'between',
      'justify-around': justify === 'around',
    },
    className
  )

  return (
    <div className={stackClasses}>
      {children}
    </div>
  )
}

// Export all layout components
export default {
  PageLayout,
  PageHeader,
  Section,
  GridLayout,
  StackLayout,
}
