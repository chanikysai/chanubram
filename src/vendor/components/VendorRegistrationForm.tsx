import React, { useState, FormEvent } from 'react';

// Define the shape of the vendor registration data
interface VendorRegistrationData {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  businessDescription: string;
}

// Props for the VendorRegistrationForm component
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
  // State for form fields
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');

  // State for form errors
  const [formErrors, setFormErrors] = useState<Partial<VendorRegistrationData>>({});

  // Validation function
  const validateForm = (): boolean => {
    const errors: Partial<VendorRegistrationData> = {};
    let isValid = true;

    if (!businessName.trim()) {
      errors.businessName = 'Business Name is required';
      isValid = false;
    }
    if (!contactPerson.trim()) {
      errors.contactPerson = 'Contact Person is required';
      isValid = false;
    }
    if (!email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    if (!phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    }
    if (!address.trim()) {
      errors.address = 'Address is required';
      isValid = false;
    }
    if (!businessDescription.trim()) {
      errors.businessDescription = 'Business Description is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormErrors({}); // Clear previous errors
    onError(''); // Clear parent error message

    if (validateForm()) {
      const formData: VendorRegistrationData = {
        businessName,
        contactPerson,
        email,
        phone,
        address,
        businessDescription,
      };
      onSubmit(formData);
    } else {
      onError('Please correct the errors in the form.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="vendor-registration-form" noValidate>
      <h2>Vendor Registration</h2>

      <div className="form-group">
        <label htmlFor="businessName">Business Name:</label>
        <input
          type="text"
          id="businessName"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
          disabled={isLoading}
          aria-invalid={!!formErrors.businessName}
        />
        {formErrors.businessName && <p className="error-text">{formErrors.businessName}</p>}
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
          aria-invalid={!!formErrors.contactPerson}
        />
        {formErrors.contactPerson && <p className="error-text">{formErrors.contactPerson}</p>}
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
          aria-invalid={!!formErrors.email}
        />
        {formErrors.email && <p className="error-text">{formErrors.email}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone:</label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          disabled={isLoading}
          aria-invalid={!!formErrors.phone}
        />
        {formErrors.phone && <p className="error-text">{formErrors.phone}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="address">Address:</label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          disabled={isLoading}
          aria-invalid={!!formErrors.address}
        />
        {formErrors.address && <p className="error-text">{formErrors.address}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="businessDescription">Business Description:</label>
        <textarea
          id="businessDescription"
          value={businessDescription}
          onChange={(e) => setBusinessDescription(e.target.value)}
          required
          disabled={isLoading}
          rows={4}
          aria-invalid={!!formErrors.businessDescription}
        />
        {formErrors.businessDescription && <p className="error-text">{formErrors.businessDescription}</p>}
      </div>

      <button type="submit" disabled={isLoading} className="submit-button">
        {isLoading ? 'Submitting...' : 'Register Store'}
      </button>
    </form>
  );
};

export default VendorRegistrationForm;
