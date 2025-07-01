// Error handling utilities
import { ApiError, ErrorContext } from '../types'

export class AppError extends Error {
  public code: string
  public context?: ErrorContext
  public originalError?: Error

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    context?: ErrorContext,
    originalError?: Error
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.context = context
    this.originalError = originalError
  }
}

export class ValidationError extends AppError {
  public field?: string
  public errors: Record<string, string>

  constructor(
    message: string,
    errors: Record<string, string> = {},
    field?: string
  ) {
    super(message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
    this.field = field
    this.errors = errors
  }
}

export class NetworkError extends AppError {
  public status?: number
  public response?: any

  constructor(
    message: string,
    status?: number,
    response?: any
  ) {
    super(message, 'NETWORK_ERROR')
    this.name = 'NetworkError'
    this.status = status
    this.response = response
  }
}

export class AuthError extends AppError {
  constructor(message: string, code = 'AUTH_ERROR') {
    super(message, code)
    this.name = 'AuthError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class PermissionError extends AppError {
  constructor(action: string) {
    super(`Permission denied: ${action}`, 'PERMISSION_DENIED')
    this.name = 'PermissionError'
  }
}

// Error handling utilities
export const errorHandler = {
  // Convert unknown error to AppError
  normalize: (error: unknown): AppError => {
    if (error instanceof AppError) {
      return error
    }

    if (error instanceof Error) {
      return new AppError(error.message, 'UNKNOWN_ERROR', undefined, error)
    }

    if (typeof error === 'string') {
      return new AppError(error, 'UNKNOWN_ERROR')
    }

    return new AppError('An unknown error occurred', 'UNKNOWN_ERROR')
  },

  // Convert error to API error format
  toApiError: (error: unknown): ApiError => {
    const normalized = errorHandler.normalize(error)
    return {
      message: normalized.message,
      code: normalized.code,
      details: normalized.context
    }
  },

  // Get user-friendly error message
  getUserMessage: (error: unknown): string => {
    const normalized = errorHandler.normalize(error)
    
    const userMessages: Record<string, string> = {
      'NETWORK_ERROR': 'Network error. Please check your connection and try again.',
      'AUTH_ERROR': 'Authentication failed. Please log in again.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'NOT_FOUND': 'The requested resource was not found.',
      'PERMISSION_DENIED': 'You do not have permission to perform this action.',
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
    }

    return userMessages[normalized.code] || normalized.message
  },

  // Log error with context
  log: (error: unknown, context?: ErrorContext): void => {
    const normalized = errorHandler.normalize(error)
    
    console.error('Error occurred:', {
      message: normalized.message,
      code: normalized.code,
      context: { ...normalized.context, ...context },
      stack: normalized.stack,
      timestamp: new Date().toISOString()
    })

    // In production, you might want to send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service like Sentry, LogRocket, etc.
    }
  },

  // Retry logic for network errors
  retry: async <T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000
  ): Promise<T> => {
    let lastError: Error

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (i === maxRetries) {
          throw lastError
        }

        // Only retry on network errors
        if (!(error instanceof NetworkError)) {
          throw lastError
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)))
      }
    }

    throw lastError!
  }
}

// Error boundary helpers
export function withErrorBoundary<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
) {
  return function WrappedComponent(props: T) {
    // This would be implemented with a proper error boundary component
    // For now, just return the original component
    return Component(props)
  }
}

// Async error wrapper
export const asyncErrorWrapper = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      errorHandler.log(error, {
        action: fn.name,
        timestamp: new Date()
      })
      throw errorHandler.normalize(error)
    }
  }
}

// Common error factories
export const createError = {
  validation: (field: string, message: string) => 
    new ValidationError(message, { [field]: message }, field),

  network: (message: string, status?: number, response?: any) =>
    new NetworkError(message, status, response),

  auth: (message: string = 'Authentication required') =>
    new AuthError(message),

  notFound: (resource: string) =>
    new NotFoundError(resource),

  permission: (action: string) =>
    new PermissionError(action),

  generic: (message: string, code?: string) =>
    new AppError(message, code)
}

// Error constants
export const ERROR_CODES = {
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR'
} as const

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const