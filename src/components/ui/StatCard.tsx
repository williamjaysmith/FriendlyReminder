'use client'

import { cn } from '@/lib/utils'
import { StatCardProps } from '@/lib/types'

const StatCard = ({
  title,
  value,
  change,
  icon,
  trend = 'neutral',
  className,
  children,
  ...props
}: StatCardProps) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-[#666]'
    }
  }

  const getTrendIcon = () => {
    if (trend === 'up') {
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      )
    }
    if (trend === 'down') {
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>
      )
    }
    return null
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-[#ddd] bg-white p-6 shadow-sm',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#666]">
            {title}
          </p>
          <p className="text-2xl font-bold text-[#262522]">
            {value}
          </p>
          {change !== undefined && (
            <div className={cn('flex items-center text-sm', getTrendColor())}>
              {getTrendIcon()}
              <span className="ml-1">
                {typeof change === 'number' ? `${change > 0 ? '+' : ''}${change}%` : change}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f5f5] text-[#666]">
            {icon}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

export default StatCard