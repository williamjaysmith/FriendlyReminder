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
          
          // Variant styles using explicit Tailwind colors
          {
            // Primary - Yellow (brand requirement)
            'bg-[#fcba28] text-[#231f20] hover:bg-[#fcba28]/90 hover:scale-105 focus-visible:ring-[#fcba28]': 
              variant === 'default',
            
            // Secondary - Blue accent  
            'bg-[#12b5e5] text-[#f9f4da] hover:bg-[#12b5e5]/90 hover:scale-105 focus-visible:ring-[#12b5e5]': 
              variant === 'secondary',
            
            // Success - Green
            'bg-[#0ba95b] text-[#f9f4da] hover:bg-[#0ba95b]/90 hover:scale-105 focus-visible:ring-[#0ba95b]': 
              variant === 'success',
            
            // Outline - Using brand colors
            'border-2 border-[#231f20] bg-transparent text-[#231f20] hover:bg-[#231f20] hover:text-[#f9f4da] focus-visible:ring-[#fcba28]': 
              variant === 'outline',
            
            // Ghost - Minimal with brand colors
            'text-[#231f20] hover:bg-[#231f20]/10 focus-visible:ring-[#fcba28]': 
              variant === 'ghost',
            
            // Destructive - Brand red
            'bg-[#ed203d] text-[#f9f4da] hover:bg-[#ed203d]/90 hover:scale-105 focus-visible:ring-[#ed203d]': 
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