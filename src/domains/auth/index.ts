/**
 * Authentication Domain Public API
 * Exports all public interfaces and implementations for the authentication domain
 */

// Types
export * from './types'

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
