/**
 * Authentication Feature Public API
 * Business logic and data layer only (components moved to @/components/auth)
 */

// Types
export * from './types'

// Actions
export * from './actions'

// Contexts
export * from './contexts'

// Re-export commonly used types for convenience
export type {
  User,
  UserRole,
  AuthStatus,
  LoginCredentials,
  RegisterData,
  AuthContext,
  AuthResponse,
  UserPreferences,
  UserProfile,
} from './types'
