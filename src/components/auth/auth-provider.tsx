'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Models } from 'appwrite'
import { account } from '@/lib/appwrite/client'

interface AuthContextType {
  user: Models.User<Models.Preferences> | null
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
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [loading, setLoading] = useState(true)

  const getSession = async () => {
    // First, check localStorage and set cookie immediately if session exists
    if (typeof window !== 'undefined') {
      const storedSession = localStorage.getItem('appwrite-session')
      if (storedSession) {
        console.log('🍪 Setting cookie from stored session')
        document.cookie = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}=${storedSession}; path=/; SameSite=Lax`
      }
    }
    
    console.log('🔍 AuthProvider: Getting session...')
    try {
      const currentUser = await account.get()
      console.log('📊 AuthProvider: Session:', {
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
      console.log('❌ AuthProvider: No active session:', error)
      // Clear stored session data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('appwrite-session')
        document.cookie = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
      }
      setUser(null)
    }
    setLoading(false)
  }

  const refreshUser = async () => {
    await getSession()
  }

  useEffect(() => {
    getSession()
  }, [])

  const signOut = async () => {
    try {
      console.log('🚪 AuthProvider: Signing out...')
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