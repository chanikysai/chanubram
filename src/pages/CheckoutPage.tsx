import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom is used for navigation

import CheckoutForm, { ShippingAddress } from '../components/CheckoutForm';
import PaymentForm, { PaymentDetails } from '../components/PaymentForm';
import CouponInput from '../components/CouponInput'; // Import the CouponInput component
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
  discount?: number; // Add discount to OrderSummary
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
  discount: 0, // Initialize discount to 0
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

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccessMessage, setCouponSuccessMessage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false); // Payment loading state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const navigate = useNavigate(); // Hook for navigation

  // Function to calculate total based on current orderSummary state
  const calculateTotal = (summary: OrderSummary): number => {
    const { subtotal, shippingCost, tax, discount = 0 } = summary;
    return subtotal + shippingCost + tax - discount;
  };

  // Update total whenever orderSummary changes
  useEffect(() => {
    setOrderSummary(prevSummary => ({
      ...prevSummary,
      total: calculateTotal(prevSummary),
    }));
  }, [orderSummary.subtotal, orderSummary.shippingCost, orderSummary.tax, orderSummary.discount]); // Recalculate when these change

  const handleShippingSubmit = (data: ShippingAddress) => {
    setShippingData(data);
    setErrorMessage(null); // Clear payment errors
    setCouponError(null); // Clear coupon errors
    setCouponSuccessMessage(null); // Clear coupon success message
    setCurrentStep(CheckoutStep.Review); // Move to Review step to apply coupon
  };

  // Handle applying coupon
  const handleApplyCoupon = async (code: string) => {
    setIsCouponLoading(true);
    setCouponError(null);
    setCouponSuccessMessage(null);

    // Mock API call to validate coupon
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      // Mock validation logic: only "DISCOUNT10" and "SAVE20" are valid
      let discountAmount = 0;
      if (code === 'DISCOUNT10') {
        discountAmount = orderSummary.subtotal * 0.10; // 10% of subtotal
        setCouponSuccessMessage('Coupon DISCOUNT10 applied!');
      } else if (code === 'SAVE20') {
        discountAmount = 20.00; // Flat $20 off
        setCouponSuccessMessage('Coupon SAVE20 applied!');
      } else {
        throw new Error('Invalid coupon code.');
      }

      // Update order summary with discount
      setOrderSummary(prevSummary => ({
        ...prevSummary,
        discount: discountAmount,
        total: calculateTotal({ ...prevSummary, discount: discountAmount }), // Recalculate total
      }));

    } catch (error: any) {
      console.error("Coupon application failed:", error);
      setCouponError(error.message || 'Failed to apply coupon.');
      setOrderSummary(prevSummary => ({ // Reset discount if coupon is invalid
        ...prevSummary,
        discount: 0,
        total: calculateTotal({ ...prevSummary, discount: 0 }),
      }));
    } finally {
      setIsCouponLoading(false);
    }
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
      
      // Pass the final order summary with applied discount to the payment API
      const response = await processPayment(data, shippingData, orderSummary);

      if (response.success) {
        setTransactionId(response.transactionId);
        setCurrentStep(CheckoutStep.Confirmation);
        // Optionally clear cart here or after confirmation
        // clearCart(); 
      } else {
        setErrorMessage(response.message);
        setCurrentStep(CheckoutStep.Review); // Stay on review step if there's an error
      }
    } catch (error) {
      console.error("Payment processing failed:", error);
      setErrorMessage('An unexpected error occurred during payment processing.');
      setCurrentStep(CheckoutStep.Review); // Stay on review step
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = () => {
    // Move to payment processing step
    if (paymentData) { // Ensure payment data is set
      handlePaymentSubmit(paymentData);
    } else {
      setCurrentStep(CheckoutStep.Payment); // Go back to payment if not set
    }
  };

  const handleBack = (stepToReturnTo: CheckoutStep) => {
    setCurrentStep(stepToReturnTo);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case CheckoutStep.Shipping:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <CheckoutForm 
              onSubmit={handleShippingSubmit} 
              isLoading={isLoading} 
              onError={setErrorMessage} 
            />
            {/* Render CouponInput in Shipping step */}
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
              <h4>Have a coupon?</h4>
              <CouponInput 
                onApplyCoupon={handleApplyCoupon} 
                isLoading={isCouponLoading} 
                error={couponError} 
                successMessage={couponSuccessMessage}
              />
              {couponError && <p className="coupon-error" style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>{couponError}</p>}
              {couponSuccessMessage && <p className="coupon-success" style={{ color: 'green', fontSize: '0.9em', marginTop: '5px' }}>{couponSuccessMessage}</p>}
            </div>
          </div>
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
        return (
          <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Order Summary</h2>
            
            {/* Render CouponInput in Review step */}
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
              <h4>Have a coupon?</h4>
              <CouponInput 
                onApplyCoupon={handleApplyCoupon} 
                isLoading={isCouponLoading} 
                error={couponError} 
                successMessage={couponSuccessMessage}
              />
              {couponError && <p className="coupon-error" style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>{couponError}</p>}
              {couponSuccessMessage && <p className="coupon-success" style={{ color: 'green', fontSize: '0.9em', marginTop: '5px' }}>{couponSuccessMessage}</p>}
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginBottom: '15px' }}>
              <h3>Items:</h3>
              {orderSummary.items.map(item => (
                <p key={item.id}>
                  {item.name} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                </p>
              ))}
            </div>
            <p>Subtotal: ${orderSummary.subtotal.toFixed(2)}</p>
            <p>Shipping: ${orderSummary.shippingCost.toFixed(2)}</p>
            <p>Tax: ${orderSummary.tax.toFixed(2)}</p>
            {orderSummary.discount !== undefined && orderSummary.discount > 0 && (
              <p style={{ color: 'green' }}>Discount: -${orderSummary.discount.toFixed(2)}</p>
            )}
            <p style={{ fontWeight: 'bold', fontSize: '1.1em' }}>Total: ${orderSummary.total.toFixed(2)}</p>
            
            <h3 style={{ marginTop: '20px' }}>Shipping To:</h3>
            {shippingData && (
              <p>
                {shippingData.fullName}<br />
                {shippingData.addressLine1}<br />
                {shippingData.addressLine2 && `${shippingData.addressLine2}<br />`}
                {shippingData.city}, {shippingData.state} {shippingData.postalCode}<br />
                {shippingData.country}
              </p>
            )}

            <h3 style={{ marginTop: '20px' }}>Payment Method:</h3>
            {paymentData && <p>{paymentData.paymentMethod === 'creditCard' ? 'Credit Card' : 'PayPal'}</p>}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button onClick={() => handleBack(CheckoutStep.Shipping)} disabled={isLoading || isCouponLoading} style={{ padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Back to Shipping</button>
              <button onClick={() => handleBack(CheckoutStep.Payment)} disabled={isLoading || isCouponLoading} style={{ padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Back to Payment</button>
              <button onClick={handleReviewSubmit} disabled={isLoading || isCouponLoading} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
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
