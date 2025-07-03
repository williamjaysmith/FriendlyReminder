/**
 * @jest-environment node
 */
import { storage, CachedStorage, localStorage, sessionStorage, cookieStorage, STORAGE_KEYS } from '../storage'

// Create proper storage mock that implements Storage interface
const createMockStorage = (): Storage => {
  const store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
      return undefined // setItem returns undefined on success
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
      return undefined
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
      return undefined
    }),
    length: 0,
    key: jest.fn()
  }
}

// Mock storage
const mockLocalStorage = createMockStorage()
const mockSessionStorage = createMockStorage()

// Mock global objects for node environment
const mockCookie = { value: '' }

global.window = {
  localStorage: mockLocalStorage,
  sessionStorage: mockSessionStorage
} as any

// Ensure typeof window !== 'undefined' check passes  
Object.defineProperty(global, 'window', {
  value: global.window,
  writable: true,
  configurable: true
})

global.document = {
  get cookie() { return mockCookie.value },
  set cookie(value: string) { mockCookie.value = value }
} as any

describe('storage utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCookie.value = ''
    mockLocalStorage.clear()
    mockSessionStorage.clear()
  })

  describe('storage.local', () => {
    it('should get item from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('test-value'))
      
      const result = storage.local.get('test-key')
      expect(result).toBe('test-value')
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key')
    })

    it('should return null for non-existent items', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const result = storage.local.get('non-existent')
      expect(result).toBeNull()
    })

    it('should handle JSON parsing errors', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json')
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      const result = storage.local.get('test-key')
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should set item in localStorage', () => {
      const success = storage.local.set('test-key', 'test-value')
      
      expect(success).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('test-value'))
    })

    it('should handle storage errors when setting', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
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
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key')
    })

    it('should clear localStorage', () => {
      const success = storage.local.clear()
      
      expect(success).toBe(true)
      expect(mockLocalStorage.clear).toHaveBeenCalled()
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
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify('session-value'))
      
      const result = storage.session.get('session-key')
      expect(result).toBe('session-value')
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('session-key')
    })

    it('should set item in sessionStorage', () => {
      const success = storage.session.set('session-key', 'session-value')
      
      expect(success).toBe(true)
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('session-key', JSON.stringify('session-value'))
    })
  })

  describe('storage.cookie', () => {
    it('should get cookie value', () => {
      mockCookie.value = 'test-key=test-value; other-key=other-value'
      
      const result = storage.cookie.get('test-key')
      expect(result).toBe('test-value')
    })

    it('should return null for non-existent cookie', () => {
      mockCookie.value = 'other-key=other-value'
      
      const result = storage.cookie.get('non-existent')
      expect(result).toBeNull()
    })

    it('should handle URL-encoded values', () => {
      mockCookie.value = 'test-key=Hello%20World'
      
      const result = storage.cookie.get('test-key')
      expect(result).toBe('Hello World')
    })

    it('should set cookie with default options', () => {
      const success = storage.cookie.set('test-key', 'test-value')
      
      expect(success).toBe(true)
      expect(mockCookie.value).toBe('test-key=test-value')
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
      expect(mockCookie.value).toContain('test-key=test-value')
      expect(mockCookie.value).toContain('expires=')
      expect(mockCookie.value).toContain('path=/test')
      expect(mockCookie.value).toContain('domain=.example.com')
      expect(mockCookie.value).toContain('secure')
      expect(mockCookie.value).toContain('samesite=strict')
    })

    it('should remove cookie', () => {
      const success = storage.cookie.remove('test-key')
      
      expect(success).toBe(true)
      expect(mockCookie.value).toContain('test-key=')
      expect(mockCookie.value).toContain('expires=Thu, 01 Jan 1970 00:00:00 UTC')
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
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        data: 'cached-value',
        timestamp: Date.now(),
        ttl: 60000
      }))

      const result = cachedStorage.get('test-key')
      expect(result).toBe('cached-value')
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test_test-key')
    })

    it('should return null for expired cache', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        data: 'cached-value',
        timestamp: Date.now() - 120000, // 2 minutes ago
        ttl: 60000 // 1 minute TTL
      }))

      const result = cachedStorage.get('test-key')
      expect(result).toBeNull()
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test_test-key')
    })

    it('should set cached data with TTL', () => {
      cachedStorage.set('test-key', 'test-value', 30000)
      
      // Should attempt to call localStorage.setItem regardless of return value  
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test_test-key', expect.any(String))
      
      // Verify the cached data structure
      const setItemCalls = (mockLocalStorage.setItem as jest.Mock).mock.calls
      if (setItemCalls.length > 0) {
        const cachedData = JSON.parse(setItemCalls[0][1])
        expect(cachedData.data).toBe('test-value')
        expect(cachedData.ttl).toBe(30000)
        expect(cachedData.timestamp).toBeCloseTo(Date.now(), -2)
      }
    })

    it('should use default TTL', () => {
      cachedStorage.set('test-key', 'test-value')
      
      const cachedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(cachedData.ttl).toBe(60 * 60 * 1000) // 1 hour default
    })

    it('should remove cached data', () => {
      const success = cachedStorage.remove('test-key')
      
      expect(success).toBe(true)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test_test-key')
    })

    it('should clear cache', () => {
      const success = cachedStorage.clear()
      
      expect(success).toBe(true)
      expect(mockLocalStorage.clear).toHaveBeenCalled()
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