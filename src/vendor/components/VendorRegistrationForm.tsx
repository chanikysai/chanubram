import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom for navigation
import { VendorRegistrationData } from '../../services/vendorApi'; // Import the type

// Define interfaces for the form component's props
interface VendorRegistrationFormProps {
  onSubmit: (formData: VendorRegistrationData) => void;
  onError: (error: string) => void;
  isLoading: boolean;
}

const VendorRegistrationForm: React.FC<VendorRegistrationFormProps> = ({
  onSubmit,
  onError,
  isLoading,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors

    // Basic client-side validation
    if (!businessName || !email || !phoneNumber || !contactPerson) {
      const msg = 'Please fill in all required fields.';
      setErrorMessage(msg);
      onError(msg);
      return;
    }

    // Email format validation (simple check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const msg = 'Please enter a valid email address.';
      setErrorMessage(msg);
      onError(msg);
      return;
    }

    // Phone number format validation (basic check)
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phoneNumber)) {
        const msg = 'Please enter a valid phone number.';
        setErrorMessage(msg);
        onError(msg);
        return;
    }

    const formData: VendorRegistrationData = {
      businessName,
      email,
      phoneNumber,
      contactPerson,
    };

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="vendor-registration-form">
      <h2>Vendor Registration</h2>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="form-group">
        <label htmlFor="businessName">Business Name:</label>
        <input
          type="text"
          id="businessName"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="phoneNumber">Phone Number:</label>
        <input
          type="tel"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          disabled={isLoading}
          placeholder="e.g., +1 (123) 456-7890"
        />
      </div>

      <div className="form-group">
        <label htmlFor="contactPerson">Contact Person:</label>
        <input
          type="text"
          id="contactPerson"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Register Store'}
      </button>
    </form>
  );
};

export default VendorRegistrationForm;
