'use client'

import { useState, useCallback } from 'react'
import { AsyncState, AsyncAction } from '@/lib/types'

// Custom hook for managing async operations
export function useAsync<T>(
  initialState: AsyncState<T> = { data: null, loading: false, error: null }
) {
  const [state, setState] = useState<AsyncState<T>>(initialState)

  const execute = useCallback(async (asyncFn: AsyncAction<T, any>): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const data = await asyncFn()
      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorObj
      }))
      return null
    }
  }, [])

  const reset = useCallback((): void => {
    setState(initialState)
  }, [initialState])

  const setData = useCallback((data: T): void => {
    setState(prev => ({ ...prev, data }))
  }, [])

  const setError = useCallback((error: Error): void => {
    setState(prev => ({ ...prev, error, loading: false }))
  }, [])

  const setLoading = useCallback((loading: boolean): void => {
    setState(prev => ({ ...prev, loading }))
  }, [])

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
    setLoading
  }
}

export default useAsync