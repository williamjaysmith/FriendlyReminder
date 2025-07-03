'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/auth/auth-provider'
import Button from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

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
      <div className="min-h-screen flex items-center justify-center bg-[#231f20]">
        <LoadingSpinner />
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-[#231f20]">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16">
          <div className="text-center">
            {/* Playful badge */}
            <div className="inline-flex items-center px-4 py-2 bg-brand-yellow text-brand-charcoal text-sm font-medium rounded-full mb-8 border border-brand-charcoal">
              <span className="w-2 h-2 bg-brand-charcoal rounded-full mr-2 animate-pulse"></span>
            </div>
            
            <div className="mb-6 flex justify-center">
              <Image
                src="/FriendlyReminderLogo2.png"
                alt="Friendly Reminder"
                width={400}
                height={200}
                className="max-w-full h-auto"
                priority
              />
            </div>
            
            <p className="text-xl sm:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed text-[#f9f4da]">
              Never let another connection slip away.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button variant="secondary" size="lg" className="min-w-[200px]">
                  Start Building Connections
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="min-w-[160px] border-[#f9f4da] text-[#f9f4da] hover:bg-[#f9f4da] hover:text-[#231f20]">
                  Sign In
                </Button>
              </Link>
            </div>
            
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#f9f4da]">
              Everything you need to stay connected
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-[#f9f4da]">
              Simple, powerful tools to turn chance encounters into lasting professional relationships.
            </p>
          </div>
          
          {/* Scrolling Cards Container */}
          <div className="relative overflow-hidden pb-4">
            <div className="flex animate-scroll gap-8">
              {/* First set of cards */}
              <div className="flex gap-8 min-w-max">
                {/* Feature 1 - Smart Reminders */}
                <Card className="group bg-[#f9f4da] border border-[#231f20] w-80 flex-shrink-0" style={{boxShadow: "8px 8px 0px #7b5ea7"}}>
                  <CardHeader>
                    <div className="w-14 h-14 bg-[#7b5ea7] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
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
                <Card className="group bg-[#f9f4da] border border-[#231f20] w-80 flex-shrink-0" style={{boxShadow: "8px 8px 0px #0ba95b"}}>
                  <CardHeader>
                    <div className="w-14 h-14 bg-[#0ba95b] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
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
                <Card className="group bg-[#f9f4da] border border-[#231f20] w-80 flex-shrink-0" style={{boxShadow: "8px 8px 0px #f38ba3"}}>
                  <CardHeader>
                    <div className="w-14 h-14 bg-[#f38ba3] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
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

              {/* Duplicate set for seamless loop */}
              <div className="flex gap-8 min-w-max">
                {/* Feature 1 - Smart Reminders */}
                <Card className="group bg-[#f9f4da] border border-[#231f20] w-80 flex-shrink-0" style={{boxShadow: "8px 8px 0px #7b5ea7"}}>
                  <CardHeader>
                    <div className="w-14 h-14 bg-[#7b5ea7] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">  
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
                <Card className="group bg-[#f9f4da] border border-[#231f20] w-80 flex-shrink-0" style={{boxShadow: "8px 8px 0px #0ba95b"}}>
                  <CardHeader>
                    <div className="w-14 h-14 bg-[#0ba95b] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
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
                <Card className="group bg-[#f9f4da] border border-[#231f20] w-80 flex-shrink-0" style={{boxShadow: "8px 8px 0px #f38ba3"}}>
                  <CardHeader>
                    <div className="w-14 h-14 bg-[#f38ba3] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
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
      </div>
    </div>
  )
}
