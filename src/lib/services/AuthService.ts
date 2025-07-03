// Authentication service
import { LoginFormData, SignupFormData } from '@/lib/types'
import { ApiResponse } from '@/lib/types'
import { createError, errorHandler, ValidationError } from '@/lib/utils'
import { GuestService } from './GuestService'

export interface AuthUser {
  id: string
  email: string
  name?: string
  emailVerified: boolean
  createdAt: string
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export class AuthService {
  // Guest login
  static async guestLogin(): Promise<ApiResponse<AuthSession>> {
    try {
      GuestService.initializeGuestMode();
      const guestUser = GuestService.getGuestUser();
      
      if (!guestUser) {
        throw createError.auth('Failed to initialize guest mode');
      }

      const session: AuthSession = {
        user: {
          id: guestUser.id,
          email: guestUser.email,
          name: guestUser.name,
          emailVerified: true,
          createdAt: guestUser.created_at
        },
        accessToken: 'guest-access-token',
        refreshToken: 'guest-refresh-token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

      return {
        data: session,
        success: true,
        message: 'Guest login successful'
      };
    } catch (error) {
      errorHandler.log(error, { action: 'guestLogin' });
      throw error;
    }
  }

  // Login with email and password
  static async login(data: LoginFormData): Promise<ApiResponse<AuthSession>> {
    try {
      // Validate input
      const errors = this.validateLoginData(data)
      if (Object.keys(errors).length > 0) {
        throw new ValidationError('Invalid login data', errors)
      }

      // This would integrate with your actual auth provider (Supabase, Firebase, etc.)
      // For now, returning mock data structure
      const session: AuthSession = {
        user: {
          id: 'user-id',
          email: data.email,
          emailVerified: true,
          createdAt: new Date().toISOString()
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
      }

      return {
        data: session,
        success: true,
        message: 'Login successful'
      }
    } catch (error) {
      errorHandler.log(error, { action: 'login', metadata: { email: data.email } })
      throw error
    }
  }

  // Sign up with email and password
  static async signup(data: SignupFormData): Promise<ApiResponse<AuthUser>> {
    try {
      // Validate input
      const errors = this.validateSignupData(data)
      if (Object.keys(errors).length > 0) {
        throw new ValidationError('Invalid signup data', errors)
      }

      // This would integrate with your actual auth provider
      const user: AuthUser = {
        id: 'new-user-id',
        email: data.email,
        emailVerified: false,
        createdAt: new Date().toISOString()
      }

      return {
        data: user,
        success: true,
        message: 'Account created successfully. Please check your email to verify your account.'
      }
    } catch (error) {
      errorHandler.log(error, { action: 'signup', metadata: { email: data.email } })
      throw error
    }
  }

  // Logout
  static async logout(): Promise<ApiResponse<void>> {
    try {
      // Clear guest data if in guest mode
      if (GuestService.isGuestMode()) {
        GuestService.clearGuestData();
      }
      
      // This would clear the session from your auth provider
      // Clear local storage, cookies, etc.
      
      return {
        data: undefined,
        success: true,
        message: 'Logged out successfully'
      }
    } catch (error) {
      errorHandler.log(error, { action: 'logout' })
      throw createError.generic('Failed to logout')
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<ApiResponse<AuthUser | null>> {
    try {
      // Check if in guest mode first
      if (GuestService.isGuestMode()) {
        const guestUser = GuestService.getGuestUser();
        if (guestUser) {
          return {
            data: {
              id: guestUser.id,
              email: guestUser.email,
              name: guestUser.name,
              emailVerified: true,
              createdAt: guestUser.created_at
            },
            success: true
          };
        }
      }
      
      // This would get the current user from your auth provider
      // Check session validity, refresh tokens if needed
      
      const user: AuthUser | null = null // Get from auth provider

      return {
        data: user,
        success: true
      }
    } catch (error) {
      errorHandler.log(error, { action: 'getCurrentUser' })
      throw createError.generic('Failed to get current user')
    }
  }

  // Refresh access token
  static async refreshToken(refreshToken: string): Promise<ApiResponse<AuthSession>> {
    try {
      if (!refreshToken) {
        throw createError.auth('Refresh token is required')
      }

      // This would refresh the token with your auth provider
      const session: AuthSession = {
        user: {
          id: 'user-id',
          email: 'user@example.com',
          emailVerified: true,
          createdAt: new Date().toISOString()
        },
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      }

      return {
        data: session,
        success: true
      }
    } catch (error) {
      errorHandler.log(error, { action: 'refreshToken' })
      throw createError.auth('Failed to refresh token')
    }
  }

  // Request password reset
  static async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    try {
      if (!email || !this.isValidEmail(email)) {
        throw createError.validation('email', 'Valid email is required')
      }

      // This would send a password reset email via your auth provider
      
      return {
        data: undefined,
        success: true,
        message: 'Password reset email sent. Please check your inbox.'
      }
    } catch (error) {
      errorHandler.log(error, { action: 'requestPasswordReset', metadata: { email } })
      throw error
    }
  }

  // Reset password
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    try {
      if (!token) {
        throw createError.validation('token', 'Reset token is required')
      }

      if (!newPassword || !this.isValidPassword(newPassword)) {
        throw createError.validation('password', 'Password must be at least 8 characters with uppercase, lowercase, and number')
      }

      // This would reset the password via your auth provider
      
      return {
        data: undefined,
        success: true,
        message: 'Password reset successfully'
      }
    } catch (error) {
      errorHandler.log(error, { action: 'resetPassword' })
      throw error
    }
  }

  // Update user profile
  static async updateProfile(
    userId: string,
    updates: Partial<AuthUser>
  ): Promise<ApiResponse<AuthUser>> {
    try {
      // Validate updates
      if (updates.email && !this.isValidEmail(updates.email)) {
        throw createError.validation('email', 'Invalid email address')
      }

      // This would update the user profile via your auth provider
      const user: AuthUser = {
        id: userId,
        email: updates.email || 'current@email.com',
        name: updates.name,
        emailVerified: true,
        createdAt: new Date().toISOString()
      }

      return {
        data: user,
        success: true,
        message: 'Profile updated successfully'
      }
    } catch (error) {
      errorHandler.log(error, { action: 'updateProfile', metadata: { userId } })
      throw error
    }
  }

  // Verify email
  static async verifyEmail(token: string): Promise<ApiResponse<void>> {
    try {
      if (!token) {
        throw createError.validation('token', 'Verification token is required')
      }

      // This would verify the email via your auth provider
      
      return {
        data: undefined,
        success: true,
        message: 'Email verified successfully'
      }
    } catch (error) {
      errorHandler.log(error, { action: 'verifyEmail' })
      throw error
    }
  }

  // OAuth login (Google, GitHub, etc.)
  static async oauthLogin(provider: 'google' | 'github'): Promise<ApiResponse<string>> {
    try {
      // This would initiate OAuth flow with your auth provider
      const redirectUrl = `https://auth.provider.com/oauth/${provider}`
      
      return {
        data: redirectUrl,
        success: true
      }
    } catch (error) {
      errorHandler.log(error, { action: 'oauthLogin', metadata: { provider } })
      throw createError.generic(`Failed to initiate ${provider} login`)
    }
  }

  // Handle OAuth callback
  static async handleOAuthCallback(
    provider: 'google' | 'github',
    code: string,
    state?: string
  ): Promise<ApiResponse<AuthSession>> {
    try {
      if (!code) {
        throw createError.validation('code', 'Authorization code is required')
      }

      // This would handle the OAuth callback with your auth provider
      const session: AuthSession = {
        user: {
          id: 'oauth-user-id',
          email: 'oauth@example.com',
          emailVerified: true,
          createdAt: new Date().toISOString()
        },
        accessToken: 'oauth-access-token',
        refreshToken: 'oauth-refresh-token',
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      }

      return {
        data: session,
        success: true,
        message: 'OAuth login successful'
      }
    } catch (error) {
      errorHandler.log(error, { action: 'handleOAuthCallback', metadata: { provider } })
      throw createError.auth('OAuth authentication failed')
    }
  }

  // Validate login data
  private static validateLoginData(data: LoginFormData): Record<string, string> {
    const errors: Record<string, string> = {}

    if (!data.email) {
      errors.email = 'Email is required'
    } else if (!this.isValidEmail(data.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!data.password) {
      errors.password = 'Password is required'
    }

    return errors
  }

  // Validate signup data
  private static validateSignupData(data: SignupFormData): Record<string, string> {
    const errors: Record<string, string> = {}

    if (!data.email) {
      errors.email = 'Email is required'
    } else if (!this.isValidEmail(data.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!data.password) {
      errors.password = 'Password is required'
    } else if (!this.isValidPassword(data.password)) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number'
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    return errors
  }

  // Email validation helper
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Password validation helper
  private static isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return passwordRegex.test(password)
  }
}

export default AuthService