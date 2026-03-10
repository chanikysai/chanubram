// src/__tests__/components/CheckoutForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import CheckoutForm, { ShippingAddress } from '../../src/components/CheckoutForm';

describe('CheckoutForm', () => {
  const mockOnSubmit = jest.fn<void, [ShippingAddress]>();
  const mockOnError = jest.fn<void, [string]>();

  beforeEach(() => {
    // Reset mocks before each test
    mockOnSubmit.mockClear();
    mockOnError.mockClear();
    // Render the component before each test
    render(
      <CheckoutForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        onError={mockOnError}
      />
    );
  });

  // Happy Path Test
  test('should submit shipping information successfully when all fields are filled', async () => {
    const shippingData: ShippingAddress = {
      fullName: 'John Doe',
      addressLine1: '123 Main St',
      addressLine2: 'Apt 4B',
      city: 'Anytown',
      state: 'CA',
      postalCode: '90210',
      country: 'USA',
    };

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Full Name:/i), { target: { name: 'fullName', value: shippingData.fullName } });
    fireEvent.change(screen.getByLabelText(/Address Line 1:/i), { target: { name: 'addressLine1', value: shippingData.addressLine1 } });
    fireEvent.change(screen.getByLabelText(/Address Line 2 \(Optional\):/i), { target: { name: 'addressLine2', value: shippingData.addressLine2 } });
    fireEvent.change(screen.getByLabelText(/City:/i), { target: { name: 'city', value: shippingData.city } });
    fireEvent.change(screen.getByLabelText(/State\/Province:/i), { target: { name: 'state', value: shippingData.state } });
    fireEvent.change(screen.getByLabelText(/Postal Code:/i), { target: { name: 'postalCode', value: shippingData.postalCode } });
    fireEvent.change(screen.getByLabelText(/Country:/i), { target: { name: 'country', value: shippingData.country } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    // Wait for potential async operations (though none in this specific form submit)
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(shippingData);
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  // Edge Case Test: Missing Required Fields
  test('should display an error message when required fields are missing', async () => {
    // Attempt to submit with only some fields filled
    fireEvent.change(screen.getByLabelText(/Full Name:/i), { target: { name: 'fullName', value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/City:/i), { target: { name: 'city', value: 'Somecity' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    // Check that onSubmit was not called and onError was called
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith('Please fill in all required shipping address fields.');
    });
  });

  // Error Handling Test (if onError prop is used for general errors)
  test('should call onError prop with an error message if validation fails', async () => {
    // Fill partially, similar to the edge case test, to trigger validation failure
    fireEvent.change(screen.getByLabelText(/Full Name:/i), { target: { name: 'fullName', value: 'Test User' } });
    // Leave other required fields blank intentionally

    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith('Please fill in all required shipping address fields.');
    });
  });

  // Test disabling button when isLoading is true
  test('should disable the submit button when isLoading is true', () => {
    // Re-render with isLoading prop set to true
    render(
      <CheckoutForm
        onSubmit={mockOnSubmit}
        isLoading={true}
        onError={mockOnError}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Processing.../i });
    expect(submitButton).toBeDisabled();
  });
});
