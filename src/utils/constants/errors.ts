/**
 * Application Error Constants
 * Centralized error codes, messages, and types for consistent error handling
 */

// Error codes for different categories
export const ERROR_CODES = {
  // Authentication errors (1000-1999)
  AUTH: {
    INVALID_CREDENTIALS: 'AUTH_1001',
    TOKEN_EXPIRED: 'AUTH_1002',
    TOKEN_INVALID: 'AUTH_1003',
    UNAUTHORIZED: 'AUTH_1004',
    FORBIDDEN: 'AUTH_1005',
    USER_NOT_FOUND: 'AUTH_1006',
    USER_ALREADY_EXISTS: 'AUTH_1007',
    WEAK_PASSWORD: 'AUTH_1008',
    EMAIL_NOT_VERIFIED: 'AUTH_1009',
    ACCOUNT_LOCKED: 'AUTH_1010',
  },

  // Validation errors (2000-2999)
  VALIDATION: {
    REQUIRED_FIELD: 'VAL_2001',
    INVALID_EMAIL: 'VAL_2002',
    INVALID_FORMAT: 'VAL_2003',
    MIN_LENGTH: 'VAL_2004',
    MAX_LENGTH: 'VAL_2005',
    INVALID_TYPE: 'VAL_2006',
    OUT_OF_RANGE: 'VAL_2007',
    INVALID_ENUM: 'VAL_2008',
  },

  // Translation errors (3000-3999)
  TRANSLATION: {
    SERVICE_UNAVAILABLE: 'TRANS_3001',
    INVALID_LANGUAGE: 'TRANS_3002',
    TEXT_TOO_LONG: 'TRANS_3003',
    QUOTA_EXCEEDED: 'TRANS_3004',
    PROCESSING_FAILED: 'TRANS_3005',
    UNSUPPORTED_LANGUAGE_PAIR: 'TRANS_3006',
  },

  // Database errors (4000-4999)
  DATABASE: {
    CONNECTION_FAILED: 'DB_4001',
    QUERY_FAILED: 'DB_4002',
    RECORD_NOT_FOUND: 'DB_4003',
    DUPLICATE_ENTRY: 'DB_4004',
    CONSTRAINT_VIOLATION: 'DB_4005',
    TRANSACTION_FAILED: 'DB_4006',
  },

  // API errors (5000-5999)
  API: {
    INVALID_REQUEST: 'API_5001',
    METHOD_NOT_ALLOWED: 'API_5002',
    RATE_LIMIT_EXCEEDED: 'API_5003',
    PAYLOAD_TOO_LARGE: 'API_5004',
    UNSUPPORTED_MEDIA_TYPE: 'API_5005',
    INTERNAL_SERVER_ERROR: 'API_5006',
    SERVICE_UNAVAILABLE: 'API_5007',
    TIMEOUT: 'API_5008',
  },

  // Business logic errors (6000-6999)
  BUSINESS: {
    INSUFFICIENT_PERMISSIONS: 'BIZ_6001',
    RESOURCE_LOCKED: 'BIZ_6002',
    OPERATION_NOT_ALLOWED: 'BIZ_6003',
    QUOTA_EXCEEDED: 'BIZ_6004',
    INVALID_STATE: 'BIZ_6005',
    DEPENDENCY_MISSING: 'BIZ_6006',
  },

  // External service errors (7000-7999)
  EXTERNAL: {
    AI_SERVICE_ERROR: 'EXT_7001',
    EMAIL_SERVICE_ERROR: 'EXT_7002',
    STORAGE_SERVICE_ERROR: 'EXT_7003',
    PAYMENT_SERVICE_ERROR: 'EXT_7004',
    THIRD_PARTY_API_ERROR: 'EXT_7005',
  },
} as const

// Error messages corresponding to error codes
export const ERROR_MESSAGES = {
  // Authentication messages
  [ERROR_CODES.AUTH.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ERROR_CODES.AUTH.TOKEN_EXPIRED]: 'Your session has expired. Please log in again',
  [ERROR_CODES.AUTH.TOKEN_INVALID]: 'Invalid authentication token',
  [ERROR_CODES.AUTH.UNAUTHORIZED]: 'You must be logged in to access this resource',
  [ERROR_CODES.AUTH.FORBIDDEN]: 'You do not have permission to access this resource',
  [ERROR_CODES.AUTH.USER_NOT_FOUND]: 'User not found',
  [ERROR_CODES.AUTH.USER_ALREADY_EXISTS]: 'An account with this email already exists',
  [ERROR_CODES.AUTH.WEAK_PASSWORD]: 'Password must be at least 8 characters long',
  [ERROR_CODES.AUTH.EMAIL_NOT_VERIFIED]: 'Please verify your email address',
  [ERROR_CODES.AUTH.ACCOUNT_LOCKED]: 'Your account has been temporarily locked',

  // Validation messages
  [ERROR_CODES.VALIDATION.REQUIRED_FIELD]: 'This field is required',
  [ERROR_CODES.VALIDATION.INVALID_EMAIL]: 'Please enter a valid email address',
  [ERROR_CODES.VALIDATION.INVALID_FORMAT]: 'Invalid format',
  [ERROR_CODES.VALIDATION.MIN_LENGTH]: 'Input is too short',
  [ERROR_CODES.VALIDATION.MAX_LENGTH]: 'Input is too long',
  [ERROR_CODES.VALIDATION.INVALID_TYPE]: 'Invalid data type',
  [ERROR_CODES.VALIDATION.OUT_OF_RANGE]: 'Value is out of acceptable range',
  [ERROR_CODES.VALIDATION.INVALID_ENUM]: 'Invalid option selected',

  // Translation messages
  [ERROR_CODES.TRANSLATION.SERVICE_UNAVAILABLE]: 'Translation service is currently unavailable',
  [ERROR_CODES.TRANSLATION.INVALID_LANGUAGE]: 'Unsupported language',
  [ERROR_CODES.TRANSLATION.TEXT_TOO_LONG]: 'Text is too long for translation',
  [ERROR_CODES.TRANSLATION.QUOTA_EXCEEDED]: 'Translation quota exceeded',
  [ERROR_CODES.TRANSLATION.PROCESSING_FAILED]: 'Translation processing failed',
  [ERROR_CODES.TRANSLATION.UNSUPPORTED_LANGUAGE_PAIR]: 'This language pair is not supported',

  // Database messages
  [ERROR_CODES.DATABASE.CONNECTION_FAILED]: 'Database connection failed',
  [ERROR_CODES.DATABASE.QUERY_FAILED]: 'Database query failed',
  [ERROR_CODES.DATABASE.RECORD_NOT_FOUND]: 'Record not found',
  [ERROR_CODES.DATABASE.DUPLICATE_ENTRY]: 'Record already exists',
  [ERROR_CODES.DATABASE.CONSTRAINT_VIOLATION]: 'Data constraint violation',
  [ERROR_CODES.DATABASE.TRANSACTION_FAILED]: 'Database transaction failed',

  // API messages
  [ERROR_CODES.API.INVALID_REQUEST]: 'Invalid request',
  [ERROR_CODES.API.METHOD_NOT_ALLOWED]: 'Method not allowed',
  [ERROR_CODES.API.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please try again later',
  [ERROR_CODES.API.PAYLOAD_TOO_LARGE]: 'Request payload is too large',
  [ERROR_CODES.API.UNSUPPORTED_MEDIA_TYPE]: 'Unsupported media type',
  [ERROR_CODES.API.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [ERROR_CODES.API.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
  [ERROR_CODES.API.TIMEOUT]: 'Request timeout',

  // Business logic messages
  [ERROR_CODES.BUSINESS.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions',
  [ERROR_CODES.BUSINESS.RESOURCE_LOCKED]: 'Resource is currently locked',
  [ERROR_CODES.BUSINESS.OPERATION_NOT_ALLOWED]: 'Operation not allowed',
  [ERROR_CODES.BUSINESS.QUOTA_EXCEEDED]: 'Usage quota exceeded',
  [ERROR_CODES.BUSINESS.INVALID_STATE]: 'Invalid state for this operation',
  [ERROR_CODES.BUSINESS.DEPENDENCY_MISSING]: 'Required dependency is missing',

  // External service messages
  [ERROR_CODES.EXTERNAL.AI_SERVICE_ERROR]: 'AI service error',
  [ERROR_CODES.EXTERNAL.EMAIL_SERVICE_ERROR]: 'Email service error',
  [ERROR_CODES.EXTERNAL.STORAGE_SERVICE_ERROR]: 'Storage service error',
  [ERROR_CODES.EXTERNAL.PAYMENT_SERVICE_ERROR]: 'Payment service error',
  [ERROR_CODES.EXTERNAL.THIRD_PARTY_API_ERROR]: 'Third-party service error',
} as const

// HTTP status codes mapping
export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

// Error categories for logging and monitoring
export const ERROR_CATEGORIES = {
  AUTHENTICATION: 'authentication',
  VALIDATION: 'validation',
  BUSINESS_LOGIC: 'business_logic',
  DATABASE: 'database',
  EXTERNAL_SERVICE: 'external_service',
  SYSTEM: 'system',
  NETWORK: 'network',
  SECURITY: 'security',
} as const

// Error types for different contexts
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES][keyof typeof ERROR_CODES[keyof typeof ERROR_CODES]]
export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES]
export type HttpStatusCode = typeof HTTP_STATUS_CODES[keyof typeof HTTP_STATUS_CODES]
export type ErrorSeverity = typeof ERROR_SEVERITY[keyof typeof ERROR_SEVERITY]
export type ErrorCategory = typeof ERROR_CATEGORIES[keyof typeof ERROR_CATEGORIES]

// Utility functions for error handling
export const ErrorUtils = {
  /**
   * Get error message by code
   */
  getMessage: (code: string): string => {
    return ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || 'An unexpected error occurred'
  },

  /**
   * Check if error code exists
   */
  isValidCode: (code: string): boolean => {
    return code in ERROR_MESSAGES
  },

  /**
   * Get error category by code
   */
  getCategory: (code: string): ErrorCategory => {
    if (code.startsWith('AUTH_')) return ERROR_CATEGORIES.AUTHENTICATION
    if (code.startsWith('VAL_')) return ERROR_CATEGORIES.VALIDATION
    if (code.startsWith('TRANS_')) return ERROR_CATEGORIES.BUSINESS_LOGIC
    if (code.startsWith('DB_')) return ERROR_CATEGORIES.DATABASE
    if (code.startsWith('API_')) return ERROR_CATEGORIES.SYSTEM
    if (code.startsWith('BIZ_')) return ERROR_CATEGORIES.BUSINESS_LOGIC
    if (code.startsWith('EXT_')) return ERROR_CATEGORIES.EXTERNAL_SERVICE
    return ERROR_CATEGORIES.SYSTEM
  },

  /**
   * Get HTTP status code for error code
   */
  getHttpStatus: (code: string): HttpStatusCode => {
    if (code.startsWith('AUTH_')) {
      if (code === ERROR_CODES.AUTH.UNAUTHORIZED) return HTTP_STATUS_CODES.UNAUTHORIZED
      if (code === ERROR_CODES.AUTH.FORBIDDEN) return HTTP_STATUS_CODES.FORBIDDEN
      return HTTP_STATUS_CODES.BAD_REQUEST
    }
    if (code.startsWith('VAL_')) return HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY
    if (code.startsWith('DB_')) {
      if (code === ERROR_CODES.DATABASE.RECORD_NOT_FOUND) return HTTP_STATUS_CODES.NOT_FOUND
      if (code === ERROR_CODES.DATABASE.DUPLICATE_ENTRY) return HTTP_STATUS_CODES.CONFLICT
      return HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
    }
    if (code.startsWith('API_')) {
      if (code === ERROR_CODES.API.RATE_LIMIT_EXCEEDED) return HTTP_STATUS_CODES.TOO_MANY_REQUESTS
      if (code === ERROR_CODES.API.METHOD_NOT_ALLOWED) return HTTP_STATUS_CODES.METHOD_NOT_ALLOWED
      return HTTP_STATUS_CODES.BAD_REQUEST
    }
    return HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
  },
} as const

export default {
  CODES: ERROR_CODES,
  MESSAGES: ERROR_MESSAGES,
  HTTP_STATUS: HTTP_STATUS_CODES,
  SEVERITY: ERROR_SEVERITY,
  CATEGORIES: ERROR_CATEGORIES,
  Utils: ErrorUtils,
}
