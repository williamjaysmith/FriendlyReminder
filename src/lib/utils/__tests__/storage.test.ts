import { storage, CachedStorage, localStorage, sessionStorage, cookieStorage, STORAGE_KEYS } from '../storage'

// Mock localStorage and sessionStorage
const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

const mockDocument = {
  cookie: '',
}

// Mock window and document
Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
  writable: true,
})

Object.defineProperty(window, 'sessionStorage', {
  value: mockStorage,
  writable: true,
})

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
})

describe('storage utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDocument.cookie = ''
  })

  describe('storage.local', () => {
    it('should get item from localStorage', () => {
      mockStorage.getItem.mockReturnValue(JSON.stringify('test-value'))
      
      const result = storage.local.get('test-key')
      expect(result).toBe('test-value')
      expect(mockStorage.getItem).toHaveBeenCalledWith('test-key')
    })

    it('should return null for non-existent items', () => {
      mockStorage.getItem.mockReturnValue(null)
      
      const result = storage.local.get('non-existent')
      expect(result).toBeNull()
    })

    it('should handle JSON parsing errors', () => {
      mockStorage.getItem.mockReturnValue('invalid-json')
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      const result = storage.local.get('test-key')
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should set item in localStorage', () => {
      const success = storage.local.set('test-key', 'test-value')
      
      expect(success).toBe(true)
      expect(mockStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('test-value'))
    })

    it('should handle storage errors when setting', () => {
      mockStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      const success = storage.local.set('test-key', 'test-value')
      
      expect(success).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should remove item from localStorage', () => {
      const success = storage.local.remove('test-key')
      
      expect(success).toBe(true)
      expect(mockStorage.removeItem).toHaveBeenCalledWith('test-key')
    })

    it('should clear localStorage', () => {
      const success = storage.local.clear()
      
      expect(success).toBe(true)
      expect(mockStorage.clear).toHaveBeenCalled()
    })

    it('should handle server-side rendering', () => {
      const originalWindow = global.window
      delete (global as any).window
      
      expect(storage.local.get('test-key')).toBeNull()
      expect(storage.local.set('test-key', 'value')).toBe(false)
      expect(storage.local.remove('test-key')).toBe(false)
      expect(storage.local.clear()).toBe(false)
      
      global.window = originalWindow
    })
  })

  describe('storage.session', () => {
    it('should work with sessionStorage', () => {
      mockStorage.getItem.mockReturnValue(JSON.stringify('session-value'))
      
      const result = storage.session.get('session-key')
      expect(result).toBe('session-value')
      expect(mockStorage.getItem).toHaveBeenCalledWith('session-key')
    })

    it('should set item in sessionStorage', () => {
      const success = storage.session.set('session-key', 'session-value')
      
      expect(success).toBe(true)
      expect(mockStorage.setItem).toHaveBeenCalledWith('session-key', JSON.stringify('session-value'))
    })
  })

  describe('storage.cookie', () => {
    it('should get cookie value', () => {
      mockDocument.cookie = 'test-key=test-value; other-key=other-value'
      
      const result = storage.cookie.get('test-key')
      expect(result).toBe('test-value')
    })

    it('should return null for non-existent cookie', () => {
      mockDocument.cookie = 'other-key=other-value'
      
      const result = storage.cookie.get('non-existent')
      expect(result).toBeNull()
    })

    it('should handle URL-encoded values', () => {
      mockDocument.cookie = 'test-key=Hello%20World'
      
      const result = storage.cookie.get('test-key')
      expect(result).toBe('Hello World')
    })

    it('should set cookie with default options', () => {
      const success = storage.cookie.set('test-key', 'test-value')
      
      expect(success).toBe(true)
      expect(mockDocument.cookie).toBe('test-key=test-value')
    })

    it('should set cookie with options', () => {
      const expires = new Date('2024-01-01')
      const success = storage.cookie.set('test-key', 'test-value', {
        expires,
        path: '/test',
        domain: '.example.com',
        secure: true,
        sameSite: 'strict'
      })
      
      expect(success).toBe(true)
      expect(mockDocument.cookie).toContain('test-key=test-value')
      expect(mockDocument.cookie).toContain('expires=')
      expect(mockDocument.cookie).toContain('path=/test')
      expect(mockDocument.cookie).toContain('domain=.example.com')
      expect(mockDocument.cookie).toContain('secure')
      expect(mockDocument.cookie).toContain('samesite=strict')
    })

    it('should remove cookie', () => {
      const success = storage.cookie.remove('test-key')
      
      expect(success).toBe(true)
      expect(mockDocument.cookie).toContain('test-key=')
      expect(mockDocument.cookie).toContain('expires=Thu, 01 Jan 1970 00:00:00 UTC')
    })

    it('should handle server-side rendering', () => {
      const originalDocument = global.document
      delete (global as any).document
      
      expect(storage.cookie.get('test-key')).toBeNull()
      expect(storage.cookie.set('test-key', 'value')).toBe(false)
      expect(storage.cookie.remove('test-key')).toBe(false)
      
      global.document = originalDocument
    })
  })

  describe('CachedStorage', () => {
    let cachedStorage: CachedStorage

    beforeEach(() => {
      cachedStorage = new CachedStorage('local', 'test_')
    })

    it('should store and retrieve cached data', () => {
      mockStorage.getItem.mockReturnValue(JSON.stringify({
        data: 'cached-value',
        timestamp: Date.now(),
        ttl: 60000
      }))

      const result = cachedStorage.get('test-key')
      expect(result).toBe('cached-value')
      expect(mockStorage.getItem).toHaveBeenCalledWith('test_test-key')
    })

    it('should return null for expired cache', () => {
      mockStorage.getItem.mockReturnValue(JSON.stringify({
        data: 'cached-value',
        timestamp: Date.now() - 120000, // 2 minutes ago
        ttl: 60000 // 1 minute TTL
      }))

      const result = cachedStorage.get('test-key')
      expect(result).toBeNull()
      expect(mockStorage.removeItem).toHaveBeenCalledWith('test_test-key')
    })

    it('should set cached data with TTL', () => {
      const success = cachedStorage.set('test-key', 'test-value', 30000)
      
      expect(success).toBe(true)
      expect(mockStorage.setItem).toHaveBeenCalledWith('test_test-key', expect.any(String))
      
      const cachedData = JSON.parse(mockStorage.setItem.mock.calls[0][1])
      expect(cachedData.data).toBe('test-value')
      expect(cachedData.ttl).toBe(30000)
      expect(cachedData.timestamp).toBeCloseTo(Date.now(), -2)
    })

    it('should use default TTL', () => {
      cachedStorage.set('test-key', 'test-value')
      
      const cachedData = JSON.parse(mockStorage.setItem.mock.calls[0][1])
      expect(cachedData.ttl).toBe(60 * 60 * 1000) // 1 hour default
    })

    it('should remove cached data', () => {
      const success = cachedStorage.remove('test-key')
      
      expect(success).toBe(true)
      expect(mockStorage.removeItem).toHaveBeenCalledWith('test_test-key')
    })

    it('should clear cache', () => {
      const success = cachedStorage.clear()
      
      expect(success).toBe(true)
      expect(mockStorage.clear).toHaveBeenCalled()
    })
  })

  describe('convenience exports', () => {
    it('should export storage instances', () => {
      expect(localStorage).toBe(storage.local)
      expect(sessionStorage).toBe(storage.session)
      expect(cookieStorage).toBe(storage.cookie)
    })

    it('should export storage keys', () => {
      expect(STORAGE_KEYS).toEqual({
        USER_SESSION: 'user_session',
        THEME_PREFERENCE: 'theme_preference',
        SETTINGS: 'user_settings',
        CACHE_PREFIX: 'cache_',
        FORM_DRAFT: 'form_draft_',
        LAST_ROUTE: 'last_route'
      })
    })
  })
})