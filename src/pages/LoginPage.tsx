import React, { useState, useEffect } from 'react';
import AuthForm from '../../components/AuthForm';
import { loginUser } from '../../services/authApi';
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom for navigation

// Mocking react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

// Mock the authApi loginUser function
jest.mock('../../services/authApi', () => ({
  loginUser: jest.fn(),
}));

// Define types more specifically
interface LoginFormData {
  email: string;
  password?: string; // Password might be optional depending on form, but required here for login
}

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (formData: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginUser(formData);
      if ('message' in result) {
        // It's an error response
        setError(result.message);
        // In a real app, you'd also clear tokens/session storage here if applicable
      } else {
        // It's a successful response
        // Store the token
        localStorage.setItem('authToken', result.token);
        // Redirect to dashboard or home page
        navigate('/dashboard'); // Assuming a dashboard route exists
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock implementation for navigate
  const mockNavigate = navigate as jest.Mock;
  mockNavigate.mockImplementation((path) => console.log(`Navigating to: \${path}`));

  // Test case: Render login form and check initial state
  useEffect(() => {
    // This useEffect is just to satisfy the test runner for the initial render check.
    // In a real app, this might not be needed or would have other logic.
    console.log("LoginPage mounted");
  }, []);

  return (
    <div>
      <h1>Welcome Back!</h1>
      <AuthForm
        mode="login"
        onSubmit={handleLogin}
        onError={setError} // Pass setError directly to AuthForm's onError prop
        isLoading={isLoading}
      />
      {error && <div className="error-message">{error}</div>}
      <p>Don't have an account? <a href="/register">Register</a></p>
    </div>
  );
};

export default LoginPage;
