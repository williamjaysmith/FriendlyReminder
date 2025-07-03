import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../Modal'

// Mock createPortal to render directly
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children
}))

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Modal content</div>
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset body overflow style
    document.body.style.overflow = 'unset'
  })

  it('should render when open', () => {
    render(<Modal {...defaultProps} />)
    
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('should render with title', () => {
    render(<Modal {...defaultProps} title="Test Modal" />)
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Modal')
  })

  it('should render close button by default', () => {
    render(<Modal {...defaultProps} />)
    
    const closeButton = screen.getByRole('button', { name: /close/i })
    expect(closeButton).toBeInTheDocument()
  })

  it('should not render close button when preventClosing is true', () => {
    render(<Modal {...defaultProps} preventClosing />)
    
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    // Click on the backdrop (the outer div with backdrop click handler)
    const backdrop = screen.getByText('Modal content').closest('[role=\"dialog\"]')?.parentElement
    if (backdrop) {
      await user.click(backdrop)
      expect(onClose).toHaveBeenCalledTimes(1)
    }
  })

  it('should not call onClose when modal content is clicked', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    await user.click(screen.getByText('Modal content'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should not close when preventClosing is true', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    
    render(<Modal {...defaultProps} onClose={onClose} preventClosing />)
    
    // Try to click backdrop
    const backdrop = screen.getByText('Modal content').closest('div')?.parentElement
    if (backdrop) {
      await user.click(backdrop)
      expect(onClose).not.toHaveBeenCalled()
    }
  })

  it('should handle escape key', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should not handle escape key when preventClosing is true', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} preventClosing />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should set body overflow to hidden when open', () => {
    render(<Modal {...defaultProps} />)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('should restore body overflow when closed', () => {
    const { rerender } = render(<Modal {...defaultProps} />)
    expect(document.body.style.overflow).toBe('hidden')
    
    rerender(<Modal {...defaultProps} isOpen={false} />)
    expect(document.body.style.overflow).toBe('unset')
  })

  it('should render different sizes', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />)
    let modal = screen.getByText('Modal content').closest('.max-w-md')
    expect(modal).toBeInTheDocument()

    rerender(<Modal {...defaultProps} size="md" />)
    modal = screen.getByText('Modal content').closest('.max-w-lg')
    expect(modal).toBeInTheDocument()

    rerender(<Modal {...defaultProps} size="lg" />)
    modal = screen.getByText('Modal content').closest('.max-w-2xl')
    expect(modal).toBeInTheDocument()

    rerender(<Modal {...defaultProps} size="xl" />)
    modal = screen.getByText('Modal content').closest('.max-w-4xl')
    expect(modal).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<Modal {...defaultProps} className="custom-modal" />)
    
    const modal = screen.getByText('Modal content').closest('.custom-modal')
    expect(modal).toBeInTheDocument()
  })

  it('should spread additional props', () => {
    render(<Modal {...defaultProps} data-testid="custom-modal" />)
    
    expect(screen.getByTestId('custom-modal')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<Modal {...defaultProps} title="Accessible Modal" />)
    
    const modal = screen.getByRole('dialog')
    expect(modal).toBeInTheDocument()
    expect(modal).toHaveAttribute('aria-modal', 'true')
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title')
    
    // Check that title has the correct id
    const title = screen.getByText('Accessible Modal')
    expect(title).toHaveAttribute('id', 'modal-title')
  })

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')
    const { unmount } = render(<Modal {...defaultProps} />)
    
    unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(document.body.style.overflow).toBe('unset')
    
    removeEventListenerSpy.mockRestore()
  })

  it('should handle multiple modals correctly', () => {
    const onClose1 = jest.fn()
    const onClose2 = jest.fn()
    
    const { rerender } = render(<Modal isOpen={true} onClose={onClose1}>Modal 1</Modal>)
    expect(document.body.style.overflow).toBe('hidden')
    
    rerender(
      <>
        <Modal isOpen={true} onClose={onClose1}>Modal 1</Modal>
        <Modal isOpen={true} onClose={onClose2}>Modal 2</Modal>
      </>
    )
    
    expect(screen.getByText('Modal 1')).toBeInTheDocument()
    expect(screen.getByText('Modal 2')).toBeInTheDocument()
  })
})