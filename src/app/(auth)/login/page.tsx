'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { account } from '@/lib/appwrite/client'
import { OAuthProvider } from 'appwrite'
import { useAuth } from '@/components/auth/auth-provider'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AuthService } from '@/lib/services/AuthService'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, loading: authLoading, refreshUser } = useAuth()


  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      console.log('🔄 Login page: User detected, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await account.createEmailPasswordSession(email, password)
      await refreshUser()
      
      router.push('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const siteUrl = window.location.origin
      const successUrl = `${siteUrl}/auth/callback?next=/dashboard`
      const failureUrl = `${siteUrl}/login`
      
      // Use createOAuth2Token for Safari compatibility (works for all browsers)
      await account.createOAuth2Token(
        OAuthProvider.Google,
        successUrl,
        failureUrl
      )
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🎭 Starting guest login...')
      await AuthService.guestLogin()
      console.log('🎭 Guest login successful, refreshing user...')
      await refreshUser() // Refresh the auth provider to pick up guest user
      console.log('🎭 User refreshed, navigating to dashboard...')
      // Don't use router.push here since the useEffect will handle the redirect
    } catch (error: unknown) {
      console.error('🎭 Guest login error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }


  // Show loading while checking authentication or if already logged in
  if (authLoading || user) {
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
                onChange={setEmail}
                required
                disabled={loading}
              />
            </div>
            <div>
              <PasswordInput
                placeholder="Password"
                value={password}
                onChange={setPassword}
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

          <div className="space-y-4">
            <div className="w-full border-t border-[var(--text-primary)]/20" />
            <div className="flex justify-center text-sm">
              <span className="text-[var(--text-secondary)]">Or continue with</span>
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
            
            <Button 
              type="button" 
              variant="ghost"
              className="w-full text-[var(--brand-purple)]"
              onClick={handleGuestLogin}
              disabled={loading}
            >
              Try as Guest
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