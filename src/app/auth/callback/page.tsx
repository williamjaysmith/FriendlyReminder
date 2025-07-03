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
      const userId = searchParams.get('userId')
      const secret = searchParams.get('secret')
      
      // Fast-track: If we have OAuth params, redirect immediately with minimal processing
      if (userId && secret) {
        try {
          await account.createSession(userId, secret)
          const next = searchParams.get('next') || '/dashboard'
          window.location.href = next
          return
        } catch (error: any) {
          console.error('Session creation error:', error)
        }
      }
      
      // Fallback: redirect to login with error
      router.push('/login?error=' + encodeURIComponent('Authentication failed'))
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-main)'}}>
      <div className="text-center">
        <LoadingSpinner showText={true} text="Redirecting..." />
      </div>
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