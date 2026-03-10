// src/__tests__/components/PaymentForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import PaymentForm, { PaymentDetails } from '../../src/components/PaymentForm';

describe('PaymentForm', () => {
  const mockOnSubmit = jest.fn<void, [PaymentDetails]>();
  const mockOnError = jest.fn<void, [string]>();

  // Helper function to fill credit card details
  const fillCreditCardForm = () => {
    fireEvent.change(screen.getByLabelText(/Card Number:/i), { target: { name: 'cardNumber', value: '1234567890123456' } });
    fireEvent.change(screen.getByLabelText(/Expiry Date \(MM\/YY\):/i), { target: { name: 'expiryDate', value: '12/25' } });
    fireEvent.change(screen.getByLabelText(/CVV:/i), { target: { name: 'cvv', value: '123' } });
  };

  beforeEach(() => {
    // Reset mocks and render the component before each test
    mockOnSubmit.mockClear();
    mockOnError.mockClear();
    render(
      <PaymentForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        onError={mockOnError}
      />
    );
  });

  // Happy Path Test: Credit Card
  test('should submit credit card details successfully', async () => {
    const paymentDetails: PaymentDetails = {
      paymentMethod: 'creditCard',
      cardNumber: '1234567890123456',
      expiryDate: '12/25',
      cvv: '123',
    };

    // Select Credit Card (it's the default, but good to be explicit if needed)
    // fireEvent.change(screen.getByLabelText(/Payment Method:/i), { target: { value: 'creditCard' } }); // Default is creditCard

    fillCreditCardForm();

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Confirm Payment/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(paymentDetails);
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  // Edge Case Test: Missing Credit Card Fields
  test('should show an error if required credit card fields are missing', async () => {
    // Attempt to submit with only partial credit card details
    fireEvent.change(screen.getByLabelText(/Card Number:/i), { target: { name: 'cardNumber', value: '1234567890123456' } });
    // Missing expiryDate and cvv

    fireEvent.click(screen.getByRole('button', { name: /Confirm Payment/i }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith('Please fill in all required credit card details.');
    });
  });

  // Test for PayPal selection
  test('should allow submission with PayPal selected (no fields required here)', async () => {
    const paymentDetails: PaymentDetails = {
      paymentMethod: 'paypal',
    };

    // Change payment method to PayPal
    fireEvent.change(screen.getByLabelText(/Payment Method:/i), { target: { value: 'paypal' } });

    // Check that credit card fields are hidden and PayPal message is visible
    expect(screen.queryByLabelText(/Card Number:/i)).not.toBeInTheDocument();
    expect(screen.getByText(/You will be redirected to PayPal to complete your payment./i)).toBeInTheDocument();

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Confirm Payment/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(paymentDetails);
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  // Test for isLoading state
  test('should disable the submit button and show "Processing..." when isLoading is true', () => {
    // Re-render with isLoading prop set to true
    render(
      <PaymentForm
        onSubmit={mockOnSubmit}
        isLoading={true}
        onError={mockOnError}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Processing.../i });
    expect(submitButton).toBeDisabled();
  });
});
