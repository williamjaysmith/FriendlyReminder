import { 
  AppError, 
  ValidationError, 
  NetworkError, 
  AuthError, 
  NotFoundError, 
  PermissionError,
  errorHandler,
  createError,
  ERROR_CODES,
  HTTP_STATUS_CODES
} from '../errors'

describe('error utilities', () => {
  describe('AppError', () => {
    it('should create an AppError with message and code', () => {
      const error = new AppError('Test error', 'TEST_CODE')
      
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_CODE')
      expect(error.name).toBe('AppError')
    })

    it('should create an AppError with default code', () => {
      const error = new AppError('Test error')
      
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('UNKNOWN_ERROR')
    })

    it('should create an AppError with context and original error', () => {
      const originalError = new Error('Original error')
      const context = { component: 'TestComponent' }
      const error = new AppError('Test error', 'TEST_CODE', context, originalError)
      
      expect(error.context).toBe(context)
      expect(error.originalError).toBe(originalError)
    })
  })

  describe('ValidationError', () => {
    it('should create a ValidationError with errors object', () => {
      const errors = { name: 'Name is required', email: 'Invalid email' }
      const error = new ValidationError('Validation failed', errors)
      
      expect(error.name).toBe('ValidationError')
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.errors).toBe(errors)
    })

    it('should create a ValidationError with specific field', () => {
      const error = new ValidationError('Field error', {}, 'email')
      
      expect(error.field).toBe('email')
    })
  })

  describe('NetworkError', () => {
    it('should create a NetworkError with status and response', () => {
      const response = { message: 'Server error' }
      const error = new NetworkError('Network failed', 500, response)
      
      expect(error.name).toBe('NetworkError')
      expect(error.code).toBe('NETWORK_ERROR')
      expect(error.status).toBe(500)
      expect(error.response).toBe(response)
    })
  })

  describe('AuthError', () => {
    it('should create an AuthError with default code', () => {
      const error = new AuthError('Authentication failed')
      
      expect(error.name).toBe('AuthError')
      expect(error.code).toBe('AUTH_ERROR')
    })

    it('should create an AuthError with custom code', () => {
      const error = new AuthError('Token expired', 'TOKEN_EXPIRED')
      
      expect(error.code).toBe('TOKEN_EXPIRED')
    })
  })

  describe('NotFoundError', () => {
    it('should create a NotFoundError with resource name', () => {
      const error = new NotFoundError('User')
      
      expect(error.name).toBe('NotFoundError')
      expect(error.code).toBe('NOT_FOUND')
      expect(error.message).toBe('User not found')
    })
  })

  describe('PermissionError', () => {
    it('should create a PermissionError with action', () => {
      const error = new PermissionError('delete user')
      
      expect(error.name).toBe('PermissionError')
      expect(error.code).toBe('PERMISSION_DENIED')
      expect(error.message).toBe('Permission denied: delete user')
    })
  })

  describe('errorHandler.normalize', () => {
    it('should return AppError as-is', () => {
      const appError = new AppError('Test error', 'TEST_CODE')
      const result = errorHandler.normalize(appError)
      
      expect(result).toBe(appError)
    })

    it('should convert Error to AppError', () => {
      const error = new Error('Test error')
      const result = errorHandler.normalize(error)
      
      expect(result).toBeInstanceOf(AppError)
      expect(result.message).toBe('Test error')
      expect(result.code).toBe('UNKNOWN_ERROR')
      expect(result.originalError).toBe(error)
    })

    it('should convert string to AppError', () => {
      const result = errorHandler.normalize('String error')
      
      expect(result).toBeInstanceOf(AppError)
      expect(result.message).toBe('String error')
      expect(result.code).toBe('UNKNOWN_ERROR')
    })

    it('should convert unknown error to AppError', () => {
      const result = errorHandler.normalize({ custom: 'error' })
      
      expect(result).toBeInstanceOf(AppError)
      expect(result.message).toBe('An unknown error occurred')
      expect(result.code).toBe('UNKNOWN_ERROR')
    })
  })

  describe('errorHandler.toApiError', () => {
    it('should convert error to API error format', () => {
      const appError = new AppError('Test error', 'TEST_CODE', { component: 'Test' })
      const result = errorHandler.toApiError(appError)
      
      expect(result).toEqual({
        message: 'Test error',
        code: 'TEST_CODE',
        details: { component: 'Test' }
      })
    })

    it('should handle regular errors', () => {
      const error = new Error('Regular error')
      const result = errorHandler.toApiError(error)
      
      expect(result.message).toBe('Regular error')
      expect(result.code).toBe('UNKNOWN_ERROR')
    })
  })

  describe('errorHandler.getUserMessage', () => {
    it('should return user-friendly message for known error codes', () => {
      const networkError = new NetworkError('Connection failed')
      const result = errorHandler.getUserMessage(networkError)
      
      expect(result).toBe('Network error. Please check your connection and try again.')
    })

    it('should return original message for unknown error codes', () => {
      const customError = new AppError('Custom error', 'CUSTOM_CODE')
      const result = errorHandler.getUserMessage(customError)
      
      expect(result).toBe('Custom error')
    })

    it('should handle regular errors', () => {
      const error = new Error('Regular error')
      const result = errorHandler.getUserMessage(error)
      
      expect(result).toBe('An unexpected error occurred. Please try again.')
    })
  })

  describe('errorHandler.log', () => {
    it('should log error with context', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new AppError('Test error', 'TEST_CODE')
      const context = { component: 'TestComponent' }
      
      errorHandler.log(error, context)
      
      expect(consoleSpy).toHaveBeenCalledWith('Error occurred:', expect.objectContaining({
        message: 'Test error',
        code: 'TEST_CODE',
        context: expect.objectContaining(context)
      }))
      
      consoleSpy.mockRestore()
    })

    it('should log regular errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('Regular error')
      
      errorHandler.log(error)
      
      expect(consoleSpy).toHaveBeenCalledWith('Error occurred:', expect.objectContaining({
        message: 'Regular error',
        code: 'UNKNOWN_ERROR'
      }))
      
      consoleSpy.mockRestore()
    })
  })

  describe('errorHandler.retry', () => {
    it('should retry function on failure', async () => {
      let attempts = 0
      const fn = jest.fn().mockImplementation(() => {
        attempts++
        if (attempts < 3) {
          throw new NetworkError('Network failed')
        }
        return 'success'
      })
      
      const result = await errorHandler.retry(fn, 3, 10)
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('should not retry non-network errors', async () => {
      const fn = jest.fn().mockImplementation(() => {
        throw new ValidationError('Validation failed')
      })
      
      await expect(errorHandler.retry(fn, 3, 10)).rejects.toThrow('Validation failed')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should fail after max retries', async () => {
      const fn = jest.fn().mockImplementation(() => {
        throw new NetworkError('Network failed')
      })
      
      await expect(errorHandler.retry(fn, 2, 10)).rejects.toThrow('Network failed')
      expect(fn).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })
  })

  describe('createError factories', () => {
    it('should create validation error', () => {
      const error = createError.validation('email', 'Invalid email')
      
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.field).toBe('email')
      expect(error.errors).toEqual({ email: 'Invalid email' })
    })

    it('should create network error', () => {
      const error = createError.network('Connection failed', 500, { details: 'timeout' })
      
      expect(error).toBeInstanceOf(NetworkError)
      expect(error.status).toBe(500)
      expect(error.response).toEqual({ details: 'timeout' })
    })

    it('should create auth error', () => {
      const error = createError.auth('Login required')
      
      expect(error).toBeInstanceOf(AuthError)
      expect(error.message).toBe('Login required')
    })

    it('should create not found error', () => {
      const error = createError.notFound('Contact')
      
      expect(error).toBeInstanceOf(NotFoundError)
      expect(error.message).toBe('Contact not found')
    })

    it('should create permission error', () => {
      const error = createError.permission('delete contact')
      
      expect(error).toBeInstanceOf(PermissionError)
      expect(error.message).toBe('Permission denied: delete contact')
    })

    it('should create generic error', () => {
      const error = createError.generic('Generic error', 'GENERIC_CODE')
      
      expect(error).toBeInstanceOf(AppError)
      expect(error.message).toBe('Generic error')
      expect(error.code).toBe('GENERIC_CODE')
    })
  })

  describe('error constants', () => {
    it('should export error codes', () => {
      expect(ERROR_CODES.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR')
      expect(ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
      expect(ERROR_CODES.NETWORK_ERROR).toBe('NETWORK_ERROR')
      expect(ERROR_CODES.AUTH_ERROR).toBe('AUTH_ERROR')
      expect(ERROR_CODES.NOT_FOUND).toBe('NOT_FOUND')
      expect(ERROR_CODES.PERMISSION_DENIED).toBe('PERMISSION_DENIED')
    })

    it('should export HTTP status codes', () => {
      expect(HTTP_STATUS_CODES.OK).toBe(200)
      expect(HTTP_STATUS_CODES.CREATED).toBe(201)
      expect(HTTP_STATUS_CODES.BAD_REQUEST).toBe(400)
      expect(HTTP_STATUS_CODES.UNAUTHORIZED).toBe(401)
      expect(HTTP_STATUS_CODES.FORBIDDEN).toBe(403)
      expect(HTTP_STATUS_CODES.NOT_FOUND).toBe(404)
      expect(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).toBe(500)
    })
  })
})