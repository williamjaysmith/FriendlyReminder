/**
 * Environment utilities for handling development vs production
 */

export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'

/**
 * Get the current site URL based on environment
 */
export function getSiteUrl(): string {
  // If explicitly set, use that
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // Development
  if (isDevelopment) {
    return 'http://localhost:3000'
  }

  // Production - try Vercel URL first, then fallback
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Fallback to your deployed URL
  return 'https://friendly-reminder-sage.vercel.app'
}

/**
 * Get OAuth redirect URLs for the current environment
 */
export function getAuthRedirectUrl(): string {
  const baseUrl = getSiteUrl()
  return `${baseUrl}/auth/callback`
}

/**
 * Environment-specific configuration
 */
export const config = {
  siteUrl: getSiteUrl(),
  authRedirectUrl: getAuthRedirectUrl(),
  isDevelopment,
  isProduction,
}