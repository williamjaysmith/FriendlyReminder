// API response types and interfaces
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Query types
export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  sort?: string
  filter?: Record<string, any>
}

// Database operation types
export interface DatabaseResponse<T> {
  documents: T[]
  total: number
}

export interface CreateResponse {
  id: string
  success: boolean
}

export interface UpdateResponse {
  success: boolean
  updated: number
}

export interface DeleteResponse {
  success: boolean
  deleted: number
}

// Service method types
export interface ServiceResponse<T> {
  data?: T
  error?: ApiError
  loading?: boolean
}

// Supabase specific types
export interface SupabaseResponse<T> {
  data: T | null
  error: any
  count?: number
}

// Batch operation types
export interface BatchOperation<T> {
  action: 'create' | 'update' | 'delete'
  data: T
  id?: string
}

export interface BatchResponse {
  success: boolean
  results: {
    created: number
    updated: number
    deleted: number
    failed: number
  }
  errors?: ApiError[]
}