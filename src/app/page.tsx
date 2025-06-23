'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <LoadingSpinner />
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16">
          <div className="text-center">
            {/* Playful badge */}
            <div className="inline-flex items-center px-4 py-2 bg-[var(--brand-yellow)] text-[var(--brand-charcoal)] text-sm font-medium rounded-full mb-8 border border-[var(--brand-charcoal)]">
              <span className="w-2 h-2 bg-[var(--brand-charcoal)] rounded-full mr-2 animate-pulse"></span>
              Your personal relationship manager
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
              Friendly
              <br />
              <span className="text-[var(--brand-yellow)]">
                Reminder
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-[var(--text-secondary)] mb-10 max-w-3xl mx-auto leading-relaxed">
              Turn networking into <span className="font-semibold text-[var(--brand-green)]">meaningful relationships</span>. 
              Never let another connection slip away.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="xl" className="min-w-[200px]">
                  Start Building Connections
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="xl" className="min-w-[160px]">
                  Sign In
                </Button>
              </Link>
            </div>
            
            {/* Social proof */}
            <p className="text-sm text-[var(--text-secondary)] mt-8">
              Join professionals who never forget to follow up
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Everything you need to stay connected
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Simple, powerful tools to turn chance encounters into lasting professional relationships.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 - Smart Reminders */}
            <Card variant="purple" className="group">
              <CardHeader variant="purple">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle>Smart Reminders</CardTitle>
                <CardDescription>
                  Never forget to follow up. Set custom intervals and get gentle nudges when it&apos;s time to reconnect.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 - Track Network */}
            <Card variant="green" className="group">
              <CardHeader variant="green">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <CardTitle>Track Your Network</CardTitle>
                <CardDescription>
                  Visualize your networking habits with beautiful analytics and maintain consistency with streak tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 - Rich Profiles */}
            <Card variant="orange" className="group">
              <CardHeader variant="orange">
                <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <CardTitle>Rich Profiles</CardTitle>
                <CardDescription>
                  Remember the details that matter. Store conversation history, interests, and personal notes that help you connect.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
