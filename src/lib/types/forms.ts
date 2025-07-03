// Form-related types and interfaces
export interface ContactFormData {
  name: string
  email: string
  gender: string
  birthday: string
  description: string
  work_company: string
  work_position: string
  how_we_met: string
  interests: string
  reminder_days: number
  birthday_reminder: boolean
}

export interface ProfileFormData {
  username: string
  email: string
}

export interface ConversationFormData {
  notes: string
  date: string
}

export interface TagFormData {
  name: string
  color: string
}

export interface SocialLinkFormData {
  platform: string
  url: string
}

// Form validation types
export interface FormErrors {
  [key: string]: string | undefined
}

export interface FormState<T> {
  data: T
  errors: FormErrors
  isSubmitting: boolean
  isValid: boolean
}

// Form field types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'date' | 'number'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: (value: any) => string | undefined
}

// Auth form types
export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
}

export interface AuthFormState {
  isLoading: boolean
  error: string | null
}