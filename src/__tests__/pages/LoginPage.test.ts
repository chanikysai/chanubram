import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { loginUser } from '../services/authApi';
import AuthForm from '../components/AuthForm'; // Import AuthForm to mock it

// Mocking react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mocking the authApi service
jest.mock('../services/authApi');

// Mocking the AuthForm component to control its props and test its usage
jest.mock('../components/AuthForm', () => ({
  __esModule: true,
  default: jest.fn(({ onSubmit, fields, submitButtonText, errorMessage, isLoading }) => (
    <div>
      <h2>Mock AuthForm</h2>
      {fields.map(field => (
        <div key={field.name}>
          <label htmlFor={field.name}>{field.label}</label>
          <input
            type={field.type || 'text'}
            id={field.name}
            name={field.name}
            required={field.required}
            disabled={isLoading}
          />
        </div>
      ))}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <button onClick={() => onSubmit({})} disabled={isLoading}>
        {isLoading ? 'Processing...' : submitButtonText}
      </button>
    </div>
  )),
}));

const mockNavigate = useNavigate as jest.Mock;
const mockLoginUser = loginUser as jest.Mock;
const MockAuthForm = AuthForm as jest.Mock;

describe('LoginPage', () => {
  const loginFields = [
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    mockNavigate.mockClear();
    mockLoginUser.mockClear();
    MockAuthForm.mockClear();

    // Configure AuthForm mock to pass through props for clarity
    MockAuthForm.mockImplementation(({ onSubmit, fields, submitButtonText, errorMessage, isLoading }) => (
      <div>
        <h2>Mock AuthForm</h2>
        {fields.map(field => (
          <div key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            <input
              type={field.type || 'text'}
              id={field.name}
              name={field.name}
              required={field.required}
              disabled={isLoading}
            />
          </div>
        ))}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button onClick={() => onSubmit({ email: 'test@example.com', password: 'password123' })} disabled={isLoading}>
          {isLoading ? 'Processing...' : submitButtonText}
        </button>
      </div>
    ));

    // Default mock for navigate
    mockNavigate.mockImplementation(() => jest.fn());
  });

  // Happy Path: Page renders correctly
  test('renders the login page with title and AuthForm', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
    expect(MockAuthForm).toHaveBeenCalledTimes(1);
    expect(MockAuthForm).toHaveBeenCalledWith(expect.objectContaining({
      submitButtonText: 'Login',
      fields: expect.arrayContaining([
        expect.objectContaining({ name: 'email' }),
        expect.objectContaining({ name: 'password' }),
      ]),
    }), {});
  });

  // Happy Path: Successful login navigates the user
  test('navigates to dashboard on successful login', async () => {
    const mockUserData = { id: 'user1', name: 'Test', email: 'test@example.com' };
    const mockToken = 'fake-token';
    mockLoginUser.mockResolvedValue({ user: mockUserData, token: mockToken });

    render(<LoginPage />);

    // Simulate user filling and submitting the form via the mocked AuthForm's button click
    // The mock AuthForm's onClick directly calls onSubmit with dummy data.
    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);

    // Wait for the async loginUser call and subsequent navigation
    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledTimes(1);
      expect(mockLoginUser).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
    });

    // Check if navigate was called with the correct route
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  // Error Handling: Displays error message on login failure
  test('displays an error message when login fails', async () => {
    const errorMessage = 'Invalid email or password';
    mockLoginUser.mockRejectedValue(new Error(errorMessage));

    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);

    // Wait for the login attempt to complete and error to be displayed
    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledTimes(1);
    });

    // Check if the error message is rendered by the mocked AuthForm
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toHaveClass('error-message');
    });

    // Ensure navigation is NOT called on error
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // Edge Case: Loading state
  test('disables login button and shows processing text when loading', async () => {
    // We need to simulate the login process to see the loading state
    mockLoginUser.mockImplementation(async () => {
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return { user: { id: 'user1', name: 'Test', email: 'test@example.com' }, token: 'fake-token' };
    });

    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);

    // Check for the disabled state and processing text immediately after click
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Processing...');

    // Wait for the process to complete (navigation would happen here)
    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledTimes(1);
    });
  });
});
