'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/theme-toggle'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const isActive = (path: string) => pathname === path

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--brand-charcoal)] shadow-sm border-b border-[var(--brand-beige)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard">
                <div className="w-10 h-10 bg-[var(--brand-beige)] text-[var(--brand-charcoal)] rounded-full flex items-center justify-center text-lg font-bold hover:bg-[var(--brand-yellow)] transition-colors" style={{fontFamily: 'Leckerli One, cursive'}}>
                  FR
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center space-x-2 sm:space-x-4">
              <Link 
                href="/dashboard" 
                className={`transition-colors ${
                  isActive('/dashboard') 
                    ? 'font-bold text-sm sm:text-lg text-[var(--brand-purple)]' 
                    : 'font-medium text-sm sm:text-base text-[var(--brand-beige)] hover:text-[var(--brand-yellow)]'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/contacts" 
                className={`transition-colors ${
                  isActive('/contacts') || pathname.startsWith('/contacts')
                    ? 'font-bold text-sm sm:text-lg text-[var(--brand-purple)]' 
                    : 'font-medium text-sm sm:text-base text-[var(--brand-beige)] hover:text-[var(--brand-yellow)]'
                }`}
              >
                Contacts
              </Link>
              <Link 
                href="/settings" 
                className={`transition-colors ${
                  isActive('/settings') 
                    ? 'font-bold text-sm sm:text-lg text-[var(--brand-purple)]' 
                    : 'font-medium text-sm sm:text-base text-[var(--brand-beige)] hover:text-[var(--brand-yellow)]'
                }`}
              >
                Settings
              </Link>
              <ThemeToggle />
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="border-[var(--brand-beige)] text-[var(--brand-beige)] hover:bg-[var(--brand-beige)] hover:text-[var(--brand-charcoal)]"
              >
                Sign Out
              </Button>
            </nav>

            {/* Mobile Navigation */}
            <div className="sm:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="border-[var(--brand-beige)] text-[var(--brand-beige)] hover:bg-[var(--brand-beige)] hover:text-[var(--brand-charcoal)]"
              >
                Sign Out
              </Button>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-md text-[var(--brand-beige)] hover:text-[var(--brand-yellow)] hover:bg-[var(--brand-beige)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
                aria-label="Open menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Modal */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[var(--background)] bg-opacity-75" 
            onClick={closeMobileMenu}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-64 bg-[var(--brand-charcoal)] shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[var(--brand-beige)]">
              <div className="w-8 h-8 bg-[var(--brand-beige)] text-[var(--brand-charcoal)] rounded-full flex items-center justify-center text-sm font-bold" style={{fontFamily: 'Leckerli One, cursive'}}>
                FR
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-md text-[var(--brand-beige)] hover:text-[var(--brand-yellow)] hover:bg-[var(--brand-beige)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
                aria-label="Close menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="p-4">
              <div className="space-y-4">
                <Link 
                  href="/dashboard" 
                  onClick={closeMobileMenu}
                  className={`block py-2 px-3 rounded-md transition-colors ${
                    isActive('/dashboard') 
                      ? 'bg-[var(--brand-purple)]/20 text-[var(--brand-purple)] font-bold text-lg' 
                      : 'text-[var(--brand-beige)] hover:bg-[var(--brand-beige)]/10 font-medium'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/contacts" 
                  onClick={closeMobileMenu}
                  className={`block py-2 px-3 rounded-md transition-colors ${
                    isActive('/contacts') || pathname.startsWith('/contacts')
                      ? 'bg-[var(--brand-purple)]/20 text-[var(--brand-purple)] font-bold text-lg' 
                      : 'text-[var(--brand-beige)] hover:bg-[var(--brand-beige)]/10 font-medium'
                  }`}
                >
                  Contacts
                </Link>
                <Link 
                  href="/settings" 
                  onClick={closeMobileMenu}
                  className={`block py-2 px-3 rounded-md transition-colors ${
                    isActive('/settings') 
                      ? 'bg-[var(--brand-purple)]/20 text-[var(--brand-purple)] font-bold text-lg' 
                      : 'text-[var(--brand-beige)] hover:bg-[var(--brand-beige)]/10 font-medium'
                  }`}
                >
                  Settings
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      {children}
    </div>
  )
}