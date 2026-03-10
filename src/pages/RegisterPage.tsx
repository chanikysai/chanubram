import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming React Router is used for navigation
import AuthForm from '../components/AuthForm';
import { registerUser } from '../services/authApi';
import { RegisterCredentials } from '../types/auth';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerFields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
  ];

  const handleRegister = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, you'd store the token (e.g., in localStorage or context)
      const response = await registerUser(credentials);
      console.log('Registration successful:', response);
      // Navigate to login or dashboard after successful registration
      navigate('/login'); // Assuming '/login' is a valid route
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during registration.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <AuthForm
        fields={registerFields}
        onSubmit={handleRegister}
        submitButtonText="Register"
        errorMessage={error}
        isLoading={isLoading}
      />
      <p>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default RegisterPage;
