import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CheckoutForm, { ShippingAddress } from '../components/CheckoutForm';

describe('CheckoutForm', () => {
  const mockOnSubmit = jest.fn<void, [ShippingAddress]>();
  const mockOnError = jest.fn<void, [string]>();
  const mockIsLoading = false;

  // Happy Path Test
  test('should submit with valid shipping information', async () => {
    render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={mockIsLoading} onError={mockOnError} />);

    const fullNameInput = screen.getByLabelText(/Full Name:/i);
    const addressLine1Input = screen.getByLabelText(/Address Line 1:/i);
    const cityInput = screen.getByLabelText(/City:/i);
    const stateInput = screen.getByLabelText(/State\/Province:/i);
    const postalCodeInput = screen.getByLabelText(/Postal Code:/i);
    const countryInput = screen.getByLabelText(/Country:/i);
    const submitButton = screen.getByRole('button', { name: /Continue to Payment/i });

    const testShippingData: ShippingAddress = {
      fullName: 'John Doe',
      addressLine1: '123 Main St',
      addressLine2: 'Apt 4B',
      city: 'Anytown',
      state: 'CA',
      postalCode: '90210',
      country: 'USA',
    };

    fireEvent.change(fullNameInput, { target: { value: testShippingData.fullName } });
    fireEvent.change(addressLine1Input, { target: { value: testShippingData.addressLine1 } });
    fireEvent.change(screen.getByLabelText(/Address Line 2 \(Optional\):/i), { target: { value: testShippingData.addressLine2 } });
    fireEvent.change(cityInput, { target: { value: testShippingData.city } });
    fireEvent.change(stateInput, { target: { value: testShippingData.state } });
    fireEvent.change(postalCodeInput, { target: { value: testShippingData.postalCode } });
    fireEvent.change(countryInput, { target: { value: testShippingData.country } });

    fireEvent.click(submitButton);

    // Check if onSubmit was called with the correct data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        fullName: 'John Doe',
        addressLine1: '123 Main St',
        addressLine2: 'Apt 4B',
        city: 'Anytown',
        state: 'CA',
        postalCode: '90210',
        country: 'USA',
      });
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  // Edge Case Test: Missing required field
  test('should show error message when required fields are missing', async () => {
    render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={mockIsLoading} onError={mockOnError} />);

    const submitButton = screen.getByRole('button', { name: /Continue to Payment/i });

    // Attempt to submit with empty form
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith('Please fill in all required shipping address fields.');
    });
  });

  // Edge Case Test: Submitting with only some required fields filled
  test('should show error message if only partial required fields are filled', async () => {
    render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={mockIsLoading} onError={mockOnError} />);

    const fullNameInput = screen.getByLabelText(/Full Name:/i);
    const addressLine1Input = screen.getByLabelText(/Address Line 1:/i);
    const submitButton = screen.getByRole('button', { name: /Continue to Payment/i });

    // Fill only name and address line 1
    fireEvent.change(fullNameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(addressLine1Input, { target: { value: '456 Oak Ave' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith('Please fill in all required shipping address fields.');
    });
  });

  // Test for loading state
  test('should disable inputs and button when isLoading is true', () => {
    render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={true} onError={mockOnError} />);

    const fullNameInput = screen.getByLabelText(/Full Name:/i);
    const addressLine1Input = screen.getByLabelText(/Address Line 1:/i);
    const submitButton = screen.getByRole('button', { name: /Saving.../i });

    expect(fullNameInput).toBeDisabled();
    expect(addressLine1Input).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
});
