import React, { useState, useEffect } from 'react';
import AuthForm from '../../components/AuthForm';
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

interface RegisterFormData {
  email: string;
  name: string;
  password?: string; // Password might be optional depending on form, but required here for register
}

const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (formData: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await registerUser(formData);
      if ('message' in result) {
        // It's an error response
        setError(result.message);
      } else {
        // It's a successful response
        // Optionally store token if needed for immediate login after registration, or just navigate
        // For this feature, let's assume successful registration navigates to login page
        navigate('/login'); // Navigate to the login page after successful registration
      }
    } catch (err) {
      setError('An unexpected error occurred during registration. Please try again later.');
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock implementation for navigate (as done in LoginPage)
  const mockNavigate = navigate as jest.Mock;
  mockNavigate.mockImplementation((path) => console.log(`Navigating to: \${path}`));


  return (
    <div>
      <h1>Create Your Account</h1>
      <AuthForm
        mode="register"
        onSubmit={handleRegister}
        onError={setError}
        isLoading={isLoading}
      />
      {error && <div className="error-message">{error}</div>}
      <p>Already have an account? <a href="/login">Login here</a></p>
    </div>
  );
};

export default RegisterPage;
