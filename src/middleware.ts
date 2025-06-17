import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    console.log('🔒 Middleware checking:', req.nextUrl.pathname)
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    console.log('👤 Session in middleware:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      error: error?.message
    })

    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                      req.nextUrl.pathname.startsWith('/signup')
    const isCallbackPage = req.nextUrl.pathname.startsWith('/auth/callback')
    
    console.log('📍 Page type:', {
      path: req.nextUrl.pathname,
      isAuthPage,
      isCallbackPage,
      isHome: req.nextUrl.pathname === '/'
    })
    
    // Allow access to home page and callback page without auth
    if (req.nextUrl.pathname === '/' || isCallbackPage) {
      console.log('✅ Allowing access to home/callback page')
      return res
    }
    
    // Redirect authenticated users away from auth pages
    if (session && isAuthPage) {
      console.log('🔀 Authenticated user on auth page, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Redirect unauthenticated users to login (except for auth pages)
    if (!session && !isAuthPage) {
      console.log('🚫 Unauthenticated user, redirecting to login')
      return NextResponse.redirect(new URL('/login', req.url))
    }

    console.log('✅ Middleware allowing request')
    return res
  } catch (error) {
    // If there's an error with Supabase, allow the request to continue
    console.error('💥 Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
}