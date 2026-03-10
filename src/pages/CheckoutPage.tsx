import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom is used for navigation

import CheckoutForm, { ShippingAddress } from '../components/CheckoutForm';
import PaymentForm, { PaymentDetails } from '../components/PaymentForm';
import { processPayment } from '../services/paymentApi'; // Import the payment service

// Define types for order and product in cart
// These are simplified; actual types might be more complex.
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

// Mock cart data - in a real app, this would come from context or state management
const mockCart: OrderSummary = {
  items: [
    { id: 'p1', name: 'Awesome Gadget', price: 49.99, quantity: 1 },
    { id: 'p2', name: 'Super Widget', price: 19.50, quantity: 2 },
  ],
  subtotal: 89.49, // 49.99 + (19.50 * 2)
  shippingCost: 5.00,
  tax: 7.16, // Example tax calculation (e.g., 8% of subtotal + shipping)
  total: 101.65,
};

enum CheckoutStep {
  Shipping = 'SHIPPING',
  Payment = 'PAYMENT',
  Review = 'REVIEW',
  Confirmation = 'CONFIRMATION',
}

const CheckoutPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.Shipping);
  const [shippingData, setShippingData] = useState<ShippingAddress | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentDetails | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>(mockCart); // Use mock cart data
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const navigate = useNavigate(); // Hook for navigation

  const handleShippingSubmit = (data: ShippingAddress) => {
    setShippingData(data);
    setErrorMessage(null); // Clear errors
    setCurrentStep(CheckoutStep.Payment);
  };

  const handlePaymentSubmit = async (data: PaymentDetails) => {
    setPaymentData(data);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Ensure shippingData is available before processing payment
      if (!shippingData) {
        throw new Error('Shipping information is missing.');
      }
      
      const response = await processPayment(data, shippingData);

      if (response.success) {
        setTransactionId(response.transactionId);
        setCurrentStep(CheckoutStep.Confirmation);
        // Optionally clear cart here or after confirmation
        // clearCart(); 
      } else {
        setErrorMessage(response.message);
        setCurrentStep(CheckoutStep.Payment); // Stay on payment step if there's an error
      }
    } catch (error) {
      console.error("Payment processing failed:", error);
      setErrorMessage('An unexpected error occurred during payment processing.');
      setCurrentStep(CheckoutStep.Payment); // Stay on payment step
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = () => {
    // In a real app, this might involve a final confirmation API call
    // For now, we directly move to processing payment after review
    if (paymentData) { // Ensure payment data is set
      handlePaymentSubmit(paymentData);
    } else {
      setErrorMessage("Payment details are missing. Please go back and complete them.");
      setCurrentStep(CheckoutStep.Payment);
    }
  };

  const handleBack = (stepToReturnTo: CheckoutStep) => {
    setCurrentStep(stepToReturnTo);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case CheckoutStep.Shipping:
        return (
          <CheckoutForm 
            onSubmit={handleShippingSubmit} 
            isLoading={isLoading} 
            onError={setErrorMessage} 
          />
        );
      case CheckoutStep.Payment:
        return (
          <PaymentForm 
            onSubmit={handlePaymentSubmit} 
            isLoading={isLoading} 
            onError={setErrorMessage}
            // shippingData={shippingData!} // Pass shipping data if needed by PaymentForm
          />
        );
      case CheckoutStep.Review:
        // This step would display a summary of shipping and payment, and order items
        // For simplicity, we'll skip a dedicated review step and go directly to payment confirmation
        // or integrate a summary display before payment submission.
        // For now, let's assume submission from PaymentForm triggers the finalization.
        // If a review step is needed:
        return (
          <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Order Summary</h2>
            {/* Display order items, shipping address, payment method */}
            <p>Items: {orderSummary.items.reduce((acc, item) => acc + item.quantity, 0)}</p>
            <p>Subtotal: ${orderSummary.subtotal.toFixed(2)}</p>
            <p>Shipping: ${orderSummary.shippingCost.toFixed(2)}</p>
            <p>Tax: ${orderSummary.tax.toFixed(2)}</p>
            <p><strong>Total: ${orderSummary.total.toFixed(2)}</strong></p>
            
            <h3>Shipping To:</h3>
            {shippingData && (
              <p>
                {shippingData.fullName}<br />
                {shippingData.addressLine1}<br />
                {shippingData.addressLine2 && `${shippingData.addressLine2}<br />`}
                {shippingData.city}, {shippingData.state} {shippingData.postalCode}<br />
                {shippingData.country}
              </p>
            )}

            <h3>Payment Method:</h3>
            {paymentData && <p>{paymentData.paymentMethod === 'creditCard' ? 'Credit Card' : 'PayPal'}</p>}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button onClick={() => handleBack(CheckoutStep.Shipping)} disabled={isLoading} style={{ padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Back to Shipping</button>
              <button onClick={() => handleBack(CheckoutStep.Payment)} disabled={isLoading} style={{ padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Back to Payment</button>
              <button onClick={handleReviewSubmit} disabled={isLoading} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {isLoading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        );
      case CheckoutStep.Confirmation:
        return (
          <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
            <h2>Order Confirmed!</h2>
            {transactionId && <p>Your transaction ID is: <strong>{transactionId}</strong></p>}
            <p>Thank you for your purchase. Your order will be shipped soon.</p>
            <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Continue Shopping
            </button>
          </div>
        );
      default:
        return <div>Loading checkout...</div>;
    }
  };

  return (
    <div>
      <h1>Checkout</h1>
      {errorMessage && <div style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{errorMessage}</div>}
      {renderStepContent()}
    </div>
  );
};

export default CheckoutPage;
