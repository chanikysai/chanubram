import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import CheckoutForm, { ShippingAddress } from '../../src/components/CheckoutForm';

describe('CheckoutForm', () => {
  const mockOnSubmit = jest.fn<void, [ShippingAddress]>();
  const mockOnError = jest.fn<void, [string]>();
  const mockIsLoading = false;

  beforeEach(() => {
    // Reset mocks before each test
    mockOnSubmit.mockClear();
    mockOnError.mockClear();
  });

  test('renders with all shipping fields', () => {
    render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={mockIsLoading} onError={mockOnError} />);

    // Check if all input fields are present
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address line 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address line 2/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/state\/province/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/postal code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue to payment/i })).toBeInTheDocument();
  });

  test('handles input changes correctly', () => {
    render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={mockIsLoading} onError={mockOnError} />);

    const fullNameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    const cityInput = screen.getByLabelText(/city/i) as HTMLInputElement;

    fireEvent.change(fullNameInput, { target: { name: 'fullName', value: 'John Doe' } });
    fireEvent.change(cityInput, { target: { name: 'city', value: 'Metropolis' } });

    expect(fullNameInput).toHaveValue('John Doe');
    expect(cityInput).toHaveValue('Metropolis');
  });

  test('calls onSubmit with correct shipping data on valid submission', async () => {
    render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={mockIsLoading} onError={mockOnError} />);

    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { name: 'fullName', value: 'Jane Smith' } });
    fireEvent.change(screen.getByLabelText(/address line 1/i), { target: { name: 'addressLine1', value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { name: 'city', value: 'Anytown' } });
    fireEvent.change(screen.getByLabelText(/state\/province/i), { target: { name: 'state', value: 'CA' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { name: 'postalCode', value: '90210' } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { name: 'country', value: 'USA' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }));

    // Wait for potential asynchronous operations (though not strictly needed here as it's synchronous)
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        fullName: 'Jane Smith',
        addressLine1: '123 Main St',
        addressLine2: '', // Optional field, should be empty
        city: 'Anytown',
        state: 'CA',
        postalCode: '90210',
        country: 'USA',
      });
    });
  });

  test('calls onError with error message if required fields are missing', async () => {
    render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={mockIsLoading} onError={mockOnError} />);

    // Submit the form with missing required fields (e.g., only fullName)
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { name: 'fullName', value: 'Jane Smith' } });
    
    fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith('Please fill in all required shipping address fields.');
    });
  });

  test('disables submit button when isLoading is true', () => {
    render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={true} onError={mockOnError} />);

    const submitButton = screen.getByRole('button', { name: /processing\.\.\./i });
    expect(submitButton).toBeDisabled();
  });
});
