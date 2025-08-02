/**
 * Authentication Feature Public API
 * Consolidated auth feature with all related code
 */

// Types
export * from './types'

// Actions
export * from './actions'

// Components
export * from './components'

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
