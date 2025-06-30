'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { account } from '@/lib/appwrite/client'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('🔄 Auth callback page loaded')
      console.log('🔗 Current URL:', window.location.href)
      console.log('📝 Search params:', Object.fromEntries(searchParams.entries()))

      // Check if we have OAuth parameters
      const userId = searchParams.get('userId')
      const secret = searchParams.get('secret')
      
      console.log('🔑 OAuth params:', { userId, secret: secret ? '***' : null })

      try {
        // If we have OAuth session parameters, create the session
        if (userId && secret) {
          console.log('🔐 Creating OAuth session...')
          await account.createSession(userId, secret)
          console.log('✅ OAuth session created successfully')
        }

        // Now get the user
        console.log('🎯 Getting user session...')
        const user = await account.get()
        
        console.log('📊 User data:', user)
        
        if (user) {
          console.log('✅ User authenticated! Email:', user.email)
          
          // Store session for middleware after OAuth
          try {
            const session = await account.getSession('current')
            console.log('💾 OAuth: Storing session for middleware...')
            localStorage.setItem('appwrite-session', session.$id)
            document.cookie = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}=${session.$id}; path=/; SameSite=Lax`
          } catch (sessionError) {
            console.log('⚠️ OAuth: Could not get session details:', sessionError)
          }
          
          // Get the intended redirect destination
          const next = searchParams.get('next') || '/dashboard'
          console.log('🚀 Redirecting to:', next)
          router.push(next)
        } else {
          console.log('❌ No user found')
          router.push('/login?error=' + encodeURIComponent('Authentication failed'))
        }
      } catch (error) {
        console.error('💥 Unexpected callback error:', error)
        router.push('/login?error=' + encodeURIComponent('Authentication failed'))
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-main)'}}>
      <LoadingSpinner showText={true} text="Completing sign in..." />
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-main)'}}>
        <LoadingSpinner showText={true} text="Loading..." />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}