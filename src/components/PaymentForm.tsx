import React, { useState, FormEvent } from 'react';

// Define the shape for payment details
interface PaymentDetails {
  paymentMethod: 'creditCard' | 'paypal'; // Add other methods if needed
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  // PayPal might require a different set of identifiers or a redirect URL
}

interface PaymentFormProps {
  onSubmit: (paymentData: PaymentDetails) => void;
  isLoading: boolean;
  onError: (error: string) => void;
  // We might need to pass shipping data to this form if payment provider requires it
  // shippingData: ShippingAddress; 
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, isLoading, onError }) => {
  const [paymentMethod, setPaymentMethod] = useState<'creditCard' | 'paypal'>('creditCard');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    paymentMethod: 'creditCard',
  });

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMethod = e.target.value as 'creditCard' | 'paypal';
    setPaymentMethod(newMethod);
    setPaymentDetails({ paymentMethod: newMethod }); // Reset details for the new method
  };

  const handleCreditCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Basic validation based on selected payment method
    if (paymentMethod === 'creditCard') {
      if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv) {
        const errorMsg = 'Please fill in all required credit card details.';
        onError(errorMsg);
        return;
      }
      // More sophisticated validation for card number format, expiry date, CVV could be added here
    } else if (paymentMethod === 'paypal') {
      // PayPal might not require fields here, but rather a redirect.
      // For simplicity, we'll allow it if the method is selected.
      // In a real app, this would initiate a PayPal flow.
      if (!paymentDetails.paymentMethod) { // Just a placeholder check
        const errorMsg = 'Please select a payment method.';
        onError(errorMsg);
        return;
      }
    }

    onSubmit(paymentDetails);
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form" style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Payment Information</h2>

      <div className="form-group" style={{ marginBottom: '15px' }}>
        <label htmlFor="paymentMethod" style={{ display: 'block', marginBottom: '5px' }}>Payment Method:</label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={paymentMethod}
          onChange={handleMethodChange}
          required
          disabled={isLoading}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="creditCard">Credit Card</option>
          <option value="paypal">PayPal</option>
          {/* Add more payment options here */}
        </select>
      </div>

      {paymentMethod === 'creditCard' && (
        <>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label htmlFor="cardNumber" style={{ display: 'block', marginBottom: '5px' }}>Card Number:</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={paymentDetails.cardNumber || ''}
              onChange={handleCreditCardChange}
              placeholder="xxxx xxxx xxxx xxxx"
              required
              disabled={isLoading}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ flex: '1', marginRight: '10px' }}>
              <label htmlFor="expiryDate" style={{ display: 'block', marginBottom: '5px' }}>Expiry Date (MM/YY):</label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                value={paymentDetails.expiryDate || ''}
                onChange={handleCreditCardChange}
                placeholder="MM/YY"
                required
                disabled={isLoading}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ flex: '1', marginLeft: '10px' }}>
              <label htmlFor="cvv" style={{ display: 'block', marginBottom: '5px' }}>CVV:</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={paymentDetails.cvv || ''}
                onChange={handleCreditCardChange}
                placeholder="123"
                required
                disabled={isLoading}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div>
        </>
      )}

      {/* PayPal specific elements could be added here or handled via redirects */}
      {paymentMethod === 'paypal' && (
        <p style={{ fontStyle: 'italic' }}>You will be redirected to PayPal to complete your payment.</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '16px' }}
      >
        {isLoading ? 'Processing...' : 'Confirm Payment'}
      </button>
    </form>
  );
};

export default PaymentForm;
