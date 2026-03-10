import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming React Router is used for navigation
import AuthForm from '../components/AuthForm';
import { loginUser } from '../services/authApi';
import { LoginCredentials } from '../types/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginFields = [
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
  ];

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, you'd store the token (e.g., in localStorage or context)
      const response = await loginUser(credentials);
      console.log('Login successful:', response);
      // Navigate to dashboard or home page after successful login
      navigate('/dashboard'); // Assuming '/dashboard' is a valid route
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <AuthForm
        fields={loginFields}
        onSubmit={handleLogin}
        submitButtonText="Login"
        errorMessage={error}
        isLoading={isLoading}
      />
      <p>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
};

export default LoginPage;
