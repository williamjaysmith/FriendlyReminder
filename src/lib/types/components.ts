// Component prop types and interfaces
import { ReactNode } from 'react'

// Common component props
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
}

// Button component types
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  style?: React.CSSProperties
  onClick?: () => void
}

// Input component types
export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date'
  placeholder?: string
  value?: string
  defaultValue?: string
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  min?: string
  max?: string
  error?: string
}

// Form component types
export interface FormFieldProps extends BaseComponentProps {
  label: string
  name: string
  required?: boolean
  min?: string
  max?: string
  error?: string
  children: ReactNode
}

export interface FormProps extends BaseComponentProps {
  onSubmit: (data: any) => void
  loading?: boolean
}

// Card component types
export interface CardProps extends BaseComponentProps {
  title?: string
  description?: string
  actions?: ReactNode
  hoverable?: boolean
}

// Modal component types
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  preventClosing?: boolean
}

// Loading component types
export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

// Toast/Notification types
export interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
}

// Table component types
export interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => ReactNode
  width?: string
}

export interface TableProps<T> extends BaseComponentProps {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
  selectable?: boolean
  onSelectionChange?: (selected: T[]) => void
}

// Layout component types
export interface LayoutProps extends BaseComponentProps {
  title?: string
  description?: string
  actions?: ReactNode
  sidebar?: ReactNode
  breadcrumbs?: { label: string; href?: string }[]
}

// Navigation types
export interface NavItem {
  label: string
  href: string
  icon?: ReactNode
  badge?: string | number
  active?: boolean
}

// Dashboard component types
export interface StatCardProps extends BaseComponentProps {
  title: string
  value: string | number
  change?: number
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

// Contact component types
export interface ContactCardProps extends BaseComponentProps {
  contact: any // Replace with proper Contact type
  onEdit?: () => void
  onDelete?: () => void
  onViewDetails?: () => void
}

// Error boundary types
export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}