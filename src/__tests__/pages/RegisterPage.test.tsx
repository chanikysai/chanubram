// src/__tests__/pages/RegisterPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterPage from '../../pages/RegisterPage';
import { registerUser } from '../../services/authApi';
import { useNavigate } from 'react-router-dom';

// Mocking react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

// Mock the authApi registerUser function
jest.mock('../../services/authApi', () => ({
  registerUser: jest.fn(),
}));

// Define types for clarity
type RegisterAPIResponse = { user: { id: string; name: string; email: string; }; token: string; } | { message: string; };

describe('RegisterPage', () => {
  const mockNavigate = jest.fn();
  const mockRegisterUser = registerUser as jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    mockRegisterUser.mockClear();
    // Clear localStorage as well, as it's used by the component logic (though not directly tested here)
    localStorage.clear();
  });

  test('renders the registration form and prompts for details', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account?/i)).toBeInTheDocument();
  });

  test('calls registerUser and navigates on successful registration', async () => {
    const mockSuccessfulResponse = { user: { id: 'user-2', name: 'Test User', email: 'test@example.com' }, token: 'mock-token-abc' };
    mockRegisterUser.mockResolvedValue(mockSuccessfulResponse);

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledTimes(1);
      expect(mockRegisterUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('displays error message when registration fails (email in use)', async () => {
    const mockErrorResponse = { message: 'Email already in use.' };
    mockRegisterUser.mockResolvedValue(mockErrorResponse);

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } }); // Use email that would cause an error
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/email already in use./i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('displays error message when registration fails (short password)', async () => {
    const mockErrorResponse = { message: 'Password must be at least 6 characters long.' };
    mockRegisterUser.mockResolvedValue(mockErrorResponse);

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'shortpass@example.com' } });
    fireEvent.change(nameInput, { target: { value: 'Short Password User' } });
    fireEvent.change(passwordInput, { target: { value: 'pass' } }); // Short password
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/password must be at least 6 characters long./i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('displays a generic error message for unexpected API errors', async () => {
    mockRegisterUser.mockRejectedValue(new Error('Network Error'));

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'error@example.com' } });
    fireEvent.change(nameInput, { target: { value: 'Error User' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/An unexpected error occurred during registration./i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
