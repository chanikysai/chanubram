import React, { useState, FormEvent } from 'react';

// Define the shape for shipping address
export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CheckoutFormProps {
  onSubmit: (shippingData: ShippingAddress) => void;
  isLoading: boolean;
  onError: (error: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, isLoading, onError }) => {
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.fullName || !formData.addressLine1 || !formData.city || !formData.state || !formData.postalCode || !formData.country) {
      const errorMsg = 'Please fill in all required shipping address fields.';
      onError(errorMsg);
      return;
    }
    
    // You might add more specific validation, e.g., for postal code format or country codes.

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form" style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Shipping Information</h2>

      <div className="form-group" style={{ marginBottom: '15px' }}>
        <label htmlFor="fullName" style={{ display: 'block', marginBottom: '5px' }}>Full Name:</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          disabled={isLoading}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '15px' }}>
        <label htmlFor="addressLine1" style={{ display: 'block', marginBottom: '5px' }}>Address Line 1:</label>
        <input
          type="text"
          id="addressLine1"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleChange}
          required
          disabled={isLoading}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '15px' }}>
        <label htmlFor="addressLine2" style={{ display: 'block', marginBottom: '5px' }}>Address Line 2 (Optional):</label>
        <input
          type="text"
          id="addressLine2"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={handleChange}
          disabled={isLoading}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <div style={{ flex: '1', marginRight: '10px' }}>
          <label htmlFor="city" style={{ display: 'block', marginBottom: '5px' }}>City:</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ flex: '1', marginLeft: '10px' }}>
          <label htmlFor="state" style={{ display: 'block', marginBottom: '5px' }}>State/Province:</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
      </div>

      <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <div style={{ flex: '1', marginRight: '10px' }}>
          <label htmlFor="postalCode" style={{ display: 'block', marginBottom: '5px' }}>Postal Code:</label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ flex: '1', marginLeft: '10px' }}>
          <label htmlFor="country" style={{ display: 'block', marginBottom: '5px' }}>Country:</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '16px' }}
      >
        {isLoading ? 'Processing...' : 'Continue to Payment'}
      </button>
    </form>
  );
};

export default CheckoutForm;
