import { useState, useCallback } from 'react'

interface ConfirmationOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger'
}

interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const useConfirmation = () => {
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmVariant: 'danger',
    onConfirm: () => {},
    onCancel: () => {}
  })

  const confirm = useCallback((
    options: ConfirmationOptions
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmation({
        ...options,
        isOpen: true,
        onConfirm: () => {
          setConfirmation(prev => ({ ...prev, isOpen: false }))
          resolve(true)
        },
        onCancel: () => {
          setConfirmation(prev => ({ ...prev, isOpen: false }))
          resolve(false)
        }
      })
    })
  }, [])

  const hideConfirmation = useCallback(() => {
    setConfirmation(prev => ({ ...prev, isOpen: false }))
  }, [])

  return {
    confirmation,
    confirm,
    hideConfirmation
  }
}