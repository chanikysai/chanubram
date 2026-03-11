import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useNavigate } from 'react-router-dom';

import CheckoutPage from '../pages/CheckoutPage';
import { processPayment } from '../services/paymentApi';
import { ShippingAddress } from '../components/CheckoutForm';

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mock the payment API
jest.mock('../services/paymentApi');

// Mock CouponInput component to simplify testing CheckoutPage
jest.mock('../components/CouponInput', () => ({
  __esModule: true,
  default: ({ onApplyCoupon, isLoading, error, successMessage }: any) => (
    <div>
      <input type="text" placeholder="Coupon code" />
      <button onClick={() => onApplyCoupon('TEST10')} disabled={isLoading}>Apply Coupon</button>
      {error && <p className="coupon-error">{error}</p>}
      {successMessage && <p className="coupon-success">{successMessage}</p>}
    </div>
  ),
}));

const mockNavigate = jest.fn();
const mockProcessPayment = processPayment as jest.Mock;

// Mock Shipping Address and Payment Details
const mockShippingAddress: ShippingAddress = {
  fullName: 'John Doe',
  addressLine1: '123 Main St',
  addressLine2: 'Apt 4B',
  city: 'Anytown',
  state: 'CA',
  postalCode: '90210',
  country: 'USA',
};

const mockCreditCardPaymentDetails = {
  paymentMethod: 'creditCard' as const,
  cardNumber: '1111222233334444',
  expiryDate: '12/25',
  cvv: '123',
};

const mockPayPalPaymentDetails = {
  paymentMethod: 'paypal' as const,
};


describe('CheckoutPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    mockProcessPayment.mockClear();
    // Mock processPayment to return a successful response by default
    mockProcessPayment.mockResolvedValue({ success: true, transactionId: 'txn_12345', message: 'Payment successful!' });
    // Mock the coupon application logic within the component's render for simplicity
    // In a real scenario, you might mock the handleApplyCoupon directly or test the component's internal logic
  });

  // Test 1: Initial render and submission of shipping information
  test('should render shipping form and navigate to review on submit', async () => {
    render(<CheckoutPage />);

    // Verify initial state
    expect(screen.getByRole('heading', { name: /checkout/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /shipping address/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue to Payment/i })).toBeInTheDocument();

    // Fill shipping form
    fireEvent.change(screen.getByLabelText(/Full Name:/i), { target: { value: mockShippingAddress.fullName } });
    fireEvent.change(screen.getByLabelText(/Address Line 1:/i), { target: { value: mockShippingAddress.addressLine1 } });
    fireEvent.change(screen.getByLabelText(/Address Line 2 \(Optional\):/i), { target: { value: mockShippingAddress.addressLine2 } });
    fireEvent.change(screen.getByLabelText(/City:/i), { target: { value: mockShippingAddress.city } });
    fireEvent.change(screen.getByLabelText(/State\/Province:/i), { target: { value: mockShippingAddress.state } });
    fireEvent.change(screen.getByLabelText(/Postal Code:/i), { target: { value: mockShippingAddress.postalCode } });
    fireEvent.change(screen.getByLabelText(/Country:/i), { target: { value: mockShippingAddress.country } });

    // Submit shipping form
    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    // Wait for navigation to Review step
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /order summary/i })).toBeInTheDocument();
      expect(screen.getByText(/123 Main St/i)).toBeInTheDocument(); // Verify shipping address is shown
    });
  });

  // Test 2: Applying a coupon (simulated by mock CouponInput)
  test('should apply coupon and update total', async () => {
    render(<CheckoutPage />);

    // Fill shipping form first to get to Review step
    fireEvent.change(screen.getByLabelText(/Full Name:/i), { target: { value: mockShippingAddress.fullName } });
    fireEvent.change(screen.getByLabelText(/Address Line 1:/i), { target: { value: mockShippingAddress.addressLine1 } });
    fireEvent.change(screen.getByLabelText(/City:/i), { target: { value: mockShippingAddress.city } });
    fireEvent.change(screen.getByLabelText(/State\/Province:/i), { target: { value: mockShippingAddress.state } });
    fireEvent.change(screen.getByLabelText(/Postal Code:/i), { target: { value: mockShippingAddress.postalCode } });
    fireEvent.change(screen.getByLabelText(/Country:/i), { target: { value: mockShippingAddress.country } });
    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /order summary/i })).toBeInTheDocument();
    });

    // Mock the handleApplyCoupon to simulate success
    // For simplicity, the mock CouponInput already calls onApplyCoupon with 'TEST10'
    // We need to ensure the component correctly updates the total.
    // The default mockCouponInput's onApplyCoupon will call handleApplyCoupon with 'TEST10'
    // For this test, let's assume 'TEST10' gives a 10% discount on subtotal
    // Initial subtotal is 89.49. 10% discount is 8.949. Total before discount: 101.65
    // Total after discount: 101.65 - 8.949 = 92.701 (approx 92.70)

    // Mock the actual discount logic here if the component doesn't directly expose it
    // For now, let's assume the mock CouponInput works and updates the UI correctly.
    // We'll click the apply button in the rendered mock component.
    const applyCouponButton = screen.getByRole('button', { name: /Apply Coupon/i });
    fireEvent.click(applyCouponButton);

    // Wait for coupon success message and total update
    await waitFor(() => {
      // The mock CouponInput will display a generic success message if we didn't mock it to return specific ones.
      // Let's check for the total value update.
      // The mock processPayment needs to be controlled here as well if coupon affects it.
      // Let's adjust mock processPayment and handleApplyCoupon logic within the component
      // The CheckoutPage's handleApplyCoupon mocks the discount logic.
      // We need to verify that the discount is applied and total is updated.
      // Given the provided code, it will use 'DISCOUNT10' or 'SAVE20'.
      // Let's re-render and simulate applying 'DISCOUNT10' directly.

      // Reset state to re-render and test coupon more directly
      render(<CheckoutPage />);
      fireEvent.change(screen.getByLabelText(/Full Name:/i), { target: { value: mockShippingAddress.fullName } });
      fireEvent.change(screen.getByLabelText(/Address Line 1:/i), { target: { value: mockShippingAddress.addressLine1 } });
      fireEvent.change(screen.getByLabelText(/City:/i), { target: { value: mockShippingAddress.city } });
      fireEvent.change(screen.getByLabelText(/State\/Province:/i), { target: { value: mockShippingAddress.state } });
      fireEvent.change(screen.getByLabelText(/Postal Code:/i), { target: { value: mockShippingAddress.postalCode } });
      fireEvent.change(screen.getByLabelText(/Country:/i), { target: { value: mockShippingAddress.country } });
      fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));
      
      // Now simulate applying 'DISCOUNT10' using a direct call to the component's internal logic
      // This requires more advanced testing techniques or modifying the component to expose handlers.
      // For simplicity, let's test the outcome: checking for the discounted total.
      // Initial subtotal: 89.49, shipping: 5.00, tax: 7.16. Total: 101.65
      // DISCOUNT10 applies 10% of subtotal: 89.49 * 0.10 = 8.949 discount
      // New Total = 101.65 - 8.949 = 92.701

      // The mock CouponInput component renders an input and a button.
      // We can interact with it.
      const couponInput = screen.getByPlaceholderText(/Coupon code/i);
      fireEvent.change(couponInput, { target: { value: 'DISCOUNT10' } });
      fireEvent.click(screen.getByRole('button', { name: /Apply Coupon/i }));

      await waitFor(() => {
        expect(screen.getByText(/Coupon DISCOUNT10 applied!/i)).toBeInTheDocument();
        // Check if total reflects the discount. Use a tolerance for floating point comparisons.
        const totalText = screen.getByText(/Total: \$[0-9.]+/i).textContent;
        expect(totalText).toContain('92.70'); // Expecting approximately 92.70
      });
    });
  });

  // Test 3: Submitting Payment (Credit Card Happy Path)
  test('should submit payment and navigate to confirmation on success', async () => {
    render(<CheckoutPage />);

    // Navigate to payment step by completing shipping and reviewing
    // Fill shipping form
    fireEvent.change(screen.getByLabelText(/Full Name:/i), { target: { value: mockShippingAddress.fullName } });
    fireEvent.change(screen.getByLabelText(/Address Line 1:/i), { target: { value: mockShippingAddress.addressLine1 } });
    fireEvent.change(screen.getByLabelText(/City:/i), { target: { value: mockShippingAddress.city } });
    fireEvent.change(screen.getByLabelText(/State\/Province:/i), { target: { value: mockShippingAddress.state } });
    fireEvent.change(screen.getByLabelText(/Postal Code:/i), { target: { value: mockShippingAddress.postalCode } });
    fireEvent.change(screen.getByLabelText(/Country:/i), { target: { value: mockShippingAddress.country } });
    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i })); // This moves to Review

    // Click to proceed to Payment
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /order summary/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Back to Payment/i })); // Navigate to Payment step

    // Fill payment form (Credit Card)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /payment information/i })).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText(/Card Number:/i), { target: { value: mockCreditCardPaymentDetails.cardNumber } });
    fireEvent.change(screen.getByLabelText(/Expiry Date \(MM\/YY\):/i), { target: { value: mockCreditCardPaymentDetails.expiryDate } });
    fireEvent.change(screen.getByLabelText(/CVV:/i), { target: { value: mockCreditCardPaymentDetails.cvv } });

    // Submit payment
    fireEvent.click(screen.getByRole('button', { name: /Confirm Payment/i }));

    // Wait for processPayment to be called and for navigation to Confirmation
    await waitFor(() => {
      expect(mockProcessPayment).toHaveBeenCalledTimes(1);
      expect(mockProcessPayment).toHaveBeenCalledWith(
        mockCreditCardPaymentDetails,
        mockShippingAddress, // Ensure shipping address is passed
        expect.objectContaining({ total: expect.any(Number) }) // Check orderSummary is passed
      );
      expect(screen.getByRole('heading', { name: /order confirmed!/i })).toBeInTheDocument();
      expect(screen.getByText(/your transaction id is: txn_12345/i)).toBeInTheDocument();
    });
  });

  // Test 4: Handling Payment Error
  test('should display error message and stay on review step on payment failure', async () => {
    // Mock processPayment to return a failed response
    mockProcessPayment.mockResolvedValue({ success: false, message: 'Payment declined.' });

    render(<CheckoutPage />);

    // Navigate to payment step
    fireEvent.change(screen.getByLabelText(/Full Name:/i), { target: { value: mockShippingAddress.fullName } });
    fireEvent.change(screen.getByLabelText(/Address Line 1:/i), { target: { value: mockShippingAddress.addressLine1 } });
    fireEvent.change(screen.getByLabelText(/City:/i), { target: { value: mockShippingAddress.city } });
    fireEvent.change(screen.getByLabelText(/State\/Province:/i), { target: { value: mockShippingAddress.state } });
    fireEvent.change(screen.getByLabelText(/Postal Code:/i), { target: { value: mockShippingAddress.postalCode } });
    fireEvent.change(screen.getByLabelText(/Country:/i), { target: { value: mockShippingAddress.country } });
    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /order summary/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Back to Payment/i }));

    // Fill payment form
    fireEvent.change(screen.getByLabelText(/Card Number:/i), { target: { value: mockCreditCardPaymentDetails.cardNumber } });
    fireEvent.change(screen.getByLabelText(/Expiry Date \(MM\/YY\):/i), { target: { value: mockCreditCardPaymentDetails.expiryDate } });
    fireEvent.change(screen.getByLabelText(/CVV:/i), { target: { value: mockCreditCardPaymentDetails.cvv } });

    // Submit payment
    fireEvent.click(screen.getByRole('button', { name: /Confirm Payment/i }));

    // Wait for error message and check that we are still on the review step
    await waitFor(() => {
      expect(screen.getByText(/payment declined\./i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /order summary/i })).toBeInTheDocument(); // Still on review
      expect(screen.getByRole('button', { name: /Place Order/i })).toBeInTheDocument(); // Place Order button visible
    });
  });

  // Test 5: Navigation Back
  test('should navigate back to previous steps', async () => {
    render(<CheckoutPage />);

    // Navigate to Review
    fireEvent.change(screen.getByLabelText(/Full Name:/i), { target: { value: mockShippingAddress.fullName } });
    fireEvent.change(screen.getByLabelText(/Address Line 1:/i), { target: { value: mockShippingAddress.addressLine1 } });
    fireEvent.change(screen.getByLabelText(/City:/i), { target: { value: mockShippingAddress.city } });
    fireEvent.change(screen.getByLabelText(/State\/Province:/i), { target: { value: mockShippingAddress.state } });
    fireEvent.change(screen.getByLabelText(/Postal Code:/i), { target: { value: mockShippingAddress.postalCode } });
    fireEvent.change(screen.getByLabelText(/Country:/i), { target: { value: mockShippingAddress.country } });
    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /order summary/i })).toBeInTheDocument();
    });

    // Click "Back to Shipping" from Review
    fireEvent.click(screen.getByRole('button', { name: /Back to Shipping/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /shipping address/i })).toBeInTheDocument();
    });

    // Navigate back to Review
    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /order summary/i })).toBeInTheDocument();
    });

    // Click "Back to Payment" from Review
    fireEvent.click(screen.getByRole('button', { name: /Back to Payment/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /payment information/i })).toBeInTheDocument();
    });
  });

  // Test 6: Loading State for Buttons and Inputs
  test('should disable controls and show loading text when processing', async () => {
    // Mocking processPayment to simulate a delay
    mockProcessPayment.mockResolvedValueOnce(new Promise(resolve => setTimeout(() => resolve({ success: true, transactionId: 'txn_abc', message: 'Success' }), 100)));

    render(<CheckoutPage />);

    // Navigate to payment step
    fireEvent.change(screen.getByLabelText(/Full Name:/i), { target: { value: mockShippingAddress.fullName } });
    fireEvent.change(screen.getByLabelText(/Address Line 1:/i), { target: { value: mockShippingAddress.addressLine1 } });
    fireEvent.change(screen.getByLabelText(/City:/i), { target: { value: mockShippingAddress.city } });
    fireEvent.change(screen.getByLabelText(/State\/Province:/i), { target: { value: mockShippingAddress.state } });
    fireEvent.change(screen.getByLabelText(/Postal Code:/i), { target: { value: mockShippingAddress.postalCode } });
    fireEvent.change(screen.getByLabelText(/Country:/i), { target: { value: mockShippingAddress.country } });
    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /order summary/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Back to Payment/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /payment information/i })).toBeInTheDocument();
    });

    // Fill payment form
    fireEvent.change(screen.getByLabelText(/Card Number:/i), { target: { value: mockCreditCardPaymentDetails.cardNumber } });
    fireEvent.change(screen.getByLabelText(/Expiry Date \(MM\/YY\):/i), { target: { value: mockCreditCardPaymentDetails.expiryDate } });
    fireEvent.change(screen.getByLabelText(/CVV:/i), { target: { value: mockCreditCardPaymentDetails.cvv } });

    const confirmPaymentButton = screen.getByRole('button', { name: /Confirm Payment/i });
    fireEvent.click(confirmPaymentButton);

    // Check loading state
    await waitFor(() => {
      expect(confirmPaymentButton).toBeDisabled();
      expect(screen.getByRole('button', { name: /Processing.../i })).toBeInTheDocument();
    });

    // After processing, it should become non-loading
    await waitFor(() => {
      expect(confirmPaymentButton).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /Confirm Payment/i })).toBeInTheDocument();
    });
  });
});
