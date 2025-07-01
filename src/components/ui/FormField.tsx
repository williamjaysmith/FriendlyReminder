'use client'

import { FormFieldProps } from '@/lib/types'
import { cn } from '@/lib/utils'

const FormField = ({ 
  className,
  label,
  name,
  required = false,
  error,
  children,
  ...props 
}: FormFieldProps) => {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      <label 
        htmlFor={name}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          required && "after:content-['*'] after:ml-0.5 after:text-red-500"
        )}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField