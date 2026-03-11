import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { registerUser } from '../services/authApi';
import { AuthResponse, ErrorResponse } from '../services/authApi'; // Import types

const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (formData: { email: string; password?: string; name?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await registerUser(formData);
      // Check if the result is an error response
      if ('message' in result) {
        const errorResult = result as ErrorResponse;
        setError(errorResult.message);
      } else {
        // It's a successful response
        const authResult = result as AuthResponse;
        // For registration, we might not automatically log the user in,
        // or we could store the token and navigate to dashboard.
        // Let's navigate to the login page as a common pattern.
        // If we wanted to log them in automatically:
        // localStorage.setItem('authToken', authResult.token);
        // navigate('/dashboard');
        navigate('/login'); // Navigate to login page after successful registration
      }
    } catch (err) {
      setError('An unexpected error occurred during registration. Please try again later.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Create Your Account</h1>
      <AuthForm
        mode="register"
        onSubmit={handleRegister}
        onError={setError} // Pass setError to AuthForm to display its own messages if needed
        isLoading={isLoading}
        // error={error} // Pass the error state to AuthForm if it's meant to display it
      />
      {error && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      <p style={{ marginTop: '15px' }}>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default RegisterPage;
