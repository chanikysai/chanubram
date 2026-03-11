import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthForm from '../../src/components/AuthForm';

// Mocking the props
const mockOnSubmit = jest.fn();
const mockOnError = jest.fn();

describe('AuthForm Component', () => {
  // Test case 1: Happy path - Login form submission
  test('should call onSubmit with correct data for login', async () => {
    render(
      <AuthForm
        mode="login"
        onSubmit={mockOnSubmit}
        onError={mockOnError}
        isLoading={false}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for potential async operations (though this form is synchronous on submit)
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  // Test case 2: Edge case - Empty fields for login
  test('should display error message and call onError for empty login fields', async () => {
    render(
      <AuthForm
        mode="login"
        onSubmit={mockOnSubmit}
        onError={mockOnError}
        isLoading={false}
      />
    );

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledWith('Please fill in all fields.');
      // Check if error message is displayed in the component
      expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
    });
  });

  // Test case 3: Happy path - Registration form submission
  test('should call onSubmit with correct data for registration', async () => {
    render(
      <AuthForm
        mode="register"
        onSubmit={mockOnSubmit}
        onError={mockOnError}
        isLoading={false}
      />
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'register@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'securepassword456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'register@example.com',
        name: 'Test User',
        password: 'securepassword456',
      });
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  // Test case 4: Edge case - Empty fields for registration
  test('should display error message and call onError for empty registration fields', async () => {
    render(
      <AuthForm
        mode="register"
        onSubmit={mockOnSubmit}
        onError={mockOnError}
        isLoading={false}
      />
    );

    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledWith('Please fill in all fields.');
      // Check if error message is displayed in the component
      expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
    });
  });

  // Test case 5: Loading state
  test('should disable inputs and button when isLoading is true', () => {
    render(
      <AuthForm
        mode="login"
        onSubmit={mockOnSubmit}
        onError={mockOnError}
        isLoading={true}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /processing.../i });

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
});
