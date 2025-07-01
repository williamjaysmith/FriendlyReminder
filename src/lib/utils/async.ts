// Async utilities and helpers
import { useState } from 'react'
import { AsyncState, AsyncAction, EventCallback, EventUnsubscribe } from '../types/utilities'

// Debounce function calls
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

// Throttle function calls
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Sleep utility
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Timeout wrapper for promises
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): Promise<T> => {
  return Promise.race([
    promise,
    sleep(timeoutMs).then(() => {
      throw new Error(timeoutMessage)
    })
  ])
}

// Batch async operations
export const batch = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> => {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(processor))
    results.push(...batchResults)
  }
  
  return results
}

// Retry with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 30000
): Promise<T> => {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === maxRetries) {
        throw lastError
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      await sleep(delay)
    }
  }

  throw lastError!
}

// Promise queue for sequential execution
export class PromiseQueue {
  private queue: Array<() => Promise<any>> = []
  private running = false

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      if (!this.running) {
        this.process()
      }
    })
  }

  private async process(): Promise<void> {
    if (this.running || this.queue.length === 0) {
      return
    }

    this.running = true

    while (this.queue.length > 0) {
      const task = this.queue.shift()!
      await task()
    }

    this.running = false
  }
}

// Async state management hook (for React components)
export const useAsyncState = <T>(
  initialState: AsyncState<T> = { data: null, loading: false, error: null }
): [AsyncState<T>, {
  execute: (asyncFn: AsyncAction<T>) => Promise<void>
  reset: () => void
  setData: (data: T) => void
  setError: (error: Error) => void
}] => {
  const [state, setState] = useState<AsyncState<T>>(initialState)

  const execute = async (asyncFn: AsyncAction<T>): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const data = await asyncFn()
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error : new Error(String(error))
      }))
    }
  }

  const reset = (): void => {
    setState(initialState)
  }

  const setData = (data: T): void => {
    setState(prev => ({ ...prev, data }))
  }

  const setError = (error: Error): void => {
    setState(prev => ({ ...prev, error, loading: false }))
  }

  return [state, { execute, reset, setData, setError }]
}

// Event emitter for async operations
export class AsyncEventEmitter {
  private events: Map<string, EventCallback[]> = new Map()

  on(event: string, callback: EventCallback): EventUnsubscribe {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    
    this.events.get(event)!.push(callback)
    
    return () => {
      const callbacks = this.events.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  emit(event: string, data?: any): void {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in event callback:', error)
        }
      })
    }
  }

  off(event: string, callback?: EventCallback): void {
    if (!callback) {
      this.events.delete(event)
      return
    }

    const callbacks = this.events.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  once(event: string, callback: EventCallback): EventUnsubscribe {
    const wrappedCallback = (data: any) => {
      callback(data)
      this.off(event, wrappedCallback)
    }

    return this.on(event, wrappedCallback)
  }
}

// Cancellable promise wrapper
export class CancellablePromise<T> {
  private promise: Promise<T>
  private cancelled = false

  constructor(executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void) {
    this.promise = new Promise<T>((resolve, reject) => {
      executor(
        (value: T) => {
          if (!this.cancelled) {
            resolve(value)
          }
        },
        (reason?: any) => {
          if (!this.cancelled) {
            reject(reason)
          }
        }
      )
    })
  }

  cancel(): void {
    this.cancelled = true
  }

  then<R1 = T, R2 = never>(
    onFulfilled?: ((value: T) => R1 | PromiseLike<R1>) | null,
    onRejected?: ((reason: any) => R2 | PromiseLike<R2>) | null
  ): Promise<R1 | R2> {
    return this.promise.then(onFulfilled, onRejected)
  }

  catch<R = never>(
    onRejected?: ((reason: any) => R | PromiseLike<R>) | null
  ): Promise<T | R> {
    return this.promise.catch(onRejected)
  }

  finally(onFinally?: (() => void) | null): Promise<T> {
    return this.promise.finally(onFinally)
  }
}

// Commonly used instances
export const promiseQueue = new PromiseQueue()
export const asyncEventEmitter = new AsyncEventEmitter()

