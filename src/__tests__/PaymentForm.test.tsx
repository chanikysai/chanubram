import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentForm, { PaymentDetails } from '../components/PaymentForm';
import { ShippingAddress } from '../components/CheckoutForm'; // Import ShippingAddress

describe('PaymentForm', () => {
  const mockOnSubmit = jest.fn<void, [PaymentDetails, ShippingAddress]>();
  const mockOnError = jest.fn<void, [string]>();
  const mockIsLoading = false;
  const mockShippingData: ShippingAddress = {
    fullName: 'Test User',
    addressLine1: '123 Test St',
    city: 'Testville',
    state: 'TS',
    postalCode: '12345',
    country: 'Testland',
  };

  // Happy Path Test - Credit Card
  test('should submit with valid credit card details', async () => {
    render(<PaymentForm onSubmit={mockOnSubmit} isLoading={mockIsLoading} onError={mockOnError} shippingData={mockShippingData} />);

    const cardNumberInput = screen.getByLabelText(/Card Number:/i);
    const expiryDateInput = screen.getByLabelText(/Expiry Date \(MM\/YY\):/i);
    const cvvInput = screen.getByLabelText(/CVV:/i);
    const submitButton = screen.getByRole('button', { name: /Confirm Payment/i });

    fireEvent.change(cardNumberInput, { target: { value: '1234567812345678' } });
    fireEvent.change(expiryDateInput, { target: { value: '12/25' } });
    fireEvent.change(cvvInput, { target: { value: '123' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(
        {
          paymentMethod: 'creditCard',
          cardNumber: '1234567812345678',
          expiryDate: '12/25',
          cvv: '123',
        },
        mockShippingData // Ensure shipping data is passed
      );
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  // Happy Path Test - PayPal
  test('should submit with PayPal selected', async () => {
    render(<PaymentForm onSubmit={mockOnSubmit} isLoading={mockIsLoading} onError={mockOnError} shippingData={mockShippingData} />);

    const paymentMethodSelect = screen.getByLabelText(/Payment Method:/i);
    const submitButton = screen.getByRole('button', { name: /Confirm Payment/i });

    // Change to PayPal
    fireEvent.change(paymentMethodSelect, { target: { value: 'paypal' } });

    // PayPal form elements are not present, so we directly click submit
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(
        {
          paymentMethod: 'paypal',
        },
        mockShippingData // Ensure shipping data is passed
      );
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  // Error Handling Test - Missing Credit Card Fields
  test('should show error message for missing credit card details', async () => {
    render(<PaymentForm onSubmit={mockOnSubmit} isLoading={mockIsLoading} onError={mockOnError} shippingData={mockShippingData} />);

    const submitButton = screen.getByRole('button', { name: /Confirm Payment/i });

    // Attempt to submit with empty CC fields (default is credit card)
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith('Please fill in all required credit card details.');
    });
  });

  // Test for loading state
  test('should disable inputs and button when isLoading is true', () => {
    render(<PaymentForm onSubmit={mockOnSubmit} isLoading={true} onError={mockOnError} shippingData={mockShippingData} />);

    const paymentMethodSelect = screen.getByLabelText(/Payment Method:/i);
    const cardNumberInput = screen.getByLabelText(/Card Number:/i); // This might not be rendered if method is not credit card
    const submitButton = screen.getByRole('button', { name: /Processing.../i });

    expect(paymentMethodSelect).toBeDisabled();
    // Check if card number input is disabled only if it's rendered
    if (screen.queryByLabelText(/Card Number:/i)) {
      expect(cardNumberInput).toBeDisabled();
    }
    expect(submitButton).toBeDisabled();
  });

  // Test changing payment method clears previous details (handled by reset in handleMethodChange)
  test('should reset payment details when changing payment method', () => {
    render(<PaymentForm onSubmit={mockOnSubmit} isLoading={mockIsLoading} onError={mockOnError} shippingData={mockShippingData} />);

    const paymentMethodSelect = screen.getByLabelText(/Payment Method:/i);
    const cardNumberInput = screen.getByLabelText(/Card Number:/i);
    const expiryDateInput = screen.getByLabelText(/Expiry Date \(MM\/YY\):/i);
    const cvvInput = screen.getByLabelText(/CVV:/i);

    // Fill CC details
    fireEvent.change(cardNumberInput, { target: { value: '1111222233334444' } });
    fireEvent.change(expiryDateInput, { target: { value: '01/26' } });
    fireEvent.change(cvvInput, { target: { value: '456' } });

    // Change to PayPal
    fireEvent.change(paymentMethodSelect, { target: { value: 'paypal' } });

    // Ensure CC fields are no longer visible or interactable in the same way
    // and the internal state for CC details is cleared
    expect(screen.queryByLabelText(/Card Number:/i)).toBeNull();
    expect(screen.queryByLabelText(/Expiry Date \(MM\/YY\):/i)).toBeNull();
    expect(screen.queryByLabelText(/CVV:/i)).toBeNull();

    // When submitting after switching to PayPal, it should not contain old CC details
    const submitButton = screen.getByRole('button', { name: /Confirm Payment/i });
    fireEvent.click(submitButton);

    // Should submit with only paymentMethod: 'paypal'
    expect(mockOnSubmit).toHaveBeenCalledWith(
      { paymentMethod: 'paypal' },
      mockShippingData
    );
  });
});
