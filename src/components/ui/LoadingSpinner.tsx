'use client'

import { cn } from '@/lib/utils'
import { LoadingSpinnerProps } from '@/lib/types'

const LoadingSpinner = ({ 
  className,
  size = 'md',
  color,
  children,
  ...props 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div 
      className={cn('flex items-center justify-center', className)}
      {...props}
    >
      <svg
        className={cn(
          'animate-spin',
          sizeClasses[size],
          color && `text-[${color}]`
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        role="img"
        aria-label="Loading spinner"
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
      {children && (
        <span className="ml-2 text-sm text-[#666]">
          {children}
        </span>
      )}
    </div>
  )
}

export default LoadingSpinner