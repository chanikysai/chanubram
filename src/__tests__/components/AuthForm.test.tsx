import React, { useState, FormEvent } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthForm from '../../components/AuthForm';

describe('AuthForm', () => {
  const mockSubmit = jest.fn();
  const mockError = jest.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
    mockError.mockClear();
  });

  test('renders login form by default', () => {
    render(<AuthForm mode="login" onSubmit={mockSubmit} onError={mockError} isLoading={false} />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('renders registration form when mode is "register"', () => {
    render(<AuthForm mode="register" onSubmit={mockSubmit} onError={mockError} isLoading={false} />);
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('handles input changes for login form', () => {
    render(<AuthForm mode="login" onSubmit={mockSubmit} onError={mockError} isLoading={false} />);
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('handles input changes for registration form', () => {
    render(<AuthForm mode="register" onSubmit={mockSubmit} onError={mockError} isLoading={false} />);
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(nameInput.value).toBe('Test User');
    expect(passwordInput.value).toBe('password123');
  });

  test('calls onSubmit with login form data on submit', () => {
    render(<AuthForm mode="login" onSubmit={mockSubmit} onError={mockError} isLoading={false} />);
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
  });

  test('calls onSubmit with registration form data on submit', () => {
    render(<AuthForm mode="register" onSubmit={mockSubmit} onError={mockError} isLoading={false} />);
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({ email: 'test@example.com', name: 'Test User', password: 'password123' });
  });

  test('shows error message for missing fields on login submit', async () => {
    render(<AuthForm mode="login" onSubmit={mockSubmit} onError={mockError} isLoading={false} />);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please fill in all fields./i)).toBeInTheDocument();
      expect(mockError).toHaveBeenCalledWith('Please fill in all fields.');
    });
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('shows error message for missing fields on registration submit', async () => {
    render(<AuthForm mode="register" onSubmit={mockSubmit} onError={mockError} isLoading={false} />);
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please fill in all fields./i)).toBeInTheDocument();
      expect(mockError).toHaveBeenCalledWith('Please fill in all fields.');
    });
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('disables form and shows loading state when isLoading is true', () => {
    render(<AuthForm mode="login" onSubmit={mockSubmit} onError={mockError} isLoading={true} />);
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /processing.../i });

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/processing.../i)).toBeInTheDocument();
  });
});
