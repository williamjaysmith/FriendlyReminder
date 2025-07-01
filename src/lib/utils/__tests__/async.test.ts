import { 
  debounce, 
  throttle, 
  sleep, 
  withTimeout, 
  batch, 
  retryWithBackoff, 
  PromiseQueue, 
  AsyncEventEmitter, 
  CancellablePromise 
} from '../async'

describe('async utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('debounce', () => {
    it('should debounce function calls', () => {
      const fn = jest.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn('arg1')
      debouncedFn('arg2')
      debouncedFn('arg3')

      expect(fn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(50)
      expect(fn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(50)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenLastCalledWith('arg3')
    })

    it('should reset timer on subsequent calls', () => {
      const fn = jest.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn('arg1')
      jest.advanceTimersByTime(50)
      debouncedFn('arg2')
      jest.advanceTimersByTime(50)
      
      expect(fn).not.toHaveBeenCalled()
      
      jest.advanceTimersByTime(50)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenLastCalledWith('arg2')
    })
  })

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const fn = jest.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn('arg1')
      throttledFn('arg2')
      throttledFn('arg3')

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('arg1')

      jest.advanceTimersByTime(100)
      throttledFn('arg4')

      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenLastCalledWith('arg4')
    })

    it('should not call function again within throttle period', () => {
      const fn = jest.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn('arg1')
      jest.advanceTimersByTime(50)
      throttledFn('arg2')

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('arg1')
    })
  })

  describe('sleep', () => {
    it('should resolve after specified time', async () => {
      jest.useRealTimers()
      
      const start = Date.now()
      await sleep(50)
      const end = Date.now()

      expect(end - start).toBeGreaterThanOrEqual(45)
    })
  })

  describe('withTimeout', () => {
    it('should resolve when promise resolves within timeout', async () => {
      jest.useRealTimers()
      
      const promise = new Promise(resolve => setTimeout(() => resolve('success'), 50))
      const result = await withTimeout(promise, 100)

      expect(result).toBe('success')
    })

    it('should reject when promise times out', async () => {
      jest.useRealTimers()
      
      const promise = new Promise(resolve => setTimeout(() => resolve('success'), 150))
      
      await expect(withTimeout(promise, 100)).rejects.toThrow('Operation timed out')
    })

    it('should use custom timeout message', async () => {
      jest.useRealTimers()
      
      const promise = new Promise(resolve => setTimeout(() => resolve('success'), 150))
      
      await expect(withTimeout(promise, 100, 'Custom timeout')).rejects.toThrow('Custom timeout')
    })
  })

  describe('batch', () => {
    it('should process items in batches', async () => {
      jest.useRealTimers()
      
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const processor = jest.fn().mockImplementation(async (item: number) => item * 2)
      
      const results = await batch(items, processor, 3)
      
      expect(results).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20])
      expect(processor).toHaveBeenCalledTimes(10)
    })

    it('should handle empty array', async () => {
      const processor = jest.fn()
      const results = await batch([], processor, 3)
      
      expect(results).toEqual([])
      expect(processor).not.toHaveBeenCalled()
    })
  })

  describe('retryWithBackoff', () => {
    it('should succeed on first try', async () => {
      jest.useRealTimers()
      
      const fn = jest.fn().mockResolvedValue('success')
      const result = await retryWithBackoff(fn, 3, 100)
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure with exponential backoff', async () => {
      jest.useRealTimers()
      
      let attempts = 0
      const fn = jest.fn().mockImplementation(async () => {
        attempts++
        if (attempts < 3) {
          throw new Error('Temporary failure')
        }
        return 'success'
      })
      
      const result = await retryWithBackoff(fn, 3, 10, 1000)
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('should fail after max retries', async () => {
      jest.useRealTimers()
      
      const fn = jest.fn().mockRejectedValue(new Error('Persistent failure'))
      
      await expect(retryWithBackoff(fn, 2, 10)).rejects.toThrow('Persistent failure')
      expect(fn).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })
  })

  describe('PromiseQueue', () => {
    it('should process promises sequentially', async () => {
      jest.useRealTimers()
      
      const queue = new PromiseQueue()
      const results: number[] = []
      
      const task1 = () => new Promise<void>(resolve => {
        setTimeout(() => {
          results.push(1)
          resolve()
        }, 50)
      })
      
      const task2 = () => new Promise<void>(resolve => {
        setTimeout(() => {
          results.push(2)
          resolve()
        }, 30)
      })
      
      const task3 = () => new Promise<void>(resolve => {
        setTimeout(() => {
          results.push(3)
          resolve()
        }, 10)
      })
      
      const promises = [
        queue.add(task1),
        queue.add(task2),
        queue.add(task3)
      ]
      
      await Promise.all(promises)
      
      expect(results).toEqual([1, 2, 3])
    })

    it('should handle task failures', async () => {
      jest.useRealTimers()
      
      const queue = new PromiseQueue()
      
      const task1 = () => Promise.resolve('success')
      const task2 = () => Promise.reject(new Error('failure'))
      const task3 = () => Promise.resolve('success2')
      
      const results = await Promise.allSettled([
        queue.add(task1),
        queue.add(task2),
        queue.add(task3)
      ])
      
      expect(results[0].status).toBe('fulfilled')
      expect(results[1].status).toBe('rejected')
      expect(results[2].status).toBe('fulfilled')
    })
  })

  describe('AsyncEventEmitter', () => {
    let emitter: AsyncEventEmitter

    beforeEach(() => {
      emitter = new AsyncEventEmitter()
    })

    it('should emit and listen to events', () => {
      const callback = jest.fn()
      
      emitter.on('test-event', callback)
      emitter.emit('test-event', 'test-data')
      
      expect(callback).toHaveBeenCalledWith('test-data')
    })

    it('should support multiple listeners', () => {
      const callback1 = jest.fn()
      const callback2 = jest.fn()
      
      emitter.on('test-event', callback1)
      emitter.on('test-event', callback2)
      emitter.emit('test-event', 'test-data')
      
      expect(callback1).toHaveBeenCalledWith('test-data')
      expect(callback2).toHaveBeenCalledWith('test-data')
    })

    it('should unsubscribe listeners', () => {
      const callback = jest.fn()
      
      const unsubscribe = emitter.on('test-event', callback)
      unsubscribe()
      emitter.emit('test-event', 'test-data')
      
      expect(callback).not.toHaveBeenCalled()
    })

    it('should support once listeners', () => {
      const callback = jest.fn()
      
      emitter.once('test-event', callback)
      emitter.emit('test-event', 'test-data1')
      emitter.emit('test-event', 'test-data2')
      
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('test-data1')
    })

    it('should remove all listeners for event', () => {
      const callback1 = jest.fn()
      const callback2 = jest.fn()
      
      emitter.on('test-event', callback1)
      emitter.on('test-event', callback2)
      emitter.off('test-event')
      emitter.emit('test-event', 'test-data')
      
      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).not.toHaveBeenCalled()
    })

    it('should handle callback errors gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error')
      })
      const successCallback = jest.fn()
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      emitter.on('test-event', errorCallback)
      emitter.on('test-event', successCallback)
      emitter.emit('test-event', 'test-data')
      
      expect(errorCallback).toHaveBeenCalled()
      expect(successCallback).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('CancellablePromise', () => {
    it('should resolve normally when not cancelled', async () => {
      jest.useRealTimers()
      
      const promise = new CancellablePromise<string>((resolve) => {
        setTimeout(() => resolve('success'), 50)
      })
      
      const result = await promise
      expect(result).toBe('success')
    })

    it('should not resolve when cancelled', async () => {
      jest.useRealTimers()
      
      const promise = new CancellablePromise<string>((resolve) => {
        setTimeout(() => resolve('success'), 100)
      })
      
      promise.cancel()
      
      // Promise should not resolve, so we use race with a timeout
      const result = await Promise.race([
        promise.then(() => 'resolved'),
        new Promise(resolve => setTimeout(() => resolve('timeout'), 150))
      ])
      
      expect(result).toBe('timeout')
    })

    it('should not reject when cancelled', async () => {
      jest.useRealTimers()
      
      const promise = new CancellablePromise<string>((_, reject) => {
        setTimeout(() => reject(new Error('failure')), 100)
      })
      
      promise.cancel()
      
      // Promise should not reject, so we use race with a timeout
      const result = await Promise.race([
        promise.catch(() => 'rejected'),
        new Promise(resolve => setTimeout(() => resolve('timeout'), 150))
      ])
      
      expect(result).toBe('timeout')
    })

    it('should support then, catch, and finally', async () => {
      jest.useRealTimers()
      
      const promise = new CancellablePromise<string>((resolve) => {
        setTimeout(() => resolve('success'), 50)
      })
      
      const thenCallback = jest.fn(value => value.toUpperCase())
      const finallyCallback = jest.fn()
      
      const result = await promise
        .then(thenCallback)
        .finally(finallyCallback)
      
      expect(result).toBe('SUCCESS')
      expect(thenCallback).toHaveBeenCalledWith('success')
      expect(finallyCallback).toHaveBeenCalled()
    })
  })
})