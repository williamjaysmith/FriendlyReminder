import { renderHook, act } from '@testing-library/react'
import { useConfirmation } from '../useConfirmation'

describe('useConfirmation', () => {
  it('initializes with closed state', () => {
    const { result } = renderHook(() => useConfirmation())
    
    expect(result.current.confirmation.isOpen).toBe(false)
  })

  it('opens confirmation modal with provided options', async () => {
    const { result } = renderHook(() => useConfirmation())
    
    let confirmResult: boolean | undefined = undefined
    
    act(() => {
      result.current.confirm({
        title: 'Test Title',
        message: 'Test Message',
        confirmText: 'Yes',
        cancelText: 'No'
      }).then((confirmed) => {
        confirmResult = confirmed
      })
    })
    
    expect(result.current.confirmation.isOpen).toBe(true)
    expect(result.current.confirmation.title).toBe('Test Title')
    expect(result.current.confirmation.message).toBe('Test Message')
    expect(result.current.confirmation.confirmText).toBe('Yes')
    expect(result.current.confirmation.cancelText).toBe('No')
  })

  it('resolves with true when confirmed', async () => {
    const { result } = renderHook(() => useConfirmation())
    
    let confirmResult: boolean | undefined = undefined
    
    act(() => {
      result.current.confirm({
        title: 'Test',
        message: 'Test'
      }).then((confirmed) => {
        confirmResult = confirmed
      })
    })
    
    // Simulate confirming
    act(() => {
      result.current.confirmation.onConfirm()
    })
    
    // Wait for promise to resolve
    await act(async () => {
      await Promise.resolve()
    })
    
    expect(confirmResult).toBe(true)
    expect(result.current.confirmation.isOpen).toBe(false)
  })

  it('resolves with false when cancelled', async () => {
    const { result } = renderHook(() => useConfirmation())
    
    let confirmResult: boolean | undefined = undefined
    
    act(() => {
      result.current.confirm({
        title: 'Test',
        message: 'Test'
      }).then((confirmed) => {
        confirmResult = confirmed
      })
    })
    
    // Simulate cancelling
    act(() => {
      result.current.confirmation.onCancel()
    })
    
    // Wait for promise to resolve
    await act(async () => {
      await Promise.resolve()
    })
    
    expect(confirmResult).toBe(false)
    expect(result.current.confirmation.isOpen).toBe(false)
  })

  it('can be hidden manually', () => {
    const { result } = renderHook(() => useConfirmation())
    
    act(() => {
      result.current.confirm({
        title: 'Test',
        message: 'Test'
      })
    })
    
    expect(result.current.confirmation.isOpen).toBe(true)
    
    act(() => {
      result.current.hideConfirmation()
    })
    
    expect(result.current.confirmation.isOpen).toBe(false)
  })
})