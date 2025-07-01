'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { InputProps } from '@/lib/types'

const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  disabled = false,
  required = false,
  name,
  id,
  onChange,
  onBlur,
  error,
  ...props
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }
  return (
    <input
      ref={ref}
      type={type}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      required={required}
      onChange={handleChange}
      onBlur={onBlur}
      className={cn(
        // Base styles
        'flex h-10 w-full rounded-md border border-[#ddd] bg-white px-3 py-2',
        'text-sm ring-offset-white file:border-0 file:bg-transparent',
        'file:text-sm file:font-medium placeholder:text-[#999]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fcba28]',
        'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        
        // Error state
        error && 'border-red-500 focus-visible:ring-red-500',
        
        className
      )}
      {...props}
    />
  )
  }
)

Input.displayName = 'Input'

export default Input