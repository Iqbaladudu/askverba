/**
 * Application Route Constants
 * Centralized route definitions for type-safe navigation
 */

// Public routes (no authentication required)
export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  TRANSLATE: '/translate',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const

// Authentication routes
export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
} as const

// Dashboard routes (authentication required)
export const DASHBOARD_ROUTES = {
  HOME: '/dashboard',
  TRANSLATE: '/dashboard/translate',
  VOCABULARY: '/dashboard/vocabulary',
  PRACTICE: '/dashboard/practice',
  ANALYTICS: '/dashboard/analytics',
  SETTINGS: '/dashboard/settings',
  PROFILE: '/dashboard/profile',
  GOALS: '/dashboard/goals',
  HISTORY: '/dashboard/history',
} as const

// API routes
export const API_ROUTES = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
  },
  
  // Translation
  TRANSLATION: {
    SIMPLE: '/api/translation/simple',
    DETAILED: '/api/translation/detailed',
    HISTORY: '/api/translation/history',
    BATCH: '/api/translation/batch',
  },
  
  // Vocabulary
  VOCABULARY: {
    LIST: '/api/vocabulary',
    CREATE: '/api/vocabulary',
    UPDATE: '/api/vocabulary',
    DELETE: '/api/vocabulary',
    SEARCH: '/api/vocabulary/search',
    EXPORT: '/api/vocabulary/export',
  },
  
  // Practice
  PRACTICE: {
    SESSIONS: '/api/practice',
    START: '/api/practice/start',
    SUBMIT: '/api/practice/submit',
    STATS: '/api/practice/stats',
  },
  
  // Analytics
  ANALYTICS: {
    OVERVIEW: '/api/analytics/overview',
    PROGRESS: '/api/analytics/progress',
    VOCABULARY: '/api/analytics/vocabulary',
    PRACTICE: '/api/analytics/practice',
  },
  
  // User
  USER: {
    PROFILE: '/api/user/profile',
    PREFERENCES: '/api/user/preferences',
    GOALS: '/api/user/goals',
    PROGRESS: '/api/user/progress',
  },
} as const

// PayloadCMS admin routes
export const PAYLOAD_ROUTES = {
  ADMIN: '/admin',
  API: '/api',
} as const

// Route groups for middleware and protection
export const ROUTE_GROUPS = {
  PUBLIC: Object.values(PUBLIC_ROUTES),
  AUTH: Object.values(AUTH_ROUTES),
  DASHBOARD: Object.values(DASHBOARD_ROUTES),
  PROTECTED: Object.values(DASHBOARD_ROUTES),
} as const

// Route patterns for dynamic matching
export const ROUTE_PATTERNS = {
  DASHBOARD: '/dashboard',
  API: '/api',
  AUTH: ['/login', '/register'],
  PUBLIC: ['/', '/about', '/contact', '/translate'],
} as const

// Navigation items for UI components
export const NAVIGATION_ITEMS = {
  MAIN: [
    { label: 'Home', href: PUBLIC_ROUTES.HOME },
    { label: 'Translate', href: PUBLIC_ROUTES.TRANSLATE },
    { label: 'About', href: PUBLIC_ROUTES.ABOUT },
    { label: 'Contact', href: PUBLIC_ROUTES.CONTACT },
  ],
  
  DASHBOARD: [
    { 
      label: 'Dashboard', 
      href: DASHBOARD_ROUTES.HOME,
      icon: 'Home',
    },
    { 
      label: 'Translate', 
      href: DASHBOARD_ROUTES.TRANSLATE,
      icon: 'Languages',
    },
    { 
      label: 'Vocabulary', 
      href: DASHBOARD_ROUTES.VOCABULARY,
      icon: 'BookOpen',
      badge: 'Beta',
    },
    { 
      label: 'Practice', 
      href: DASHBOARD_ROUTES.PRACTICE,
      icon: 'Target',
    },
    { 
      label: 'Analytics', 
      href: DASHBOARD_ROUTES.ANALYTICS,
      icon: 'BarChart3',
      badge: 'Beta',
    },
    { 
      label: 'Settings', 
      href: DASHBOARD_ROUTES.SETTINGS,
      icon: 'Settings',
    },
  ],
  
  FOOTER: [
    { label: 'Privacy Policy', href: PUBLIC_ROUTES.PRIVACY },
    { label: 'Terms of Service', href: PUBLIC_ROUTES.TERMS },
    { label: 'Contact', href: PUBLIC_ROUTES.CONTACT },
  ],
} as const

// Route utilities
export const RouteUtils = {
  /**
   * Check if a route is public (no authentication required)
   */
  isPublicRoute: (pathname: string): boolean => {
    return ROUTE_GROUPS.PUBLIC.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    )
  },

  /**
   * Check if a route is protected (authentication required)
   */
  isProtectedRoute: (pathname: string): boolean => {
    return ROUTE_GROUPS.PROTECTED.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    )
  },

  /**
   * Check if a route is an auth route
   */
  isAuthRoute: (pathname: string): boolean => {
    return ROUTE_GROUPS.AUTH.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    )
  },

  /**
   * Check if a route is a dashboard route
   */
  isDashboardRoute: (pathname: string): boolean => {
    return pathname.startsWith(ROUTE_PATTERNS.DASHBOARD)
  },

  /**
   * Check if a route is an API route
   */
  isApiRoute: (pathname: string): boolean => {
    return pathname.startsWith(ROUTE_PATTERNS.API)
  },

  /**
   * Get the redirect URL after login
   */
  getRedirectAfterLogin: (redirectParam?: string | null): string => {
    if (redirectParam && RouteUtils.isProtectedRoute(redirectParam)) {
      return redirectParam
    }
    return DASHBOARD_ROUTES.HOME
  },

  /**
   * Get the redirect URL after logout
   */
  getRedirectAfterLogout: (): string => {
    return PUBLIC_ROUTES.HOME
  },
} as const

// Export all route constants
export const ROUTES = {
  PUBLIC: PUBLIC_ROUTES,
  AUTH: AUTH_ROUTES,
  DASHBOARD: DASHBOARD_ROUTES,
  API: API_ROUTES,
  PAYLOAD: PAYLOAD_ROUTES,
} as const

// Type definitions for type safety
export type PublicRoute = typeof PUBLIC_ROUTES[keyof typeof PUBLIC_ROUTES]
export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES]
export type DashboardRoute = typeof DASHBOARD_ROUTES[keyof typeof DASHBOARD_ROUTES]
export type ApiRoute = string // API routes are nested, so we use string
export type Route = PublicRoute | AuthRoute | DashboardRoute | ApiRoute

export default ROUTES
