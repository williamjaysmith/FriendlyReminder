// Validation utility functions
import { ValidationRule, Validator } from '../types/utilities'

export const validation = {
  // Email validation
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },

  // Required field validation
  required: (value: any): boolean => {
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return value !== null && value !== undefined
  },

  // String length validation
  minLength: (min: number) => (value: string): boolean => {
    return value.length >= min
  },

  maxLength: (max: number) => (value: string): boolean => {
    return value.length <= max
  },

  // URL validation
  url: (value: string): boolean => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },

  // Phone number validation (basic)
  phone: (value: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/
    return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10
  },

  // Date validation
  date: (value: string): boolean => {
    const date = new Date(value)
    return !isNaN(date.getTime())
  },

  // Number validation
  number: (value: string | number): boolean => {
    if (typeof value === 'string' && value.trim() === '') return false
    return !isNaN(Number(value))
  },

  // Positive number validation
  positiveNumber: (value: string | number): boolean => {
    const num = Number(value)
    return !isNaN(num) && num > 0
  },

  // Password strength validation
  password: (value: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return passwordRegex.test(value)
  }
}

// Form validation helper
export const validateField = <T>(
  value: T,
  validator: Validator<T>
): string | undefined => {
  if (validator.required && !validation.required(value)) {
    return 'This field is required'
  }

  // Skip rule validation if field is not required and value is empty
  if (!validator.required && !validation.required(value)) {
    return undefined
  }

  if (validator.rules) {
    for (const rule of validator.rules) {
      if (!rule.test(value)) {
        return rule.message
      }
    }
  }

  return undefined
}

// Validate entire form
export const validateForm = (
  data: Record<string, any>,
  validators: Record<string, Validator<any>>
): Record<string, string> => {
  const errors: Record<string, string> = {}

  for (const [field, validator] of Object.entries(validators)) {
    const error = validateField(data[field], validator)
    if (error) {
      errors[field] = error
    }
  }

  return errors
}

// Common validation rules
export const rules = {
  required: (message = 'This field is required'): ValidationRule<any> => ({
    test: validation.required,
    message
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule<string> => ({
    test: validation.email,
    message
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    test: validation.minLength(min),
    message: message || `Must be at least ${min} characters`
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    test: validation.maxLength(max),
    message: message || `Must be no more than ${max} characters`
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule<string> => ({
    test: validation.url,
    message
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule<string> => ({
    test: validation.phone,
    message
  }),

  password: (message = 'Password must be at least 8 characters with uppercase, lowercase, and number'): ValidationRule<string> => ({
    test: validation.password,
    message
  }),

  positiveNumber: (message = 'Must be a positive number'): ValidationRule<string | number> => ({
    test: validation.positiveNumber,
    message
  })
}

// Contact-specific validators
export const contactValidators = {
  name: {
    required: true,
    rules: [
      rules.required(),
      rules.minLength(2),
      rules.maxLength(100)
    ]
  },
  email: {
    required: false,
    rules: [rules.email()]
  },
  reminderDays: {
    required: true,
    rules: [
      rules.required(),
      rules.positiveNumber()
    ]
  }
}

// Profile validators
export const profileValidators = {
  username: {
    required: false,
    rules: [
      rules.minLength(3),
      rules.maxLength(30)
    ]
  },
  email: {
    required: true,
    rules: [
      rules.required(),
      rules.email()
    ]
  }
}

// Auth validators
export const authValidators = {
  email: {
    required: true,
    rules: [
      rules.required(),
      rules.email()
    ]
  },
  password: {
    required: true,
    rules: [
      rules.required(),
      rules.password()
    ]
  }
}