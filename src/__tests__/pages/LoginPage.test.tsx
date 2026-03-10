// src/__tests__/pages/LoginPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../../pages/LoginPage';
import { loginUser } from '../../services/authApi';
import { useNavigate } from 'react-router-dom';

// Mocking react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

// Mock the authApi loginUser function
jest.mock('../../services/authApi', () => ({
  loginUser: jest.fn(),
}));

// Define types for clarity
type LoginAPIResponse = { user: { id: string; name: string; email: string; }; token: string; } | { message: string; };

describe('LoginPage', () => {
  const mockNavigate = jest.fn();
  const mockLoginUser = loginUser as jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    mockLoginUser.mockClear();
    // Clear localStorage as it's used by the component logic
    localStorage.clear();
  });

  test('renders the login form and prompts for credentials', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /welcome back!/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account?/i)).toBeInTheDocument();
  });

  test('calls loginUser and navigates on successful login, stores token', async () => {
    const mockSuccessfulResponse = { user: { id: '1', name: 'Existing User', email: 'user@example.com' }, token: 'mock-jwt-token-for-user@example.com' };
    mockLoginUser.mockResolvedValue(mockSuccessfulResponse);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledTimes(1);
      expect(mockLoginUser).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBe('mock-jwt-token-for-user@example.com');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('displays error message when login fails (invalid credentials)', async () => {
    const mockErrorResponse = { message: 'Invalid email or password.' };
    mockLoginUser.mockResolvedValue(mockErrorResponse);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'wronguser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/invalid email or password./i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(localStorage.getItem('authToken')).toBeNull();
    });
  });

  test('displays a generic error message for unexpected API errors', async () => {
    mockLoginUser.mockRejectedValue(new Error('Network Error'));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'error@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/An unexpected error occurred. Please try again later./i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(localStorage.getItem('authToken')).toBeNull();
    });
  });
});
