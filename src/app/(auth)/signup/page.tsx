'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { account, ID } from '@/lib/appwrite/client'
import { OAuthProvider } from 'appwrite'
import { useAuth } from '@/components/auth/auth-provider'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      console.log('🔄 User already logged in, redirecting to dashboard...')
      router.push('/dashboard')
    }
  }, [user, authLoading, router])
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      // Validate inputs before attempting signup
      console.log('📝 Signup attempt with:', { 
        email, 
        username, 
        passwordLength: password.length,
        hasEmail: !!email,
        hasUsername: !!username,
        hasPassword: !!password
      })

      if (!email || !password || !username) {
        setError('Please fill in all fields')
        setLoading(false)
        return
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters long')
        setLoading(false)
        return
      }

      // Clear any existing session first to avoid conflicts during account creation
      try {
        await account.deleteSession('current')
        console.log('🧹 Cleared existing session before signup')
      } catch {
        // Ignore if no session exists
      }
      
      // Clear stored session data
      localStorage.removeItem('appwrite-session')
      document.cookie = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
      
      const userId = ID.unique()
      console.log('🆔 Generated user ID:', userId)
      
      await account.create(userId, email, password, username)
      console.log('✅ Account created successfully')
      setMessage('Account created successfully! You can now sign in.')
    } catch (error: unknown) {
      console.error('❌ Detailed signup error:', error)
      
      if (error instanceof Error) {
        // Try to extract more specific error information
        const errorMessage = error.message
        console.log('📝 Error message:', errorMessage)
        
        if (errorMessage.includes('email')) {
          setError('Email is invalid or already in use')
        } else if (errorMessage.includes('password')) {
          setError('Password does not meet requirements (minimum 8 characters)')
        } else if (errorMessage.includes('user')) {
          setError('Username is invalid or already taken')
        } else {
          setError(`Signup failed: ${errorMessage}`)
        }
      } else {
        setError('An unexpected error occurred during signup')
      }
    }
    
    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError(null)

    try {
      // Use current origin for redirect URLs
      const siteUrl = window.location.origin
      const successUrl = `${siteUrl}/auth/callback?next=/dashboard`
      const failureUrl = `${siteUrl}/signup`
      
      console.log('📍 Success URL:', successUrl)
      console.log('📍 Failure URL:', failureUrl)

      // Use proper Appwrite SDK OAuth method
      await account.createOAuth2Session(
        OAuthProvider.Google,
        successUrl,
        failureUrl
      )
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setLoading(false)
    }
  }


  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
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
          <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
          <CardDescription>Get started with Friendly Reminder</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-[var(--brand-red)]/20 border border-[var(--brand-red)] text-[var(--brand-red)] px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-[var(--brand-green)]/20 border border-[var(--brand-green)] text-[var(--brand-green)] px-4 py-3 rounded-md text-sm">
              {message}
            </div>
          )}
          
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={setUsername}
                required
                disabled={loading}
                className="bg-[#fefaf0]"
              />
            </div>
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
                className="bg-[#fefaf0]"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
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
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              Continue with Google
            </Button>
          </div>

          <div className="text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--brand-blue)] hover:text-[var(--brand-blue)]/80">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}