import { 
  validation, 
  validateField, 
  validateForm, 
  rules, 
  contactValidators, 
  profileValidators, 
  authValidators 
} from '../validation'

describe('validation utilities', () => {
  describe('validation.email', () => {
    it('should validate correct email addresses', () => {
      expect(validation.email('test@example.com')).toBe(true)
      expect(validation.email('user.name@domain.co.uk')).toBe(true)
      expect(validation.email('user+tag@example.org')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(validation.email('invalid-email')).toBe(false)
      expect(validation.email('user@')).toBe(false)
      expect(validation.email('@domain.com')).toBe(false)
      expect(validation.email('user@domain')).toBe(false)
      expect(validation.email('')).toBe(false)
    })
  })

  describe('validation.required', () => {
    it('should validate required fields', () => {
      expect(validation.required('test')).toBe(true)
      expect(validation.required('   test   ')).toBe(true)
      expect(validation.required(['item'])).toBe(true)
      expect(validation.required(0)).toBe(true)
      expect(validation.required(false)).toBe(true)
    })

    it('should reject empty or null values', () => {
      expect(validation.required('')).toBe(false)
      expect(validation.required('   ')).toBe(false)
      expect(validation.required(null)).toBe(false)
      expect(validation.required(undefined)).toBe(false)
      expect(validation.required([])).toBe(false)
    })
  })

  describe('validation.minLength', () => {
    const minLength5 = validation.minLength(5)

    it('should validate strings with minimum length', () => {
      expect(minLength5('12345')).toBe(true)
      expect(minLength5('123456')).toBe(true)
    })

    it('should reject strings shorter than minimum', () => {
      expect(minLength5('1234')).toBe(false)
      expect(minLength5('')).toBe(false)
    })
  })

  describe('validation.maxLength', () => {
    const maxLength10 = validation.maxLength(10)

    it('should validate strings within maximum length', () => {
      expect(maxLength10('12345')).toBe(true)
      expect(maxLength10('1234567890')).toBe(true)
    })

    it('should reject strings longer than maximum', () => {
      expect(maxLength10('12345678901')).toBe(false)
    })
  })

  describe('validation.url', () => {
    it('should validate correct URLs', () => {
      expect(validation.url('https://example.com')).toBe(true)
      expect(validation.url('http://subdomain.example.com/path')).toBe(true)
      expect(validation.url('https://example.com:8080/path?query=value')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(validation.url('not-a-url')).toBe(false)
      expect(validation.url('example.com')).toBe(false)
      expect(validation.url('')).toBe(false)
    })
  })

  describe('validation.phone', () => {
    it('should validate correct phone numbers', () => {
      expect(validation.phone('(555) 123-4567')).toBe(true)
      expect(validation.phone('555-123-4567')).toBe(true)
      expect(validation.phone('5551234567')).toBe(true)
      expect(validation.phone('+1-555-123-4567')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validation.phone('123')).toBe(false)
      expect(validation.phone('abc-def-ghij')).toBe(false)
      expect(validation.phone('')).toBe(false)
    })
  })

  describe('validation.date', () => {
    it('should validate correct dates', () => {
      expect(validation.date('2023-01-01')).toBe(true)
      expect(validation.date('2023-12-31T23:59:59Z')).toBe(true)
      expect(validation.date('01/01/2023')).toBe(true)
    })

    it('should reject invalid dates', () => {
      expect(validation.date('not-a-date')).toBe(false)
      expect(validation.date('2023-13-01')).toBe(false)
      expect(validation.date('')).toBe(false)
    })
  })

  describe('validation.number', () => {
    it('should validate numbers', () => {
      expect(validation.number('123')).toBe(true)
      expect(validation.number('123.45')).toBe(true)
      expect(validation.number('-123')).toBe(true)
      expect(validation.number(123)).toBe(true)
    })

    it('should reject non-numbers', () => {
      expect(validation.number('abc')).toBe(false)
      expect(validation.number('')).toBe(false)
      expect(validation.number('123abc')).toBe(false)
    })
  })

  describe('validation.positiveNumber', () => {
    it('should validate positive numbers', () => {
      expect(validation.positiveNumber('123')).toBe(true)
      expect(validation.positiveNumber('123.45')).toBe(true)
      expect(validation.positiveNumber(123)).toBe(true)
    })

    it('should reject non-positive numbers', () => {
      expect(validation.positiveNumber('0')).toBe(false)
      expect(validation.positiveNumber('-123')).toBe(false)
      expect(validation.positiveNumber('abc')).toBe(false)
    })
  })

  describe('validation.password', () => {
    it('should validate strong passwords', () => {
      expect(validation.password('Password123')).toBe(true)
      expect(validation.password('MySecure123')).toBe(true)
      expect(validation.password('Test1234')).toBe(true)
    })

    it('should reject weak passwords', () => {
      expect(validation.password('password')).toBe(false) // no uppercase or numbers
      expect(validation.password('PASSWORD')).toBe(false) // no lowercase or numbers
      expect(validation.password('12345678')).toBe(false) // no letters
      expect(validation.password('Pass123')).toBe(false) // too short
      expect(validation.password('')).toBe(false) // empty
    })
  })

  describe('validateField', () => {
    it('should validate field with required rule', () => {
      const validator = { required: true }
      
      expect(validateField('test', validator)).toBeUndefined()
      expect(validateField('', validator)).toBe('This field is required')
      expect(validateField(null, validator)).toBe('This field is required')
    })

    it('should validate field with custom rules', () => {
      const validator = {
        required: false,
        rules: [
          { test: (value: string) => value.length >= 3, message: 'Too short' }
        ]
      }
      
      expect(validateField('test', validator)).toBeUndefined()
      expect(validateField('te', validator)).toBe('Too short')
      expect(validateField('', validator)).toBeUndefined() // not required
    })

    it('should validate field with multiple rules', () => {
      const validator = {
        required: true,
        rules: [
          { test: (value: string) => value.length >= 3, message: 'Too short' },
          { test: (value: string) => value.length <= 10, message: 'Too long' }
        ]
      }
      
      expect(validateField('test', validator)).toBeUndefined()
      expect(validateField('', validator)).toBe('This field is required')
      expect(validateField('te', validator)).toBe('Too short')
      expect(validateField('12345678901', validator)).toBe('Too long')
    })
  })

  describe('validateForm', () => {
    it('should validate entire form', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        age: '25'
      }
      
      const validators = {
        name: { required: true },
        email: { required: true, rules: [rules.email()] },
        age: { required: true, rules: [rules.positiveNumber()] }
      }
      
      const errors = validateForm(data, validators)
      expect(Object.keys(errors)).toHaveLength(0)
    })

    it('should return errors for invalid form', () => {
      const data = {
        name: '',
        email: 'invalid-email',
        age: '-5'
      }
      
      const validators = {
        name: { required: true },
        email: { required: true, rules: [rules.email()] },
        age: { required: true, rules: [rules.positiveNumber()] }
      }
      
      const errors = validateForm(data, validators)
      expect(errors.name).toBe('This field is required')
      expect(errors.email).toBe('Please enter a valid email address')
      expect(errors.age).toBe('Must be a positive number')
    })
  })

  describe('predefined validators', () => {
    describe('contactValidators', () => {
      it('should validate contact data', () => {
        const validData = {
          name: 'John Doe',
          email: 'john@example.com',
          reminderDays: '30'
        }
        
        const errors = validateForm(validData, contactValidators)
        expect(Object.keys(errors)).toHaveLength(0)
      })

      it('should reject invalid contact data', () => {
        const invalidData = {
          name: 'J',
          email: 'invalid-email',
          reminderDays: '0'
        }
        
        const errors = validateForm(invalidData, contactValidators)
        expect(errors.name).toBeDefined()
        expect(errors.email).toBeDefined()
        expect(errors.reminderDays).toBeDefined()
      })
    })

    describe('profileValidators', () => {
      it('should validate profile data', () => {
        const validData = {
          username: 'johndoe',
          email: 'john@example.com'
        }
        
        const errors = validateForm(validData, profileValidators)
        expect(Object.keys(errors)).toHaveLength(0)
      })

      it('should reject invalid profile data', () => {
        const invalidData = {
          username: 'jo',
          email: 'invalid-email'
        }
        
        const errors = validateForm(invalidData, profileValidators)
        expect(errors.username).toBeDefined()
        expect(errors.email).toBeDefined()
      })
    })

    describe('authValidators', () => {
      it('should validate auth data', () => {
        const validData = {
          email: 'john@example.com',
          password: 'Password123'
        }
        
        const errors = validateForm(validData, authValidators)
        expect(Object.keys(errors)).toHaveLength(0)
      })

      it('should reject invalid auth data', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'weak'
        }
        
        const errors = validateForm(invalidData, authValidators)
        expect(errors.email).toBeDefined()
        expect(errors.password).toBeDefined()
      })
    })
  })
})