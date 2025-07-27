/**
 * Authentication Domain Types
 * Core types for the authentication feature domain
 */

import { BaseEntity } from '@/core/types/api.types'

// User roles
export type UserRole = 'user' | 'admin' | 'moderator'

// Authentication status
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading'

// User entity
export interface User extends BaseEntity {
  email: string
  firstName?: string
  lastName?: string
  role: UserRole
  isEmailVerified: boolean
  lastLoginAt?: string
  preferences?: UserPreferences
  profile?: UserProfile
}

// User preferences
export interface UserPreferences {
  language: string
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
  }
  privacy: {
    profileVisible: boolean
    statsVisible: boolean
  }
}

// User profile
export interface UserProfile {
  avatar?: string
  bio?: string
  location?: string
  website?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
  learningGoals?: string[]
  nativeLanguages?: string[]
  targetLanguages?: string[]
}

// Authentication credentials
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

// Registration data
export interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  acceptTerms: boolean
  subscribeNewsletter?: boolean
}

// Password reset request
export interface PasswordResetRequest {
  email: string
}

// Password reset data
export interface PasswordResetData {
  token: string
  newPassword: string
  confirmPassword: string
}

// Email verification data
export interface EmailVerificationData {
  token: string
}

// Authentication tokens
export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt: string
  tokenType: 'Bearer'
}

// Authentication session
export interface AuthSession {
  user: User
  tokens: AuthTokens
  issuedAt: string
  expiresAt: string
  deviceInfo?: DeviceInfo
}

// Device information
export interface DeviceInfo {
  userAgent: string
  ip: string
  platform?: string
  browser?: string
  os?: string
  isMobile: boolean
}

// Authentication context
export interface AuthContext {
  user: User | null
  status: AuthStatus
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  updatePreferences: (data: Partial<UserPreferences>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (data: PasswordResetData) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  resendVerificationEmail: () => Promise<void>
}

// Authentication response
export interface AuthResponse {
  user: User
  tokens: AuthTokens
  message?: string
}

// Authentication error
export interface AuthError {
  code: string
  message: string
  field?: string
  details?: Record<string, unknown>
}

// Login attempt tracking
export interface LoginAttempt {
  email: string
  ip: string
  userAgent: string
  success: boolean
  timestamp: string
  failureReason?: string
}

// Account security settings
export interface SecuritySettings {
  twoFactorEnabled: boolean
  trustedDevices: TrustedDevice[]
  recentActivity: SecurityActivity[]
  passwordLastChanged: string
  accountLocked: boolean
  lockReason?: string
  lockExpiresAt?: string
}

// Trusted device
export interface TrustedDevice {
  id: string
  name: string
  deviceInfo: DeviceInfo
  addedAt: string
  lastUsedAt: string
  isActive: boolean
}

// Security activity
export interface SecurityActivity {
  id: string
  type: 'login' | 'logout' | 'password_change' | 'email_change' | 'profile_update'
  description: string
  ip: string
  userAgent: string
  timestamp: string
  success: boolean
}

// Two-factor authentication
export interface TwoFactorAuth {
  enabled: boolean
  secret?: string
  backupCodes?: string[]
  lastUsedAt?: string
}

// Social authentication providers
export type SocialProvider = 'google' | 'github' | 'twitter' | 'facebook'

// Social authentication data
export interface SocialAuthData {
  provider: SocialProvider
  providerId: string
  email: string
  name?: string
  avatar?: string
  accessToken: string
  refreshToken?: string
}

// Account verification status
export interface VerificationStatus {
  email: boolean
  phone?: boolean
  identity?: boolean
  completedAt?: string
}

// User statistics
export interface UserStats {
  totalTranslations: number
  totalVocabulary: number
  totalPracticeSessions: number
  streakDays: number
  joinedAt: string
  lastActiveAt: string
  achievements: string[]
}

// Authentication configuration
export interface AuthConfig {
  sessionTimeout: number
  maxLoginAttempts: number
  lockoutDuration: number
  passwordMinLength: number
  passwordRequireSpecialChars: boolean
  passwordRequireNumbers: boolean
  passwordRequireUppercase: boolean
  emailVerificationRequired: boolean
  twoFactorEnabled: boolean
  socialAuthEnabled: boolean
  supportedSocialProviders: SocialProvider[]
}

// JWT payload
export interface JWTPayload {
  sub: string // user ID
  email: string
  role: UserRole
  iat: number
  exp: number
  jti?: string // JWT ID
  deviceId?: string
}

// Authentication middleware context
export interface AuthMiddlewareContext {
  user?: User
  token?: string
  deviceInfo?: DeviceInfo
  requestId: string
}

// Permission check
export interface Permission {
  resource: string
  action: string
  conditions?: Record<string, unknown>
}

// Role-based access control
export interface RolePermissions {
  role: UserRole
  permissions: Permission[]
  inherits?: UserRole[]
}

// Account deletion request
export interface AccountDeletionRequest {
  reason: string
  feedback?: string
  scheduledAt: string
  confirmationToken: string
}

// Export/import user data
export interface UserDataExport {
  user: User
  translations: unknown[]
  vocabulary: unknown[]
  practiceSessions: unknown[]
  preferences: UserPreferences
  exportedAt: string
  format: 'json' | 'csv'
}

// Type guards
export const isUser = (obj: unknown): obj is User => {
  return typeof obj === 'object' && obj !== null && 'email' in obj && 'role' in obj
}

export const isAuthenticatedUser = (user: User | null): user is User => {
  return user !== null && isUser(user)
}

// Constants
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  language: 'en',
  theme: 'system',
  notifications: {
    email: true,
    push: false,
    marketing: false,
  },
  privacy: {
    profileVisible: false,
    statsVisible: false,
  },
}

export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  passwordMinLength: 8,
  passwordRequireSpecialChars: true,
  passwordRequireNumbers: true,
  passwordRequireUppercase: true,
  emailVerificationRequired: true,
  twoFactorEnabled: false,
  socialAuthEnabled: false,
  supportedSocialProviders: ['google', 'github'],
}

export const USER_ROLES: Record<UserRole, { name: string; level: number }> = {
  user: { name: 'User', level: 1 },
  moderator: { name: 'Moderator', level: 2 },
  admin: { name: 'Administrator', level: 3 },
}

// Utility functions
export const AuthUtils = {
  /**
   * Check if user has required role level
   */
  hasRoleLevel: (userRole: UserRole, requiredRole: UserRole): boolean => {
    return USER_ROLES[userRole].level >= USER_ROLES[requiredRole].level
  },

  /**
   * Check if user has specific permission
   */
  hasPermission: (user: User, permission: Permission): boolean => {
    // Implementation would depend on your permission system
    // This is a placeholder
    return true
  },

  /**
   * Generate display name for user
   */
  getDisplayName: (user: User): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user.firstName) {
      return user.firstName
    }
    return user.email.split('@')[0]
  },

  /**
   * Check if password meets requirements
   */
  validatePassword: (password: string, config: AuthConfig = DEFAULT_AUTH_CONFIG): boolean => {
    if (password.length < config.passwordMinLength) return false
    if (config.passwordRequireNumbers && !/\d/.test(password)) return false
    if (config.passwordRequireUppercase && !/[A-Z]/.test(password)) return false
    if (config.passwordRequireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false
    return true
  },
} as const
