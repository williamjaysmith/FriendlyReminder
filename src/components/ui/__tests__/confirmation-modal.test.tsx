import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmationModal from '../confirmation-modal'

// Mock createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node
}))

describe('ConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    title: 'Test Title',
    message: 'Test message'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    document.body.style.overflow = ''
  })

  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('should render when open', () => {
    render(<ConfirmationModal {...defaultProps} />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test message')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
  })

  it('should call onConfirm when confirm button clicked', () => {
    render(<ConfirmationModal {...defaultProps} />)
    
    fireEvent.click(screen.getByText('Confirm'))
    
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when cancel button clicked', () => {
    render(<ConfirmationModal {...defaultProps} />)
    
    fireEvent.click(screen.getByText('Cancel'))
    
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when Escape key pressed', () => {
    render(<ConfirmationModal {...defaultProps} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('should use custom button text when provided', () => {
    render(
      <ConfirmationModal 
        {...defaultProps} 
        confirmText="Delete"
        cancelText="Keep"
      />
    )
    
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Keep')).toBeInTheDocument()
  })

  it('should set body overflow to hidden when open', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={true} />)
    
    expect(document.body.style.overflow).toBe('hidden')
  })
})