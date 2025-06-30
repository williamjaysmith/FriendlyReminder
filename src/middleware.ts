import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Temporary: Always allow callback page
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    console.log('🔓 TEMP: Always allowing callback page')
    return res
  }
  
  try {
    console.log('🔒 Middleware checking:', req.nextUrl.pathname)
    
    // Debug: Log all cookies to see what Appwrite actually sets
    const allCookies = req.cookies.getAll()
    console.log('🍪 All cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    // Check for various possible Appwrite session cookie names
    // Look for the actual Appwrite session cookies that start with 'a_session_' and have a project ID
    const sessionCookie = req.cookies.get('appwrite-session') || 
                         req.cookies.get('a_session_' + process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) ||
                         req.cookies.get('a_session') ||
                         allCookies.find(c => c.name.startsWith('a_session_') && !c.name.includes('legacy') && !c.name.includes('console'))
    
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

    // Allow client-side auth check for protected pages if session detection is uncertain
    // Only redirect if we're confident there's no session
    if (!hasSession && !isAuthPage) {
      // Check if we have any appwrite-related cookies at all
      const hasAnyAppwriteInfo = allCookies.some(c => 
        c.name.includes('appwrite') || 
        c.name.includes('session') ||
        c.name.startsWith('a_')
      )
      
      // If we have some appwrite info but couldn't detect session properly,
      // let the client-side auth handle it
      if (hasAnyAppwriteInfo) {
        console.log('🤔 Uncertain session state, allowing client-side auth check')
        return res
      }
      
      console.log('🚫 No authentication info found, redirecting to login')
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