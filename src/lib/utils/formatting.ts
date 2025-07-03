// Formatting utility functions
import { DateFormat, DateInput } from '../types/utilities'

export const formatting = {
  // Date formatting
  date: (
    date: DateInput,
    format: DateFormat = 'short'
  ): string => {
    if (!date) return 'Never'
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) return 'Invalid Date'
    
    // Handle date-only strings (YYYY-MM-DD)
    if (typeof date === 'string' && date.length === 10 && date.includes('-')) {
      const [year, month, day] = date.split('-')
      const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return localDate.toLocaleDateString()
    }
    
    const options: Intl.DateTimeFormatOptions | undefined = {
      short: { dateStyle: 'short' as const },
      medium: { dateStyle: 'medium' as const },
      long: { dateStyle: 'long' as const },
      full: { dateStyle: 'full' as const },
      iso: undefined
    }[format]
    
    if (format === 'iso') {
      return dateObj.toISOString().split('T')[0]
    }
    
    return dateObj.toLocaleDateString(undefined, options)
  },

  // Relative time formatting
  relativeTime: (date: DateInput): string => {
    if (!date) return 'Never'
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return 'Invalid Date'
    
    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays === -1) return 'Tomorrow'
    if (diffDays > 0) return `${diffDays} days ago`
    return `In ${Math.abs(diffDays)} days`
  },

  // Number formatting
  number: (
    value: number,
    options: Intl.NumberFormatOptions = {}
  ): string => {
    return new Intl.NumberFormat(undefined, options).format(value)
  },

  // Currency formatting
  currency: (
    value: number,
    currency = 'USD'
  ): string => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency
    }).format(value)
  },

  // Percentage formatting
  percentage: (
    value: number,
    decimals = 1
  ): string => {
    return new Intl.NumberFormat(undefined, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100)
  },

  // Name formatting
  name: (
    firstName?: string,
    lastName?: string,
    format: 'first' | 'last' | 'full' | 'initials' = 'full'
  ): string => {
    const first = firstName?.trim() || ''
    const last = lastName?.trim() || ''
    
    switch (format) {
      case 'first':
        return first
      case 'last':
        return last
      case 'full':
        return [first, last].filter(Boolean).join(' ')
      case 'initials':
        return [first[0], last[0]].filter(Boolean).join('').toUpperCase()
      default:
        return [first, last].filter(Boolean).join(' ')
    }
  },

  // Phone number formatting
  phone: (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    }
    
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4')
    }
    
    return value
  },

  // Text formatting
  truncate: (
    text: string,
    length: number,
    suffix = '...'
  ): string => {
    if (text.length <= length) return text
    return text.substring(0, length).trim() + suffix
  },

  // Capitalize first letter
  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  },

  // Title case
  titleCase: (text: string): string => {
    return text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    )
  },

  // Slug formatting
  slug: (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  },

  // File size formatting
  fileSize: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
  },

  // Duration formatting
  duration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    }
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    
    return `${remainingSeconds}s`
  }
}

// Commonly used format functions
export const formatDateFormatted = formatting.date
export const formatRelativeTime = formatting.relativeTime
export const formatNumber = formatting.number
export const formatCurrency = formatting.currency
export const formatPercentage = formatting.percentage
export const formatName = formatting.name
export const formatPhone = formatting.phone
export const truncateText = formatting.truncate
export const capitalize = formatting.capitalize
export const titleCase = formatting.titleCase
export const createSlug = formatting.slug
export const formatFileSize = formatting.fileSize
export const formatDuration = formatting.duration