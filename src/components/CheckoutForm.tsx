import React, { useState, FormEvent } from 'react';

// Define the shape of the shipping address
interface ShippingAddress {
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
  // Add onError prop if needed for parent component to handle validation errors
  onError: (error: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, isLoading, onError }) => {
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
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
    setShippingAddress(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!shippingAddress.fullName ||
        !shippingAddress.addressLine1 ||
        !shippingAddress.city ||
        !shippingAddress.state ||
        !shippingAddress.postalCode ||
        !shippingAddress.country) {
      const errorMsg = 'Please fill in all required shipping address fields.';
      onError(errorMsg);
      return;
    }
    onSubmit(shippingAddress);
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
          value={shippingAddress.fullName}
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
          value={shippingAddress.addressLine1}
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
          value={shippingAddress.addressLine2}
          onChange={handleChange}
          disabled={isLoading}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '15px' }}>
        <label htmlFor="city" style={{ display: 'block', marginBottom: '5px' }}>City:</label>
        <input
          type="text"
          id="city"
          name="city"
          value={shippingAddress.city}
          onChange={handleChange}
          required
          disabled={isLoading}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '15px' }}>
        <label htmlFor="state" style={{ display: 'block', marginBottom: '5px' }}>State/Province:</label>
        <input
          type="text"
          id="state"
          name="state"
          value={shippingAddress.state}
          onChange={handleChange}
          required
          disabled={isLoading}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '15px' }}>
        <label htmlFor="postalCode" style={{ display: 'block', marginBottom: '5px' }}>Postal Code:</label>
        <input
          type="text"
          id="postalCode"
          name="postalCode"
          value={shippingAddress.postalCode}
          onChange={handleChange}
          required
          disabled={isLoading}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '15px' }}>
        <label htmlFor="country" style={{ display: 'block', marginBottom: '5px' }}>Country:</label>
        <select
          id="country"
          name="country"
          value={shippingAddress.country}
          onChange={handleChange}
          required
          disabled={isLoading}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">-- Select Country --</option>
          <option value="USA">United States</option>
          <option value="CAN">Canada</option>
          <option value="MEX">Mexico</option>
          {/* Add more countries as needed */}
        </select>
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
