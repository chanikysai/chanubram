import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthForm from '../components/AuthForm';

// Mocking React Router's useNavigate hook if it were used in parent components,
// but AuthForm itself doesn't use it directly.
// If AuthForm were to trigger navigation, we'd mock that here.

describe('AuthForm', () => {
  const mockSubmit = jest.fn();
  const defaultProps = {
    onSubmit: mockSubmit,
    fields: [
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
    ],
    submitButtonText: 'Submit',
  };

  // Happy Path: Rendering and basic interaction
  test('renders the form with provided fields and handles input changes', async () => {
    render(<AuthForm {...defaultProps} />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Submit/i });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    // Simulate typing into the inputs
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  // Happy Path: Form submission
  test('calls onSubmit with correct data when the form is submitted', async () => {
    render(<AuthForm {...defaultProps} />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);

    // Wait for async operations if any, though onSubmit is directly called here.
    // If onSubmit were async and had UI updates, we'd use await waitFor.
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  // Edge Case: Displaying error message
  test('displays an error message if provided', () => {
    const errorMessage = 'Invalid credentials';
    render(<AuthForm {...defaultProps} errorMessage={errorMessage} />);

    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveClass('error-message');
  });

  // Edge Case: Handling loading state
  test('disables inputs and button when loading is true', () => {
    render(<AuthForm {...defaultProps} isLoading={true} />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Processing.../i });

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Processing...');
  });

  // Edge Case: Using initial fields
  test('populates form fields with initial data', () => {
    const initialData = { email: 'prefilled@example.com', password: '' };
    render(<AuthForm {...defaultProps} initialFields={initialData} />);

    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    expect(emailInput).toHaveValue('prefilled@example.com');
  });

  // Edge Case: Form submission with required fields missing (HTML5 validation)
  test('triggers HTML5 validation if required fields are empty on submit', () => {
    render(<AuthForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);

    // HTML5 validation messages depend on browser implementation,
    // but we can check if the inputs are marked as invalid.
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    expect(emailInput.validationMessage).toBe('Please fill in this field.');
  });
});
