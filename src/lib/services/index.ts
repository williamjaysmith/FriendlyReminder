// Re-export all services for easy importing
export { ContactService } from './ContactService'
export { AuthService } from './AuthService'
export type { AuthUser, AuthSession } from './AuthService'

// Service factory for dependency injection
export const services = {
  contact: ContactService,
  auth: AuthService
}

export default services