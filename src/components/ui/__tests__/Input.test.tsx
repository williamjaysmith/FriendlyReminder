import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Input from '../input'

describe('Input', () => {
  it('should render with default props', () => {
    render(<Input />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
    expect(input).not.toBeDisabled()
    expect(input).not.toBeRequired()
  })

  it('should render different input types', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" />)
    const passwordInput = document.querySelector('input[type="password"]')
    expect(passwordInput).toHaveAttribute('type', 'password')

    rerender(<Input type="number" />)
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
  })

  it('should handle value and defaultValue', () => {
    const { rerender } = render(<Input value="test value" onChange={() => {}} />)
    expect(screen.getByDisplayValue('test value')).toBeInTheDocument()

    // Completely re-render with different props
    rerender(<Input key="different" defaultValue="default value" />)
    const inputWithDefault = document.querySelector('input[type="text"]') as HTMLInputElement
    expect(inputWithDefault?.value).toBe('default value')
  })

  it('should handle placeholder', () => {
    render(<Input placeholder="Enter your name" />)
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
  })

  it('should handle disabled state', () => {
    render(<Input disabled />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('should handle required state', () => {
    render(<Input required />)
    expect(screen.getByRole('textbox')).toBeRequired()
  })

  it('should handle name and id attributes', () => {
    render(<Input name="username" id="username-input" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('name', 'username')
    expect(input).toHaveAttribute('id', 'username-input')
  })

  it('should call onChange when user types', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'hello')
    
    expect(handleChange).toHaveBeenCalledTimes(5) // One for each character
    expect(handleChange).toHaveBeenLastCalledWith('hello')
  })

  it('should call onBlur when input loses focus', async () => {
    const user = userEvent.setup()
    const handleBlur = jest.fn()
    
    render(<Input onBlur={handleBlur} />)
    
    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.tab()
    
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('should show error state', () => {
    render(<Input error="This field is required" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-500', 'focus-visible:ring-red-500')
  })

  it('should apply custom className', () => {
    render(<Input className="custom-input" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-input')
  })

  it('should forward ref', () => {
    const ref = { current: null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('should spread additional props', () => {
    render(<Input data-testid="custom-input" aria-describedby="help-text" />)
    
    const input = screen.getByTestId('custom-input')
    expect(input).toHaveAttribute('aria-describedby', 'help-text')
  })

  it('should handle controlled input', async () => {
    const user = userEvent.setup()
    let value = ''
    const handleChange = jest.fn((newValue: string) => {
      value = newValue
    })

    const { rerender } = render(<Input value={value} onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'test')
    
    // Simulate parent component updating
    rerender(<Input value="test" onChange={handleChange} />)
    expect(screen.getByDisplayValue('test')).toBeInTheDocument()
  })

  it('should not call onChange when disabled', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    
    render(<Input disabled onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'test')
    
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('should have proper focus styles', () => {
    render(<Input />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-[#fcba28]',
      'focus-visible:ring-offset-2'
    )
  })
})