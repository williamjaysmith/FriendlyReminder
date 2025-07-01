import { render, screen } from '@testing-library/react'
import FormField from '../FormField'
import Input from '../Input'

describe('FormField', () => {
  it('should render label and children', () => {
    render(
      <FormField label="Username" name="username">
        <Input name="username" />
      </FormField>
    )
    
    expect(screen.getByText('Username')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should associate label with input using htmlFor', () => {
    render(
      <FormField label="Email" name="email">
        <Input name="email" id="email" />
      </FormField>
    )
    
    const label = screen.getByText('Email')
    const input = screen.getByRole('textbox')
    
    expect(label).toHaveAttribute('for', 'email')
    expect(input).toHaveAttribute('id', 'email')
  })

  it('should show required indicator when required', () => {
    render(
      <FormField label="Password" name="password" required>
        <Input name="password" type="password" />
      </FormField>
    )
    
    const label = screen.getByText('Password')
    expect(label).toHaveClass("after:content-['*']", 'after:ml-0.5', 'after:text-red-500')
  })

  it('should display error message', () => {
    render(
      <FormField label="Email" name="email" error="Please enter a valid email">
        <Input name="email" />
      </FormField>
    )
    
    const errorMessage = screen.getByText('Please enter a valid email')
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveClass('text-red-500')
    expect(errorMessage).toHaveAttribute('role', 'alert')
  })

  it('should not show error message when no error', () => {
    render(
      <FormField label="Username" name="username">
        <Input name="username" />
      </FormField>
    )
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(
      <FormField label="Name" name="name" className="custom-field">
        <Input name="name" />
      </FormField>
    )
    
    const fieldContainer = screen.getByText('Name').closest('div')
    expect(fieldContainer).toHaveClass('custom-field')
  })

  it('should spread additional props', () => {
    render(
      <FormField 
        label="Description" 
        name="description" 
        data-testid="description-field"
        aria-describedby="description-help"
      >
        <Input name="description" />
      </FormField>
    )
    
    const fieldContainer = screen.getByTestId('description-field')
    expect(fieldContainer).toHaveAttribute('aria-describedby', 'description-help')
  })

  it('should have proper spacing', () => {
    render(
      <FormField label="Title" name="title">
        <Input name="title" />
      </FormField>
    )
    
    const fieldContainer = screen.getByText('Title').closest('div')
    expect(fieldContainer).toHaveClass('space-y-2')
  })

  it('should work with different input types', () => {
    render(
      <FormField label="Message" name="message">
        <textarea name="message" className="w-full rounded border p-2" />
      </FormField>
    )
    
    expect(screen.getByText('Message')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should work with select elements', () => {
    render(
      <FormField label="Country" name="country">
        <select name="country" className="w-full rounded border p-2">
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
        </select>
      </FormField>
    )
    
    expect(screen.getByText('Country')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should handle both required and error states', () => {
    render(
      <FormField 
        label="Email" 
        name="email" 
        required 
        error="This field is required"
      >
        <Input name="email" />
      </FormField>
    )
    
    const label = screen.getByText('Email')
    const errorMessage = screen.getByText('This field is required')
    
    expect(label).toHaveClass("after:content-['*']")
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveClass('text-red-500')
  })

  it('should have proper label styling', () => {
    render(
      <FormField label="Username" name="username">
        <Input name="username" />
      </FormField>
    )
    
    const label = screen.getByText('Username')
    expect(label).toHaveClass(
      'text-sm',
      'font-medium',
      'leading-none',
      'peer-disabled:cursor-not-allowed',
      'peer-disabled:opacity-70'
    )
  })
})