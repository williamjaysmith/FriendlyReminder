import { renderHook, act } from '@testing-library/react'
import { useAsync } from '../useAsync'

describe('useAsync Hook', () => {
  it('should initialize with idle state', () => {
    const { result } = renderHook(() => useAsync())
    
    expect(result.current.status).toBe('idle')
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.isIdle).toBe(true)
  })

  it('should handle successful async operation', async () => {
    const { result } = renderHook(() => useAsync<string>())
    
    const mockPromise = new Promise<string>(resolve => 
      setTimeout(() => resolve('success data'), 10)
    )
    
    act(() => {
      result.current.execute(mockPromise)
    })
    
    // Should be loading initially
    expect(result.current.status).toBe('loading')
    expect(result.current.isLoading).toBe(true)
    
    // Wait for promise to resolve
    await act(async () => {
      await mockPromise
    })
    
    expect(result.current.status).toBe('success')
    expect(result.current.data).toBe('success data')
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.isSuccess).toBe(true)
    expect(result.current.isIdle).toBe(false)
  })

  it('should handle failed async operation', async () => {
    const { result } = renderHook(() => useAsync<string>())
    
    const mockError = new Error('Test error')
    const mockPromise = new Promise<string>((_, reject) => 
      setTimeout(() => reject(mockError), 10)
    )
    
    act(() => {
      result.current.execute(mockPromise)
    })
    
    // Should be loading initially
    expect(result.current.status).toBe('loading')
    expect(result.current.isLoading).toBe(true)
    
    // Wait for promise to reject
    await act(async () => {
      try {
        await mockPromise
      } catch {
        // Expected to reject
      }
    })
    
    expect(result.current.status).toBe('error')
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe(mockError)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(true)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.isIdle).toBe(false)
  })

  it('should reset to idle state', async () => {
    const { result } = renderHook(() => useAsync<string>())
    
    // First execute an operation
    const mockPromise = Promise.resolve('success data')
    
    await act(async () => {
      result.current.execute(mockPromise)
      await mockPromise
    })
    
    expect(result.current.status).toBe('success')
    expect(result.current.data).toBe('success data')
    
    // Then reset
    act(() => {
      result.current.reset()
    })
    
    expect(result.current.status).toBe('idle')
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.isIdle).toBe(true)
  })

  it('should handle function that returns promise', async () => {
    const { result } = renderHook(() => useAsync<string>())
    
    const asyncFunction = async () => {
      return 'function result'
    }
    
    await act(async () => {
      result.current.execute(asyncFunction)
      await asyncFunction()
    })
    
    expect(result.current.status).toBe('success')
    expect(result.current.data).toBe('function result')
  })

  it('should handle function that throws error', async () => {
    const { result } = renderHook(() => useAsync<string>())
    
    const asyncFunction = async () => {
      throw new Error('Function error')
    }
    
    await act(async () => {
      result.current.execute(asyncFunction)
      try {
        await asyncFunction()
      } catch {
        // Expected to throw
      }
    })
    
    expect(result.current.status).toBe('error')
    expect(result.current.error?.message).toBe('Function error')
  })

  it('should handle concurrent executions correctly', async () => {
    const { result } = renderHook(() => useAsync<string>())
    
    const slowPromise = new Promise<string>(resolve => 
      setTimeout(() => resolve('slow result'), 100)
    )
    const fastPromise = Promise.resolve('fast result')
    
    // Start slow operation first
    await act(async () => {
      result.current.execute(slowPromise)
    })
    
    expect(result.current.status).toBe('loading')
    
    // Start fast operation (should override slow one)
    await act(async () => {
      result.current.execute(fastPromise)
      await fastPromise
    })
    
    expect(result.current.status).toBe('success')
    expect(result.current.data).toBe('fast result')
    
    // Wait for slow promise to complete (should be ignored)
    await act(async () => {
      await slowPromise
    })
    
    // Should still have fast result
    expect(result.current.data).toBe('fast result')
  })

  it('should initialize with immediate execution if provided', async () => {
    const mockPromise = Promise.resolve('immediate data')
    
    const { result } = renderHook(() => useAsync(mockPromise))
    
    expect(result.current.status).toBe('loading')
    expect(result.current.isLoading).toBe(true)
    
    await act(async () => {
      await mockPromise
    })
    
    expect(result.current.status).toBe('success')
    expect(result.current.data).toBe('immediate data')
  })

  it('should provide correct loading states for different operations', async () => {
    const { result } = renderHook(() => useAsync<string>())
    
    expect(result.current.isIdle).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.isError).toBe(false)
    
    const mockPromise = new Promise<string>(resolve => 
      setTimeout(() => resolve('data'), 50)
    )
    
    await act(async () => {
      result.current.execute(mockPromise)
    })
    
    expect(result.current.isIdle).toBe(false)
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.isError).toBe(false)
    
    await act(async () => {
      await mockPromise
    })
    
    expect(result.current.isIdle).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isSuccess).toBe(true)
    expect(result.current.isError).toBe(false)
  })

  it('should handle null and undefined data correctly', async () => {
    const { result } = renderHook(() => useAsync<string | null>())
    
    const nullPromise = Promise.resolve(null)
    
    await act(async () => {
      result.current.execute(nullPromise)
      await nullPromise
    })
    
    expect(result.current.status).toBe('success')
    expect(result.current.data).toBeNull()
    expect(result.current.isSuccess).toBe(true)
  })

  it('should handle string errors correctly', async () => {
    const { result } = renderHook(() => useAsync<string>())
    
    const stringErrorPromise = Promise.reject('String error')
    
    await act(async () => {
      result.current.execute(stringErrorPromise)
      try {
        await stringErrorPromise
      } catch {
        // Expected to reject
      }
    })
    
    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('String error')
  })
})