import React, { useState, FormEvent } from 'react';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (formData: any) => void; // Use a more specific type later
  onError: (error: string) => void;
  isLoading: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, onError, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only for registration
  const [errorMessage, setErrorMessage] = useState('');

  const isRegisterMode = mode === 'register';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors

    if (!email || !password || (isRegisterMode && !name)) {
      setErrorMessage('Please fill in all fields.');
      onError('Please fill in all fields.'); // Propagate to parent
      return;
    }

    const formData = { email, password };
    if (isRegisterMode) {
      // @ts-ignore - name is conditionally added, TS might complain without this
      formData.name = name;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>{isRegisterMode ? 'Register' : 'Login'}</h2>

      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {/* Parent component might also manage and display errors */}

      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required={true}
          disabled={isLoading}
        />
      </div>

      {isRegisterMode && (
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required={true}
            disabled={isLoading}
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={true}
          disabled={isLoading}
        />
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Processing...' : (isRegisterMode ? 'Register' : 'Login')}
      </button>
    </form>
  );
};

export default AuthForm;
