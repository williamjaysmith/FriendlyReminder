'use client'

import { useState, useEffect } from 'react'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  id?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, id, disabled = false }: ToggleProps) {
  const [isChecked, setIsChecked] = useState(checked)

  useEffect(() => {
    setIsChecked(checked)
  }, [checked])

  const handleToggle = () => {
    if (disabled) return
    const newValue = !isChecked
    setIsChecked(newValue)
    onChange(newValue)
  }

  return (
    <div className="flex items-center space-x-3">
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-labelledby={id}
        disabled={disabled}
        onClick={handleToggle}
        className={`
          relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ease-in-out
          flex-shrink-0 min-w-[3rem] min-h-[1.75rem]
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        `}
        style={{
          background: isChecked 
            ? 'linear-gradient(135deg, #0ba95b, #10b981)'
            : 'linear-gradient(135deg, #8a8986, #9a9896)',
          boxShadow: isChecked 
            ? `
              inset 0 3px 6px rgba(0, 0, 0, 0.4),
              inset 0 1px 2px rgba(0, 0, 0, 0.5),
              0 1px 3px rgba(0, 0, 0, 0.2),
              0 0 0 1px rgba(0, 0, 0, 0.1)
            `
            : `
              inset 0 3px 6px rgba(35, 31, 32, 0.3),
              inset 0 1px 2px rgba(35, 31, 32, 0.4),
              0 1px 3px rgba(0, 0, 0, 0.15),
              0 0 0 1px rgba(35, 31, 32, 0.1)
            `
        }}
      >
        <span
          className={`
            inline-block h-5 w-5 rounded-full transition-all duration-300 ease-in-out
            flex-shrink-0 min-w-[1.25rem] min-h-[1.25rem]
            transform ${isChecked ? 'translate-x-6' : 'translate-x-1'}
          `}
          style={{
            background: 'linear-gradient(145deg, #f9f4da, #f5f0c8)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: `
              0 2px 4px rgba(0, 0, 0, 0.25),
              0 1px 2px rgba(0, 0, 0, 0.15),
              inset 0 1px 2px rgba(255, 255, 255, 0.5),
              inset 0 -1px 1px rgba(0, 0, 0, 0.1)
            `
          }}
        />
      </button>
      {label && (
        <label 
          id={id}
          className="text-sm font-medium cursor-pointer select-none"
          style={{ color: 'var(--text-primary)' }}
          onClick={handleToggle}
        >
          {label}
        </label>
      )}
    </div>
  )
}