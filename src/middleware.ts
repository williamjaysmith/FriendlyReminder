import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    console.log('🔒 Middleware checking:', req.nextUrl.pathname)
    
    // Debug: Log all cookies to see what Appwrite actually sets
    const allCookies = req.cookies.getAll()
    console.log('🍪 All cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    // Check for various possible Appwrite session cookie names
    const sessionCookie = req.cookies.get('appwrite-session') || 
                         req.cookies.get('a_session_' + process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) ||
                         req.cookies.get('a_session') ||
                         allCookies.find(c => c.name.includes('session') || c.name.includes('appwrite'))
    
    const hasSession = !!sessionCookie?.value

    console.log('👤 Session in middleware:', {
      hasSession,
      sessionExists: !!sessionCookie,
      sessionCookieName: sessionCookie?.name,
      cookieValue: sessionCookie?.value ? '***exists***' : null
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
    if (hasSession && isAuthPage) {
      console.log('🔀 Authenticated user on auth page, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Redirect unauthenticated users to login (except for auth pages)
    if (!hasSession && !isAuthPage) {
      console.log('🚫 Unauthenticated user, redirecting to login')
      return NextResponse.redirect(new URL('/login', req.url))
    }

    console.log('✅ Middleware allowing request')
    return res
  } catch (error) {
    // If there's an error, allow the request to continue
    console.error('💥 Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
}