// Utility types and helper interfaces

// Common utility types
export type Maybe<T> = T | null | undefined
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Date utility types
export type DateInput = string | Date | null | undefined
export type DateFormat = 'short' | 'medium' | 'long' | 'full' | 'iso'

// Validation types
export type ValidationRule<T> = {
  test: (value: T) => boolean
  message: string
}

export type Validator<T> = {
  required?: boolean
  rules?: ValidationRule<T>[]
}

// Storage types
export type StorageKey = string
export type StorageValue = string | number | boolean | object | null

// Event types
export type EventCallback<T = any> = (data: T) => void
export type EventUnsubscribe = () => void

// Async utility types
export type AsyncState<T> = {
  data: T | null
  loading: boolean
  error: Error | null
}

export type AsyncAction<T, P = void> = (params: P) => Promise<T>

// Filter and sort types
export type SortDirection = 'asc' | 'desc'
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith'

export interface FilterCondition {
  field: string
  operator: FilterOperator
  value: any
}

export interface SortCondition {
  field: string
  direction: SortDirection
}

// Search types
export interface SearchOptions {
  fields?: string[]
  caseSensitive?: boolean
  exactMatch?: boolean
  minLength?: number
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system'
export type ColorScheme = 'default' | 'high-contrast' | 'colorful'

// Responsive types
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type ResponsiveValue<T> = T | { [K in Breakpoint]?: T }

// Error types
export interface ErrorContext {
  component?: string
  action?: string
  timestamp?: Date
  userId?: string
  metadata?: Record<string, any>
}

// Performance types
export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage?: number
  networkRequests?: number
}

// Feature flag types
export type FeatureFlag = string
export type FeatureFlags = Record<FeatureFlag, boolean>

// Configuration types
export interface AppConfig {
  apiUrl: string
  environment: 'development' | 'staging' | 'production'
  features: FeatureFlags
  theme: {
    mode: ThemeMode
    colorScheme: ColorScheme
  }
  performance: {
    enableMetrics: boolean
    enableProfiling: boolean
  }
}

// Query and pagination types
export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  sort?: string
  filter?: Record<string, any>
}
// Generic CRUD types
export interface CrudOperations<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
  create: (data: CreateData) => Promise<T>
  read: (id: string) => Promise<T | null>
  update: (id: string, data: UpdateData) => Promise<T>
  delete: (id: string) => Promise<void>
  list: (options?: QueryParams) => Promise<T[]>
}

// State management types
export interface StateSlice<T> {
  state: T
  actions: Record<string, (...args: any[]) => void>
  selectors: Record<string, (state: T) => any>
}

// Cache types
export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export interface CacheOptions {
  ttl?: number
  serialize?: boolean
  key?: string
}