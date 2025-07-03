'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ButtonProps } from '@/lib/types'

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ 
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  children,
  ...props
}, ref) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick()
    }
  }
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2 rounded-md font-medium',
        'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        
        // Variant styles
        {
          'bg-[#fcba28] text-[#231f20] hover:bg-[#e6a825] focus:ring-[#fcba28]/50': variant === 'primary',
          'bg-[#e0e0e0] text-[#262522] hover:bg-[#cacaca] focus:ring-[#e0e0e0]/50': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50': variant === 'danger',
          'bg-transparent text-[#262522] hover:bg-[#cacaca] focus:ring-[#e0e0e0]/50': variant === 'ghost',
          'border border-[#ddd] bg-transparent text-[#262522] hover:bg-[#e8e8e8] focus:ring-[#ddd]/50': variant === 'outline'
        },
        
        // Size styles
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg'
        },
        
        // Loading state
        loading && 'cursor-not-allowed',
        
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
  }
)

Button.displayName = 'Button'

export default Button