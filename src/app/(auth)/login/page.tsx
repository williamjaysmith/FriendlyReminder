'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Debug: Check Supabase configuration
  console.log('🔧 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('🔑 Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
    
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    console.log('🚀 Google login button clicked')
    setLoading(true)
    setError(null)

    try {
      // Always use current origin to ensure correct environment redirect
      const siteUrl = window.location.origin
      const redirectUrl = `${siteUrl}/auth/callback?next=/dashboard`
      console.log('📍 Redirect URL:', redirectUrl)
      console.log('🌍 Window origin:', window.location.origin)
      console.log('🔧 NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      console.log('📊 OAuth response data:', data)
      
      if (error) {
        console.error('❌ OAuth error:', error)
        setError(error.message)
        setLoading(false)
      } else {
        console.log('✅ OAuth initiated successfully')
        if (data?.url) {
          console.log('🔀 Redirecting to:', data.url)
          // Try multiple redirect methods
          try {
            window.location.assign(data.url)
          } catch {
            console.log('📍 Assign failed, trying href')
            window.location.href = data.url
          }
          // Fallback: open in current window after a short delay
          setTimeout(() => {
            if (window.location.href.includes('localhost')) {
              console.log('🚀 Fallback redirect')
              window.open(data.url, '_self')
            }
          }, 1000)
        } else {
          console.error('❌ No OAuth URL returned')
          setError('OAuth URL not generated')
          setLoading(false)
        }
      }
    } catch (err) {
      console.error('💥 Unexpected error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your Friendly Reminder account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
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
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
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

          <div className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}