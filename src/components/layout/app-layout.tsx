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
      <header className="bg-[var(--surface)] shadow-sm border-b border-[var(--text-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard">
                <h1 className="text-xl font-semibold text-[var(--text-primary)] hover:text-[var(--brand-yellow)] transition-colors">
                  Friendly Reminder
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className={`font-medium transition-colors ${
                  isActive('/dashboard') 
                    ? 'text-[var(--brand-yellow)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/contacts" 
                className={`font-medium transition-colors ${
                  isActive('/contacts') || pathname.startsWith('/contacts')
                    ? 'text-[var(--brand-yellow)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Contacts
              </Link>
              <Link 
                href="/settings" 
                className={`font-medium transition-colors ${
                  isActive('/settings') 
                    ? 'text-[var(--brand-yellow)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Settings
              </Link>
              <ThemeToggle />
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </nav>

            {/* Mobile Navigation */}
            <div className="sm:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
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
          <div className="fixed top-0 right-0 h-full w-64 bg-[var(--surface)] shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[var(--text-primary)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Menu</h2>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
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
                  className={`block py-2 px-3 rounded-md font-medium transition-colors ${
                    isActive('/dashboard') 
                      ? 'bg-[var(--brand-yellow)]/20 text-[var(--brand-yellow)]' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--text-primary)]/10'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/contacts" 
                  onClick={closeMobileMenu}
                  className={`block py-2 px-3 rounded-md font-medium transition-colors ${
                    isActive('/contacts') || pathname.startsWith('/contacts')
                      ? 'bg-[var(--brand-yellow)]/20 text-[var(--brand-yellow)]' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--text-primary)]/10'
                  }`}
                >
                  Contacts
                </Link>
                <Link 
                  href="/settings" 
                  onClick={closeMobileMenu}
                  className={`block py-2 px-3 rounded-md font-medium transition-colors ${
                    isActive('/settings') 
                      ? 'bg-[var(--brand-yellow)]/20 text-[var(--brand-yellow)]' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--text-primary)]/10'
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