'use client'

import { useState, useCallback, useMemo } from 'react'
import { FormState, FormErrors, Validator } from '@/lib/types'
import { validateField } from '@/lib/utils'

export interface UseFormOptions<T> {
  initialValues: T
  validators?: Record<keyof T, Validator<any>>
  onSubmit: (values: T) => Promise<void> | void
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

// Custom hook for form management
export function useForm<T extends Record<string, any>>({
  initialValues,
  validators = {},
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validate a single field
  const validateSingleField = useCallback((name: keyof T, value: any): string | undefined => {
    const validator = validators[name]
    if (!validator) return undefined
    
    return validateField(value, validator)
  }, [validators])

  // Validate all fields
  const validateAllFields = useCallback((fieldsToValidate: T = values): FormErrors => {
    const newErrors: FormErrors = {}
    
    Object.keys(validators).forEach(fieldName => {
      const error = validateSingleField(fieldName as keyof T, fieldsToValidate[fieldName])
      if (error) {
        newErrors[fieldName] = error
      }
    })
    
    return newErrors
  }, [validators, validateSingleField, values])

  // Check if form is valid
  const isValid = useMemo(() => {
    const currentErrors = validateAllFields()
    return Object.keys(currentErrors).length === 0
  }, [validateAllFields])

  // Set value for a specific field
  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    if (validateOnChange) {
      const error = validateSingleField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }, [validateOnChange, validateSingleField])

  // Set multiple values at once
  const setValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }))
    
    if (validateOnChange) {
      const newErrors = validateAllFields({ ...values, ...newValues })
      setErrors(newErrors)
    }
  }, [validateOnChange, validateAllFields, values])

  // Handle input change
  const handleChange = useCallback((name: keyof T) => {
    return (value: any) => {
      setValue(name, value)
    }
  }, [setValue])

  // Handle input blur
  const handleBlur = useCallback((name: keyof T) => {
    return () => {
      setTouched(prev => ({ ...prev, [name]: true }))
      
      if (validateOnBlur) {
        const error = validateSingleField(name, values[name])
        setErrors(prev => ({
          ...prev,
          [name]: error
        }))
      }
    }
  }, [validateOnBlur, validateSingleField, values])

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true
      return acc
    }, {} as Record<keyof T, boolean>)
    setTouched(allTouched)

    // Validate all fields
    const validationErrors = validateAllFields()
    setErrors(validationErrors)

    // If there are errors, don't submit
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    // Submit the form
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validateAllFields, onSubmit])

  // Reset form to initial values
  const reset = useCallback((newInitialValues?: T) => {
    const valuesToReset = newInitialValues || initialValues
    setValues(valuesToReset)
    setErrors({})
    setTouched({} as Record<keyof T, boolean>)
    setIsSubmitting(false)
  }, [initialValues])

  // Set form errors (useful for server-side validation)
  const setFormErrors = useCallback((newErrors: FormErrors) => {
    setErrors(newErrors)
  }, [])

  // Get error for a specific field (only if touched)
  const getFieldError = useCallback((name: keyof T): string | undefined => {
    return touched[name] ? errors[name as string] : undefined
  }, [touched, errors])

  // Check if a specific field has been touched
  const isFieldTouched = useCallback((name: keyof T): boolean => {
    return Boolean(touched[name])
  }, [touched])

  // Get form state object
  const formState: FormState<T> = useMemo(() => ({
    data: values,
    errors,
    isSubmitting,
    isValid
  }), [values, errors, isSubmitting, isValid])

  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    formState,

    // Field helpers
    setValue,
    setValues,
    getFieldError,
    isFieldTouched,

    // Event handlers
    handleChange,
    handleBlur,
    handleSubmit,

    // Form actions
    reset,
    setFormErrors,
    validateAllFields
  }
}

export default useForm