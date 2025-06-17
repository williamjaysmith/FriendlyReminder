'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('🔄 Auth callback page loaded')
      console.log('🔗 Current URL:', window.location.href)
      console.log('📝 Search params:', Object.fromEntries(searchParams.entries()))

      try {
        console.log('🎯 Getting session from Supabase...')
        const { data, error } = await supabase.auth.getSession()
        
        console.log('📊 Session data:', data)
        console.log('❓ Session error:', error)
        
        if (error) {
          console.error('❌ Auth callback error:', error)
          router.push('/login?error=' + encodeURIComponent(error.message))
          return
        }

        if (data.session) {
          console.log('✅ Session found! User:', data.session.user.email)
          // Get the intended redirect destination
          const next = searchParams.get('next') || '/dashboard'
          console.log('🚀 Redirecting to:', next)
          router.push(next)
        } else {
          console.log('❌ No session found')
          // No session found, redirect to login
          router.push('/login?error=' + encodeURIComponent('Authentication failed'))
        }
      } catch (error) {
        console.error('💥 Unexpected callback error:', error)
        router.push('/login?error=' + encodeURIComponent('Authentication failed'))
      }
    }

    handleAuthCallback()
  }, [router, searchParams, supabase.auth])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}