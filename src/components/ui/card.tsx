import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

type CardVariant = 'default' | 'purple' | 'blue' | 'green' | 'yellow' | 'pink' | 'orange'

const cardVariants: Record<CardVariant, string> = {
  default: 'bg-[var(--card-background)] border-[var(--text-primary)]',
  purple: 'bg-[var(--brand-purple)]',
  blue: 'bg-[var(--brand-blue)]',
  green: 'bg-[var(--brand-green)]',
  yellow: 'bg-[var(--brand-yellow)]',
  pink: 'bg-[var(--brand-pink)]',
  orange: 'bg-[var(--brand-orange)]',
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const isColored = variant !== 'default'
    
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'transition-all duration-300 ease-in-out hover:-translate-y-1 rounded-[var(--outer-radius)]',
          // Light mode: thick beige border with thin charcoal lines (for containers)
          // Dark mode: simple border
          !isColored && [
            'border-8 border-[var(--brand-beige)]', // Thick beige border in light mode
            'dark:border-2 dark:border-[var(--brand-beige)]', // Simple border in dark mode
            // Add the charcoal accent lines for light mode
            'shadow-[inset_0_0_0_2px_var(--brand-charcoal),0_0_0_calc(8px+2px)_var(--brand-charcoal)]',
            'dark:shadow-none'
          ],
          // Colored variants: cartoony style with gap
          isColored && 'p-[var(--card-gap)] border-4 border-[var(--brand-charcoal)]',
          cardVariants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const isColored = variant !== 'default'
    
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col space-y-1.5',
          isColored 
            ? 'p-6 bg-[var(--brand-beige)] rounded-[var(--inner-radius)]' 
            : 'p-6',
          className
        )}
        {...props}
      />
    )
  }
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-bold leading-none tracking-tight text-[var(--text-primary)]', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-[var(--text-secondary)]', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const isColored = variant !== 'default'
    
    return (
      <div 
        ref={ref} 
        className={cn(
          isColored 
            ? 'p-6 pt-0 bg-[var(--brand-beige)] rounded-[var(--inner-radius)]'
            : 'p-6 pt-0', 
          className
        )} 
        {...props} 
      />
    )
  }
)
CardContent.displayName = 'CardContent'

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const isColored = variant !== 'default'
    
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          isColored 
            ? 'p-6 pt-0 bg-[var(--brand-beige)] rounded-[var(--inner-radius)]'
            : 'p-6 pt-0',
          className
        )}
        {...props}
      />
    )
  }
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }