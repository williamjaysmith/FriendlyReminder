'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

interface AsyncState<T> {
  data: T | null
  error: Error | null
  status: AsyncStatus
}

interface AsyncActions {
  execute: (promiseOrFn: Promise<any> | (() => Promise<any>)) => Promise<any>
  reset: () => void
}

interface AsyncReturn<T> extends AsyncState<T>, AsyncActions {
  isIdle: boolean
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

export function useAsync<T = any>(
  initialPromise?: Promise<T> | (() => Promise<T>)
): AsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    status: 'idle'
  })

  const currentPromiseRef = useRef<Promise<any> | null>(null)

  const execute = useCallback((promiseOrFn: Promise<T> | (() => Promise<T>)) => {
    setState(prev => ({ ...prev, status: 'loading', error: null }))
    
    const promise = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn
    currentPromiseRef.current = promise
    
    promise
      .then(data => {
        // Only update state if this is still the current promise
        if (currentPromiseRef.current === promise) {
          setState({ data, error: null, status: 'success' })
        }
      })
      .catch(error => {
        // Only update state if this is still the current promise
        if (currentPromiseRef.current === promise) {
          const errorObj = typeof error === 'string' ? error : (error instanceof Error ? error : new Error(String(error)))
          setState(prev => ({ 
            ...prev, 
            error: errorObj as any, 
            status: 'error'
          }))
        }
      })
      
    return promise
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, error: null, status: 'idle' })
  }, [])

  // Execute initial promise if provided
  useEffect(() => {
    if (initialPromise) {
      execute(initialPromise)
    }
  }, []) // Only run on mount

  return {
    ...state,
    execute,
    reset,
    isIdle: state.status === 'idle',
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error'
  }
}

export default useAsync