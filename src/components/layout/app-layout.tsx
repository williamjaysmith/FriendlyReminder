"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isActive = (path: string) => pathname === path;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#231f20]">
      {/* Header */}
      <header className="bg-[#231f20] shadow-sm border-b border-[#4a453f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center relative">
              <div 
                className="w-48 h-48 opacity-80 absolute top-[-4.5rem] left-[-0.625rem] z-10 cursor-pointer" 
                style={{transformStyle: 'preserve-3d', transition: 'transform 0.25s ease-out'}}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  if (!el.dataset.spinning) el.style.transform = 'rotate(3deg)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  if (!el.dataset.spinning) el.style.transform = '';
                }} 
                onClick={(e) => {
                  e.stopPropagation();
                  const element = e.currentTarget;
                  
                  // Prevent double clicks
                  if (element.dataset.spinning) return;
                  element.dataset.spinning = 'true';
                  
                  // Start from current position and spin 360 degrees
                  element.style.transform = 'rotateY(0deg)';
                  element.style.transition = 'none';
                  
                  // Force reflow
                  element.offsetHeight;
                  
                  // Now animate to 360 degrees
                  element.style.transform = 'rotateY(360deg)';
                  element.style.transition = 'transform 0.5s ease-out';
                  
                  setTimeout(() => {
                    // Snap to 0 degrees without animation
                    element.style.transform = 'rotateY(0deg)';
                    element.style.transition = 'none';
                    
                    // Then clear everything after a tiny delay
                    setTimeout(() => {
                      element.style.transform = '';
                      element.style.transition = 'transform 0.25s ease-out';
                      delete element.dataset.spinning;
                    }, 10);
                    
                    console.log('Navigating to dashboard...');
                    router.push('/dashboard');
                  }, 500);
                }}
              >
                <Image
                  src="/FriendlyReminderLogo2.png"
                  alt="Friendly Reminder"
                  width={160}
                  height={160}
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Keep FR fallback for reference */}
              {/* <div
                className="w-10 h-10 bg-[#7b5ea7] text-[#231f20] rounded-full flex items-center justify-center text-2xl font-bold hover:bg-[#fcba28] transition-colors"
              >
                FR
              </div> */}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/dashboard"
                className={`transition-colors ${
                  isActive("/dashboard")
                    ? "font-bold text-sm sm:text-lg text-[#7b5ea7]"
                    : "font-medium text-sm sm:text-base text-[#f9f4da] hover:text-[#fcba28]"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/contacts"
                className={`transition-colors ${
                  isActive("/contacts") || pathname.startsWith("/contacts")
                    ? "font-bold text-sm sm:text-lg text-[#7b5ea7]"
                    : "font-medium text-sm sm:text-base text-[#f9f4da] hover:text-[#fcba28]"
                }`}
              >
                Contacts
              </Link>
              <Link
                href="/settings"
                className={`transition-colors ${
                  isActive("/settings")
                    ? "font-bold text-sm sm:text-lg text-[#7b5ea7]"
                    : "font-medium text-sm sm:text-base text-[#f9f4da] hover:text-[#fcba28]"
                }`}
              >
                Settings
              </Link>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="border-[#f9f4da] text-[#f9f4da] hover:bg-[#f9f4da] hover:text-[#231f20]"
              >
                Sign Out
              </Button>
            </nav>

            {/* Mobile Navigation */}
            <div className="sm:hidden flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-[#f9f4da] text-[#f9f4da] hover:bg-[#f9f4da] hover:text-[#231f20]"
              >
                Sign Out
              </Button>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-md text-[#f9f4da] hover:text-[#fcba28] hover:bg-[#f9f4da]/10 focus:outline-none focus:ring-2 focus:ring-[#fcba28]"
                aria-label="Open menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
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
            className="fixed inset-0 bg-[#231f20] bg-opacity-75"
            onClick={closeMobileMenu}
          />

          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-64 bg-[#231f20] shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[#4a453f]">
              <div 
                className="w-16 h-16 opacity-80 cursor-pointer" 
                style={{transformStyle: 'preserve-3d', transition: 'transform 0.25s ease-out', transform: 'rotate(-10deg)'}}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  if (!el.dataset.spinning) el.style.transform = 'rotate(10deg)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  if (!el.dataset.spinning) el.style.transform = 'rotate(-10deg)';
                }} 
                onClick={(e) => {
                  e.stopPropagation();
                  const element = e.currentTarget;
                  
                  // Prevent double clicks
                  if (element.dataset.spinning) return;
                  element.dataset.spinning = 'true';
                  
                  // Start from current position and spin 360 degrees
                  element.style.transform = 'rotateY(0deg)';
                  element.style.transition = 'none';
                  
                  // Force reflow
                  element.offsetHeight;
                  
                  // Now animate to 360 degrees
                  element.style.transform = 'rotateY(360deg)';
                  element.style.transition = 'transform 0.5s ease-out';
                  
                  setTimeout(() => {
                    // Snap to 0 degrees without animation
                    element.style.transform = 'rotateY(0deg)';
                    element.style.transition = 'none';
                    
                    // Then clear everything after a tiny delay
                    setTimeout(() => {
                      element.style.transform = 'rotate(-10deg)';
                      element.style.transition = 'transform 0.25s ease-out';
                      delete element.dataset.spinning;
                    }, 10);
                    
                    console.log('Navigating to dashboard from mobile...');
                    closeMobileMenu();
                    router.push('/dashboard');
                  }, 500);
                }}
              >
                <Image
                  src="/friendlyremindercirclelogo.png"
                  alt="Friendly Reminder"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Keep FR fallback for reference */}
              {/* <div
                className="w-8 h-8 bg-[#7b5ea7] text-[#231f20] rounded-full flex items-center justify-center text-sm font-bold hover:bg-[#fcba28] transition-colors"
              >
                FR
              </div> */}
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-md text-[#f9f4da] hover:text-[#fcba28] hover:bg-[#f9f4da]/10 focus:outline-none focus:ring-2 focus:ring-[#fcba28]"
                aria-label="Close menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <nav className="p-4">
              <div className="space-y-4">
                <Link
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className={`block py-2 px-3 rounded-md transition-colors ${
                    isActive("/dashboard")
                      ? "bg-[#7b5ea7]/20 text-[#7b5ea7] font-bold text-lg"
                      : "text-[#f9f4da] hover:bg-[#f9f4da]/10 font-medium"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/contacts"
                  onClick={closeMobileMenu}
                  className={`block py-2 px-3 rounded-md transition-colors ${
                    isActive("/contacts") || pathname.startsWith("/contacts")
                      ? "bg-[#7b5ea7]/20 text-[#7b5ea7] font-bold text-lg"
                      : "text-[#f9f4da] hover:bg-[#f9f4da]/10 font-medium"
                  }`}
                >
                  Contacts
                </Link>
                <Link
                  href="/settings"
                  onClick={closeMobileMenu}
                  className={`block py-2 px-3 rounded-md transition-colors ${
                    isActive("/settings")
                      ? "bg-[#7b5ea7]/20 text-[#7b5ea7] font-bold text-lg"
                      : "text-[#f9f4da] hover:bg-[#f9f4da]/10 font-medium"
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
  );
}
