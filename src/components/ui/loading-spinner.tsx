interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
  text?: string
}

export function LoadingSpinner({ size = 'md', className = '', showText = false, text = 'Loading...' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 border-4',
    md: 'h-16 w-16 border-8', 
    lg: 'h-24 w-24 border-12'
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} ${className}`}
        role="status"
        aria-label="Loading"
        style={{
          borderColor: '#7b5ea7',
          borderTopColor: '#7b5ea7',
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent', 
          borderLeftColor: 'transparent',
          borderWidth: sizeClasses[size].includes('border-4') ? '4px' : 
                      sizeClasses[size].includes('border-8') ? '8px' : '12px'
        }}
      >
        <span className="sr-only">{text}</span>
      </div>
      {showText && (
        <span className="text-sm font-medium animate-pulse" style={{ color: '#f9f4da' }}>{text}</span>
      )}
    </div>
  )
}