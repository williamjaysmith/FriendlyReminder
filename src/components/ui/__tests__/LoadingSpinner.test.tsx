import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('should render spinner', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('img', { hidden: true }) // SVG elements have img role
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('animate-spin')
  })

  it('should render different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    let spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('h-4', 'w-4')

    rerender(<LoadingSpinner size="md" />)
    spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('h-6', 'w-6')

    rerender(<LoadingSpinner size="lg" />)
    spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('h-8', 'w-8')
  })

  it('should apply custom color', () => {
    render(<LoadingSpinner color="#ff0000" />)
    
    const spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('text-[#ff0000]')
  })

  it('should render with children text', () => {
    render(<LoadingSpinner>Loading...</LoadingSpinner>)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toHaveClass('ml-2', 'text-sm', 'text-[#666]')
  })

  it('should not render text when no children', () => {
    render(<LoadingSpinner />)
    
    // Only the spinner should be present, no text
    const container = screen.getByRole('img', { hidden: true }).closest('div')
    expect(container?.textContent).toBe('')
  })

  it('should apply custom className', () => {
    render(<LoadingSpinner className="custom-spinner" />)
    
    const container = screen.getByRole('img', { hidden: true }).closest('div')
    expect(container).toHaveClass('custom-spinner')
  })

  it('should spread additional props', () => {
    render(<LoadingSpinner data-testid="loading-spinner" aria-label="Loading content" />)
    
    const container = screen.getByTestId('loading-spinner')
    expect(container).toHaveAttribute('aria-label', 'Loading content')
  })

  it('should have proper default styling', () => {
    render(<LoadingSpinner />)
    
    const container = screen.getByRole('img', { hidden: true }).closest('div')
    expect(container).toHaveClass('flex', 'items-center', 'justify-center')
    
    const spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('animate-spin', 'h-6', 'w-6') // Default medium size
  })

  it('should render both spinner and text correctly', () => {
    render(<LoadingSpinner size="lg">Please wait...</LoadingSpinner>)
    
    const spinner = screen.getByRole('img', { hidden: true })
    const text = screen.getByText('Please wait...')
    
    expect(spinner).toHaveClass('h-8', 'w-8')
    expect(text).toHaveClass('ml-2', 'text-sm', 'text-[#666]')
    
    // Check that both are in the same container
    const container = spinner.closest('div')
    expect(container).toContainElement(text)
  })

  it('should have correct SVG structure', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
    expect(spinner).toHaveAttribute('fill', 'none')
    expect(spinner).toHaveAttribute('viewBox', '0 0 24 24')
    
    // Check for circle and path elements
    const circle = spinner.querySelector('circle')
    const path = spinner.querySelector('path')
    
    expect(circle).toBeInTheDocument()
    expect(circle).toHaveAttribute('cx', '12')
    expect(circle).toHaveAttribute('cy', '12')
    expect(circle).toHaveAttribute('r', '10')
    expect(circle).toHaveClass('opacity-25')
    
    expect(path).toBeInTheDocument()
    expect(path).toHaveClass('opacity-75')
  })

  it('should work with different color formats', () => {
    const { rerender } = render(<LoadingSpinner color="red" />)
    let spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('text-[red]')

    rerender(<LoadingSpinner color="#123456" />)
    spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('text-[#123456]')

    rerender(<LoadingSpinner color="rgb(255, 0, 0)" />)
    spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('text-[rgb(255, 0, 0)]')
  })
})