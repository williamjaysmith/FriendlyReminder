import { 
  AppError, 
  ValidationError, 
  NetworkError,
  errorHandler,
  ERROR_CODES,
  HTTP_STATUS_CODES
} from '../errors'

jest.spyOn(console, 'error').mockImplementation(() => {})

describe('Error Utils', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('AppError', () => {
    it('should create AppError with correct properties', () => {
      const originalError = new Error('Original')
      const error = new AppError('Test message', 'TEST_CODE', { userId: '123' }, originalError)
      
      expect(error.name).toBe('AppError')
      expect(error.message).toBe('Test message')
      expect(error.code).toBe('TEST_CODE')
      expect(error.context).toEqual({ userId: '123' })
      expect(error.originalError).toBe(originalError)
    })

    it('should extend Error correctly', () => {
      const error = new AppError('Test message', 'TEST_CODE')
      expect(error instanceof Error).toBe(true)
      expect(error instanceof AppError).toBe(true)
    })
  })

  describe('ValidationError', () => {
    it('should create ValidationError with field errors', () => {
      const fieldErrors = { email: 'Invalid email', name: 'Required' }
      const error = new ValidationError('Validation failed', fieldErrors, 'email')
      
      expect(error.name).toBe('ValidationError')
      expect(error.message).toBe('Validation failed')
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.errors).toEqual(fieldErrors)
      expect(error.field).toBe('email')
    })
  })

  describe('NetworkError', () => {
    it('should create NetworkError with status and response', () => {
      const response = { message: 'Server error' }
      const error = new NetworkError('Network failed', 500, response)
      
      expect(error.name).toBe('NetworkError')
      expect(error.message).toBe('Network failed')
      expect(error.code).toBe('NETWORK_ERROR')
      expect(error.status).toBe(500)
      expect(error.response).toEqual(response)
    })
  })

  describe('errorHandler.normalize', () => {
    it('should return AppError unchanged', () => {
      const error = new AppError('Test error', 'TEST')
      const result = errorHandler.normalize(error)
      expect(result).toBe(error)
    })

    it('should wrap regular Error', () => {
      const error = new Error('Regular error')
      const result = errorHandler.normalize(error)
      
      expect(result).toBeInstanceOf(AppError)
      expect(result.message).toBe('Regular error')
      expect(result.code).toBe('UNKNOWN_ERROR')
    })
  })

  describe('Error Constants', () => {
    it('should have correct error codes', () => {
      expect(ERROR_CODES.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR')
      expect(ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
      expect(ERROR_CODES.NETWORK_ERROR).toBe('NETWORK_ERROR')
      expect(ERROR_CODES.AUTH_ERROR).toBe('AUTH_ERROR')
    })

    it('should have correct HTTP status codes', () => {
      expect(HTTP_STATUS_CODES.OK).toBe(200)
      expect(HTTP_STATUS_CODES.NOT_FOUND).toBe(404)
      expect(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).toBe(500)
    })
  })
})