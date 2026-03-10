import React, { useState } from 'react';

export interface VendorRegistrationData {
  businessName: string;
  email: string;
  phoneNumber: string;
  contactPerson: string;
}

interface VendorRegistrationFormProps {
  onSubmit: (formData: VendorRegistrationData) => void;
  isLoading?: boolean;
  error?: string | null;
}

const VendorRegistrationForm: React.FC<VendorRegistrationFormProps> = ({
  onSubmit,
  isLoading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState<VendorRegistrationData>({
    businessName: '',
    email: '',
    phoneNumber: '',
    contactPerson: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear specific validation error when user types
    if (value) {
      setValidationErrors((prevErrors) => {
        const newState = { ...prevErrors };
        delete newState[name];
        return newState;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newValidationErrors: Record<string, string> = {};

    if (!formData.businessName) {
      newValidationErrors.businessName = 'Business name is required.';
    }
    if (!formData.email) {
      newValidationErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) { // Basic email format check
      newValidationErrors.email = 'Invalid email format.';
    }
    if (!formData.phoneNumber) {
      newValidationErrors.phoneNumber = 'Phone number is required.';
    } else if (!/^\d{3}-\d{3}-\d{4}$/.test(formData.phoneNumber)) { // Basic US phone format check
      newValidationErrors.phoneNumber = 'Invalid phone number format (e.g., 123-456-7890).';
    }
    if (!formData.contactPerson) {
      newValidationErrors.contactPerson = 'Contact person is required.';
    }

    setValidationErrors(newValidationErrors);

    if (Object.keys(newValidationErrors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Vendor Registration Form">
      <h2>Vendor Registration</h2>

      {error && <div style={{ color: 'red' }} data-testid="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="businessName">Business Name:</label>
        <input
          type="text"
          id="businessName"
          name="businessName"
          value={formData.businessName}
          onChange={handleChange}
          required
          aria-invalid={!!validationErrors.businessName || !!error}
          aria-describedby={validationErrors.businessName ? 'business-name-error' : undefined}
        />
        {validationErrors.businessName && <div id="business-name-error" style={{color: 'red', fontSize: '0.8em'}}>{validationErrors.businessName}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          aria-invalid={!!validationErrors.email || !!error}
          aria-describedby={validationErrors.email ? 'email-error' : undefined}
        />
        {validationErrors.email && <div id="email-error" style={{color: 'red', fontSize: '0.8em'}}>{validationErrors.email}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="phoneNumber">Phone Number:</label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
          placeholder="e.g. 123-456-7890"
          aria-invalid={!!validationErrors.phoneNumber || !!error}
          aria-describedby={validationErrors.phoneNumber ? 'phone-error' : undefined}
        />
        {validationErrors.phoneNumber && <div id="phone-error" style={{color: 'red', fontSize: '0.8em'}}>{validationErrors.phoneNumber}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="contactPerson">Contact Person:</label>
        <input
          type="text"
          id="contactPerson"
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleChange}
          required
          aria-invalid={!!validationErrors.contactPerson || !!error}
          aria-describedby={validationErrors.contactPerson ? 'contact-person-error' : undefined}
        />
        {validationErrors.contactPerson && <div id="contact-person-error" style={{color: 'red', fontSize: '0.8em'}}>{validationErrors.contactPerson}</div>}
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default VendorRegistrationForm;
