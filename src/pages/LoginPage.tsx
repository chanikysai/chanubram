import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { loginUser } from '../services/authApi';
import { AuthResponse, ErrorResponse } from '../services/authApi'; // Import types

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (formData: { email: string; password?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginUser(formData);
      // Check if the result is an error response
      if ('message' in result) {
        const errorResult = result as ErrorResponse;
        setError(errorResult.message);
      } else {
        // It's a successful response
        const authResult = result as AuthResponse;
        localStorage.setItem('authToken', authResult.token);
        // Navigate to the dashboard or home page
        navigate('/dashboard'); // Assuming '/dashboard' is a valid route
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Login to Your Account</h1>
      <AuthForm
        mode="login"
        onSubmit={handleLogin}
        onError={setError} // Pass setError to AuthForm to display its own messages if needed
        isLoading={isLoading}
        // error={error} // Pass the error state to AuthForm if it's meant to display it
      />
      {error && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      <p style={{ marginTop: '15px' }}>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
};

export default LoginPage;
