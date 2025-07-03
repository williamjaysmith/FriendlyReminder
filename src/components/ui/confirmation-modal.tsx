'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Button from './button'

interface ConfirmationModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger'
}

const ConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger'
}: ConfirmationModalProps) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Modal Card */}
      <div
        className="relative w-full max-w-md bg-[#f9f4da] rounded-[20px] transition-all duration-300 ease-in-out"
        style={{
          boxShadow: "8px 8px 0px #E4405F"
        }}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <h3 className="text-xl font-bold leading-none tracking-tight text-[#231f20] mb-3">
            {title}
          </h3>
          <p className="text-sm text-[#262522] leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Footer with buttons */}
        <div className="flex items-center justify-end gap-3 p-6 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-[#262522] text-[#262522] hover:bg-[#6b6864] hover:text-[#f9f4da]"
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            className={confirmVariant === 'danger' ? 'bg-[#E4405F] text-[#f9f4da] hover:bg-[#CC3A56]' : ''}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ConfirmationModal