import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useNavigate } from 'react-router-dom';
import LoginPage from '../../src/pages/LoginPage';
import { loginUser } from '../../src/services/authApi';
import { AuthResponse, ErrorResponse } from '../../src/services/authApi'; // Import types

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock authApi loginUser function
jest.mock('../../src/services/authApi', () => ({
  loginUser: jest.fn(),
}));

// Type casting mocks for easier use
const mockLoginUser = loginUser as jest.Mock<Promise<AuthResponse | ErrorResponse>>;

describe('LoginPage Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLoginUser.mockClear();
    // Clear localStorage as well if it's used for tokens
    jest.spyOn(Storage.prototype, 'setItem').mockClear();
    jest.spyOn(Storage.prototype, 'getItem').mockClear();
  });

  // Test case 1: Happy path - Successful login
  test('should navigate to dashboard and set token on successful login', async () => {
    const mockAuthResponse: AuthResponse = {
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
      token: 'mock-auth-token',
    };
    mockLoginUser.mockResolvedValue(mockAuthResponse);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for the API call to resolve and navigation to occur
    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledTimes(1);
      expect(mockLoginUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'mock-auth-token');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument();
    });
  });

  // Test case 2: Error handling - Invalid credentials
  test('should display error message for invalid login credentials', async () => {
    const mockErrorResponse: ErrorResponse = { message: 'Invalid email or password.' };
    mockLoginUser.mockResolvedValue(mockErrorResponse);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledTimes(1);
      expect(mockLoginUser).toHaveBeenCalledWith({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  // Test case 3: Error handling - Network or unexpected error
  test('should display a generic error message on API failure', async () => {
    mockLoginUser.mockRejectedValue(new Error('Network error'));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  // Test case 4: Navigation to registration page
  test('should navigate to the register page when the link is clicked', () => {
    render(<LoginPage />);

    const registerLink = screen.getByRole('link', { name: /register here/i });
    fireEvent.click(registerLink);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});
