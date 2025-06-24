'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { account } from '@/lib/appwrite/client'
import { OAuthProvider } from 'appwrite'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, loading: authLoading, refreshUser } = useAuth()

  // Debug: Check Appwrite configuration
  console.log('🔧 Appwrite Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  console.log('🔑 Appwrite Project ID exists:', !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      console.log('🔄 User already logged in, redirecting to dashboard...')
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Clear any existing session first to avoid conflicts
      try {
        await account.deleteSession('current')
        console.log('🧹 Cleared existing session before email login')
      } catch {
        // Ignore if no session exists
      }
      
      // Clear stored session data
      localStorage.removeItem('appwrite-session')
      document.cookie = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
      
      const session = await account.createEmailPasswordSession(email, password)
      console.log('✅ Email login session created:', session)
      
      // Store session for middleware
      localStorage.setItem('appwrite-session', session.$id)
      document.cookie = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}=${session.$id}; path=/; SameSite=Lax`
      
      // Refresh auth state to pick up the new user
      await refreshUser()
      
      router.push('/dashboard')
    } catch (error: unknown) {
      console.error('❌ Email login error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    console.log('🚀 Google login button clicked')
    setLoading(true)
    setError(null)

    try {
      // Use current origin for redirect URLs
      const siteUrl = window.location.origin
      const successUrl = `${siteUrl}/auth/callback?next=/dashboard`
      const failureUrl = `${siteUrl}/login`
      
      console.log('📍 Success URL:', successUrl)
      console.log('📍 Failure URL:', failureUrl)

      // Use proper Appwrite SDK OAuth method
      await account.createOAuth2Session(
        OAuthProvider.Google,
        successUrl,
        failureUrl
      )
    } catch (error: unknown) {
      console.error('❌ OAuth error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }


  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <Card 
        className="w-full max-w-md"
      >
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your Friendly Reminder account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-[var(--brand-red)]/20 border border-[var(--brand-red)] text-[var(--brand-red)] px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <PasswordInput
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--text-primary)]/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[var(--surface)] px-2 text-[var(--text-secondary)]">Or continue with</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              Continue with Google
            </Button>
          </div>

          <div className="text-center text-sm text-[var(--text-secondary)]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[var(--brand-blue)] hover:text-[var(--brand-blue)]/80">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}