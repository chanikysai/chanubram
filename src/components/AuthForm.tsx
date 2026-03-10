import React, { useState } from 'react';

interface AuthFormProps {
  onSubmit: (credentials: any) => Promise<void>; // Generic credentials type for flexibility
  initialFields?: Record<string, string>;
  fields: { name: string; label: string; type?: string; required?: boolean }[];
  submitButtonText: string;
  errorMessage?: string;
  isLoading?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({
  onSubmit,
  initialFields = {},
  fields,
  submitButtonText,
  errorMessage,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>(initialFields);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {fields.map((field) => (
        <div key={field.name} className="form-group">
          <label htmlFor={field.name}>{field.label}</label>
          <input
            type={field.type || 'text'}
            id={field.name}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            required={field.required}
            disabled={isLoading}
          />
        </div>
      ))}

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Processing...' : submitButtonText}
      </button>
    </form>
  );
};

export default AuthForm;
