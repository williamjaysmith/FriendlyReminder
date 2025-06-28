'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoExpand?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoExpand = false, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    
    // Merge refs
    React.useImperativeHandle(ref, () => textareaRef.current!)

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (textarea && autoExpand) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [autoExpand])

    React.useEffect(() => {
      if (autoExpand) {
        adjustHeight()
      }
    }, [props.value, autoExpand, adjustHeight])

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (autoExpand) {
        adjustHeight()
      }
      if (props.onInput) {
        props.onInput(e)
      }
    }

    return (
      <textarea
        className={cn(
          'flex w-full rounded-md border border-[#231f20]/30 bg-[#fefaf0] px-3 py-2 text-sm text-[#231f20] placeholder:text-[#262522] focus:outline-none focus:ring-2 focus:ring-[#fcba28] focus:border-transparent resize-none',
          autoExpand ? 'overflow-hidden' : 'min-h-[80px]',
          className
        )}
        ref={textareaRef}
        onInput={handleInput}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }