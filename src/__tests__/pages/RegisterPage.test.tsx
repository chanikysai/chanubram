import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useNavigate } from 'react-router-dom';
import RegisterPage from '../../src/pages/RegisterPage';
import { registerUser } from '../../src/services/authApi';
import { AuthResponse, ErrorResponse } from '../../src/services/authApi'; // Import types

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock authApi registerUser function
jest.mock('../../src/services/authApi', () => ({
  registerUser: jest.fn(),
}));

// Type casting mocks for easier use
const mockRegisterUser = registerUser as jest.Mock<Promise<AuthResponse | ErrorResponse>>;

describe('RegisterPage Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    mockNavigate.mockClear();
    mockRegisterUser.mockClear();
  });

  // Test case 1: Happy path - Successful registration
  test('should navigate to login page on successful registration', async () => {
    const mockAuthResponse: AuthResponse = {
      user: { id: '2', name: 'New User', email: 'new@example.com' },
      token: 'new-mock-auth-token',
    };
    mockRegisterUser.mockResolvedValue(mockAuthResponse);

    render(<RegisterPage />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(nameInput, { target: { value: 'New User' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword789' } });
    fireEvent.click(submitButton);

    // Wait for the API call to resolve and navigation to occur
    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledTimes(1);
      expect(mockRegisterUser).toHaveBeenCalledWith({
        name: 'New User',
        email: 'new@example.com',
        password: 'newpassword789',
      });
      // On successful registration, we navigate to login
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
      expect(screen.queryByText(/email already in use/i)).not.toBeInTheDocument();
    });
  });

  // Test case 2: Error handling - Email already in use
  test('should display error message when email is already in use', async () => {
    const mockErrorResponse: ErrorResponse = { message: 'Email already in use.' };
    mockRegisterUser.mockResolvedValue(mockErrorResponse);

    render(<RegisterPage />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledTimes(1);
      expect(mockRegisterUser).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      });
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // Test case 3: Error handling - Password too short (assuming backend validation)
  test('should display error message for short password', async () => {
    const mockErrorResponse: ErrorResponse = { message: 'Password must be at least 6 characters long.' };
    mockRegisterUser.mockResolvedValue(mockErrorResponse);

    render(<RegisterPage />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(nameInput, { target: { value: 'Short Pass User' } });
    fireEvent.change(emailInput, { target: { value: 'short@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'pass' } }); // Too short
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledTimes(1);
      expect(mockRegisterUser).toHaveBeenCalledWith({
        name: 'Short Pass User',
        email: 'short@example.com',
        password: 'pass',
      });
      expect(screen.getByText(/password must be at least 6 characters long/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // Test case 4: Navigation to login page
  test('should navigate to the login page when the link is clicked', () => {
    render(<RegisterPage />);

    const loginLink = screen.getByRole('link', { name: /login here/i });
    fireEvent.click(loginLink);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
