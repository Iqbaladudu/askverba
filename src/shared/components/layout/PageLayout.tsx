/**
 * Page Layout Component
 * Provides consistent page structure with proper SEO and accessibility
 */

import React from 'react'
import { cn } from '@/core/utils'

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
    muted: 'bg-muted/50',
    gradient: 'bg-gradient-to-br from-background to-muted/50',
    transparent: 'bg-transparent',
  },
}

/**
 * Default Layout
 */
function DefaultLayout({
  children,
  maxWidth = 'xl',
  padding = 'md',
  background = 'default',
  className,
  header,
  footer,
  breadcrumbs,
  actions,
}: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen', layoutConfig.background[background], className)}>
      {header && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {header}
        </header>
      )}
      
      <main className={cn('mx-auto', layoutConfig.maxWidth[maxWidth], layoutConfig.padding[padding])}>
        {breadcrumbs && (
          <div className="mb-6">
            {breadcrumbs}
          </div>
        )}
        
        {actions && (
          <div className="mb-6 flex items-center justify-between">
            <div /> {/* Spacer */}
            <div className="flex items-center gap-2">
              {actions}
            </div>
          </div>
        )}
        
        {children}
      </main>
      
      {footer && (
        <footer className="border-t bg-background">
          {footer}
        </footer>
      )}
    </div>
  )
}

/**
 * Centered Layout
 */
function CenteredLayout({
  children,
  maxWidth = 'md',
  padding = 'md',
  background = 'default',
  className,
}: PageLayoutProps) {
  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center',
      layoutConfig.background[background],
      layoutConfig.padding[padding],
      className
    )}>
      <div className={cn('w-full', layoutConfig.maxWidth[maxWidth])}>
        {children}
      </div>
    </div>
  )
}

/**
 * Sidebar Layout
 */
function SidebarLayout({
  children,
  padding = 'md',
  background = 'default',
  className,
  header,
  sidebar,
  footer,
  breadcrumbs,
  actions,
}: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen', layoutConfig.background[background], className)}>
      {header && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {header}
        </header>
      )}
      
      <div className="flex">
        {sidebar && (
          <aside className="w-64 border-r bg-muted/50 min-h-[calc(100vh-4rem)]">
            {sidebar}
          </aside>
        )}
        
        <main className={cn('flex-1', layoutConfig.padding[padding])}>
          {breadcrumbs && (
            <div className="mb-6">
              {breadcrumbs}
            </div>
          )}
          
          {actions && (
            <div className="mb-6 flex items-center justify-between">
              <div /> {/* Spacer */}
              <div className="flex items-center gap-2">
                {actions}
              </div>
            </div>
          )}
          
          {children}
        </main>
      </div>
      
      {footer && (
        <footer className="border-t bg-background">
          {footer}
        </footer>
      )}
    </div>
  )
}

/**
 * Dashboard Layout
 */
function DashboardLayout({
  children,
  padding = 'md',
  background = 'muted',
  className,
  header,
  sidebar,
  breadcrumbs,
  actions,
}: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen', layoutConfig.background[background], className)}>
      {header && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {header}
        </header>
      )}
      
      <div className="flex">
        {sidebar && (
          <aside className="w-64 border-r bg-background min-h-[calc(100vh-4rem)]">
            {sidebar}
          </aside>
        )}
        
        <main className={cn('flex-1', layoutConfig.padding[padding])}>
          {(breadcrumbs || actions) && (
            <div className="mb-6 flex items-center justify-between">
              <div>
                {breadcrumbs}
              </div>
              {actions && (
                <div className="flex items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          )}
          
          {children}
        </main>
      </div>
    </div>
  )
}

/**
 * Auth Layout
 */
function AuthLayout({
  children,
  maxWidth = 'sm',
  padding = 'md',
  background = 'gradient',
  className,
}: PageLayoutProps) {
  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center',
      layoutConfig.background[background],
      layoutConfig.padding[padding],
      className
    )}>
      <div className={cn('w-full', layoutConfig.maxWidth[maxWidth])}>
        <div className="bg-background rounded-lg border shadow-lg p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Main PageLayout Component
 */
export function PageLayout(props: PageLayoutProps) {
  const { variant = 'default' } = props

  switch (variant) {
    case 'centered':
      return <CenteredLayout {...props} />
    case 'sidebar':
      return <SidebarLayout {...props} />
    case 'dashboard':
      return <DashboardLayout {...props} />
    case 'auth':
      return <AuthLayout {...props} />
    default:
      return <DefaultLayout {...props} />
  }
}

// Utility components for common layouts
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}

export function PageContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  )
}

export function PageSection({
  title,
  description,
  children,
  className,
}: {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

// Breadcrumb component
export function Breadcrumbs({
  items,
  className,
}: {
  items: Array<{ label: string; href?: string }>
  className?: string
}) {
  return (
    <nav className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span>/</span>}
          {item.href ? (
            <a
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
