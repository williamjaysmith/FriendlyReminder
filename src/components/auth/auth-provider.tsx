'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Models } from 'appwrite'
import { account } from '@/lib/appwrite/client'
import { GuestService } from '@/lib/services/GuestService'

type AppUser = Models.User<Models.Preferences> & { is_guest?: boolean }

interface AuthContextType {
  user: AppUser | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  signOut: async () => {},
  refreshUser: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const getSession = async () => {
    try {
      console.log('🔍 AuthProvider: getSession started')
      
      // Check for guest mode first
      if (GuestService.isGuestMode()) {
        console.log('🎭 AuthProvider: Guest mode detected')
        GuestService.ensureGuestCookie() // Ensure cookie is set for middleware
        const guestUser = GuestService.getGuestUser()
        if (guestUser) {
          // Convert guest user to Models.User format
          const mockUser = {
            $id: guestUser.id,
            email: guestUser.email,
            name: guestUser.name || 'Guest User',
            passwordUpdate: '',
            phone: '',
            mfa: false,
            emailVerification: true,
            phoneVerification: false,
            prefs: {},
            registration: guestUser.created_at,
            status: true,
            labels: [],
            targets: [],
            accessedAt: new Date().toISOString(),
            $createdAt: guestUser.created_at,
            $updatedAt: guestUser.updated_at,
            is_guest: true
          } as AppUser
          
          console.log('🎭 Setting guest user:', mockUser)
          setUser(mockUser)
          return
        } else {
          console.log('🎭 Guest mode detected but no guest user found')
          setUser(null)
          return
        }
      }

      // First, check localStorage and set cookie immediately if session exists
      if (typeof window !== 'undefined') {
        const storedSession = localStorage.getItem('appwrite-session')
        if (storedSession) {
          console.log('🍪 Setting cookie from stored session')
          document.cookie = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}=${storedSession}; path=/; SameSite=Lax`
        }
      }
      
      console.log('🔍 AuthProvider: Getting Appwrite session...')
      try {
        const currentUser = await account.get()
        console.log('📊 AuthProvider: Session found:', {
          hasUser: !!currentUser,
          userId: currentUser?.$id,
          email: currentUser?.email
        })
        
        // Store session info for middleware
        if (currentUser && typeof window !== 'undefined') {
          try {
            const session = await account.getSession('current')
            console.log('💾 Storing session for middleware...')
            localStorage.setItem('appwrite-session', session.$id)
            // Set cookie for middleware detection
            document.cookie = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}=${session.$id}; path=/; SameSite=Lax`
          } catch (sessionError) {
            console.log('⚠️ Could not get session details:', sessionError)
          }
        }
        
        setUser(currentUser)
      } catch (error) {
        console.log('❌ AuthProvider: No active Appwrite session:', error)
        // Clear stored session data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('appwrite-session')
          document.cookie = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
        }
        setUser(null)
      }
    } catch (error) {
      console.error('🚨 AuthProvider: Fatal error in getSession:', error)
      setUser(null)
    } finally {
      console.log('✅ AuthProvider: getSession completed, setting loading to false')
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    if (isRefreshing) {
      console.log('🔄 AuthProvider: Already refreshing, skipping...')
      return
    }
    
    console.log('🔄 AuthProvider: refreshUser called')
    setIsRefreshing(true)
    try {
      await getSession()
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    console.log('🏁 AuthProvider: Initial useEffect called')
    getSession()
  }, [])

  const signOut = async () => {
    try {
      console.log('🚪 AuthProvider: Signing out...')
      
      // Handle guest mode logout
      if (GuestService.isGuestMode()) {
        GuestService.clearGuestData()
        setUser(null)
        console.log('✅ AuthProvider: Guest user signed out')
        return
      }
      
      // Regular Appwrite logout
      await account.deleteSession('current')
    } catch (error) {
      console.error('AuthProvider: Sign out error:', error)
    } finally {
      // Always clear local data and update state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('appwrite-session')
        document.cookie = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
      }
      setUser(null)
      console.log('✅ AuthProvider: User signed out')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}