import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'success'
  size?: 'default' | 'sm' | 'lg' | 'xl'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles - modern, playful design
          'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
          'transform hover:scale-[1.02] active:scale-[0.98]',
          
          // Variant styles using new brand colors
          {
            // Primary - Yellow (brand requirement)
            'bg-[var(--button-primary)] text-[var(--button-text)] hover:bg-[var(--brand-yellow)]/90 hover:scale-105 focus-visible:ring-[var(--brand-yellow)]': 
              variant === 'default',
            
            // Secondary - Blue accent  
            'bg-[var(--brand-blue)] text-[var(--brand-beige)] hover:bg-[var(--brand-blue)]/90 hover:scale-105 focus-visible:ring-[var(--brand-blue)]': 
              variant === 'secondary',
            
            // Success - Green
            'bg-[var(--brand-green)] text-[var(--brand-beige)] hover:bg-[var(--brand-green)]/90 hover:scale-105 focus-visible:ring-[var(--brand-green)]': 
              variant === 'success',
            
            // Outline - Using brand colors
            'border-2 border-[var(--text-primary)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--background)] focus-visible:ring-[var(--brand-yellow)]': 
              variant === 'outline',
            
            // Ghost - Minimal with brand colors
            'text-[var(--text-primary)] hover:bg-[var(--text-primary)]/10 focus-visible:ring-[var(--brand-yellow)]': 
              variant === 'ghost',
            
            // Destructive - Brand red
            'bg-[var(--brand-red)] text-[var(--brand-beige)] hover:bg-[var(--brand-red)]/90 hover:scale-105 focus-visible:ring-[var(--brand-red)]': 
              variant === 'destructive',
          },
          
          // Size styles - more generous spacing
          {
            'h-10 px-6 py-2 text-sm rounded-lg': size === 'default',
            'h-8 px-4 py-1 text-xs rounded-md': size === 'sm', 
            'h-12 px-8 py-3 text-base rounded-xl': size === 'lg',
            'h-14 px-10 py-4 text-lg rounded-xl': size === 'xl',
          },
          
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }