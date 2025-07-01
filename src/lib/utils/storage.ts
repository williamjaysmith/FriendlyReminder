// Storage utility functions
import { StorageKey, StorageValue } from '../types/utilities'

export const storage = {
  // Local storage utilities
  local: {
    get: <T = StorageValue>(key: StorageKey): T | null => {
      if (typeof window === 'undefined') return null
      
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch (error) {
        console.warn(`Failed to get localStorage item ${key}:`, error)
        return null
      }
    },

    set: (key: StorageKey, value: StorageValue): boolean => {
      if (typeof window === 'undefined') return false
      
      try {
        localStorage.setItem(key, JSON.stringify(value))
        return true
      } catch (error) {
        console.warn(`Failed to set localStorage item ${key}:`, error)
        return false
      }
    },

    remove: (key: StorageKey): boolean => {
      if (typeof window === 'undefined') return false
      
      try {
        localStorage.removeItem(key)
        return true
      } catch (error) {
        console.warn(`Failed to remove localStorage item ${key}:`, error)
        return false
      }
    },

    clear: (): boolean => {
      if (typeof window === 'undefined') return false
      
      try {
        localStorage.clear()
        return true
      } catch (error) {
        console.warn('Failed to clear localStorage:', error)
        return false
      }
    }
  },

  // Session storage utilities
  session: {
    get: <T = StorageValue>(key: StorageKey): T | null => {
      if (typeof window === 'undefined') return null
      
      try {
        const item = sessionStorage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch (error) {
        console.warn(`Failed to get sessionStorage item ${key}:`, error)
        return null
      }
    },

    set: (key: StorageKey, value: StorageValue): boolean => {
      if (typeof window === 'undefined') return false
      
      try {
        sessionStorage.setItem(key, JSON.stringify(value))
        return true
      } catch (error) {
        console.warn(`Failed to set sessionStorage item ${key}:`, error)
        return false
      }
    },

    remove: (key: StorageKey): boolean => {
      if (typeof window === 'undefined') return false
      
      try {
        sessionStorage.removeItem(key)
        return true
      } catch (error) {
        console.warn(`Failed to remove sessionStorage item ${key}:`, error)
        return false
      }
    },

    clear: (): boolean => {
      if (typeof window === 'undefined') return false
      
      try {
        sessionStorage.clear()
        return true
      } catch (error) {
        console.warn('Failed to clear sessionStorage:', error)
        return false
      }
    }
  },

  // Cookie utilities
  cookie: {
    get: (key: StorageKey): string | null => {
      if (typeof document === 'undefined') return null
      
      const cookies = document.cookie.split(';')
      for (let cookie of cookies) {
        const [name, value] = cookie.split('=').map(c => c.trim())
        if (name === key) {
          return decodeURIComponent(value)
        }
      }
      return null
    },

    set: (
      key: StorageKey,
      value: string,
      options: {
        expires?: Date | number
        path?: string
        domain?: string
        secure?: boolean
        sameSite?: 'strict' | 'lax' | 'none'
      } = {}
    ): boolean => {
      if (typeof document === 'undefined') return false
      
      try {
        let cookieString = `${key}=${encodeURIComponent(value)}`
        
        if (options.expires) {
          const expireDate = typeof options.expires === 'number' 
            ? new Date(Date.now() + options.expires * 24 * 60 * 60 * 1000)
            : options.expires
          cookieString += `; expires=${expireDate.toUTCString()}`
        }
        
        if (options.path) cookieString += `; path=${options.path}`
        if (options.domain) cookieString += `; domain=${options.domain}`
        if (options.secure) cookieString += `; secure`
        if (options.sameSite) cookieString += `; samesite=${options.sameSite}`
        
        document.cookie = cookieString
        return true
      } catch (error) {
        console.warn(`Failed to set cookie ${key}:`, error)
        return false
      }
    },

    remove: (key: StorageKey, path?: string): boolean => {
      if (typeof document === 'undefined') return false
      
      try {
        let cookieString = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`
        if (path) cookieString += `; path=${path}`
        document.cookie = cookieString
        return true
      } catch (error) {
        console.warn(`Failed to remove cookie ${key}:`, error)
        return false
      }
    }
  }
}

// Cached storage with TTL
export class CachedStorage {
  private storage: typeof storage.local | typeof storage.session
  private prefix: string

  constructor(
    type: 'local' | 'session' = 'local',
    prefix = 'cached_'
  ) {
    this.storage = type === 'local' ? storage.local : storage.session
    this.prefix = prefix
  }

  get<T = StorageValue>(key: StorageKey): T | null {
    const cacheKey = `${this.prefix}${key}`
    const cached = this.storage.get<{
      data: T
      timestamp: number
      ttl: number
    }>(cacheKey)

    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
      this.storage.remove(cacheKey)
      return null
    }

    return cached.data
  }

  set<T = StorageValue>(
    key: StorageKey,
    value: T,
    ttl: number = 60 * 60 * 1000 // 1 hour default
  ): boolean {
    const cacheKey = `${this.prefix}${key}`
    return this.storage.set(cacheKey, {
      data: value,
      timestamp: Date.now(),
      ttl
    })
  }

  remove(key: StorageKey): boolean {
    const cacheKey = `${this.prefix}${key}`
    return this.storage.remove(cacheKey)
  }

  clear(): boolean {
    // Note: This clears all storage, not just cached items
    return this.storage.clear()
  }
}

// Commonly used storage instances
export const localStorage = storage.local
export const sessionStorage = storage.session
export const cookieStorage = storage.cookie

// Common storage keys
export const STORAGE_KEYS = {
  USER_SESSION: 'user_session',
  THEME_PREFERENCE: 'theme_preference',
  SETTINGS: 'user_settings',
  CACHE_PREFIX: 'cache_',
  FORM_DRAFT: 'form_draft_',
  LAST_ROUTE: 'last_route'
} as const