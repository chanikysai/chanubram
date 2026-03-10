import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import PaymentForm, { PaymentDetails } from '../../src/components/PaymentForm';

describe('PaymentForm', () => {
  const mockOnSubmit = jest.fn<void, [PaymentDetails]>();
  const mockOnError = jest.fn<void, [string]>();
  const mockIsLoading = false;

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnError.mockClear();
  });

  test('renders with credit card fields by default', () => {
    render(<PaymentForm onSubmit={mockOnSubmit} isLoading={mockIsLoading} onError={mockOnError} />);

    expect(screen.getByLabelText(/payment method/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Credit Card' })).toBeSelected();
    expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expiry date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cvv/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm payment/i })).toBeInTheDocument();
  });

  test('switches to PayPal option when selected', () => {
    render(<PaymentForm onSubmit={mockOnSubmit} isLoading={mockIsLoading} onError={mockOnError} />);

    const methodSelect = screen.getByLabelText(/payment method/i) as HTMLSelectElement;
    fireEvent.change(methodSelect, { target: { value: 'paypal' } });

    expect(screen.queryByLabelText(/card number/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/expiry date/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/cvv/i)).not.toBeInTheDocument();
    expect(screen.getByText(/you will be redirected to paypal/i)).toBeInTheDocument();
  });

  test('handles credit card input changes correctly', () => {
    render(<PaymentForm onSubmit={mockOnSubmit} isLoading={mockIsLoading} onError={mockOnError} />);

    const cardNumberInput = screen.getByLabelText(/card number/i) as HTMLInputElement;
    const expiryDateInput = screen.getByLabelText(/expiry date/i) as HTMLInputElement;
    const cvvInput = screen.getByLabelText(/cvv/i) as HTMLInputElement;

    fireEvent.change(cardNumberInput, { target: { name: 'cardNumber', value: '1111222233334444' } });
    fireEvent.change(expiryDateInput, { target: { name: 'expiryDate', value: '12/25' } });
    fireEvent.change(cvvInput, { target: { name: 'cvv', value: '123' } });

    expect(cardNumberInput).toHaveValue('1111222233334444');
    expect(expiryDateInput).toHaveValue('12/25');
    expect(cvvInput).toHaveValue('123');
  });

  test('calls onSubmit with correct credit card details on valid submission', async () => {
    render(<PaymentForm onSubmit={mockOnSubmit} isLoading={mockIsLoading} onError={mockOnError} />);

    // Fill credit card details
    fireEvent.change(screen.getByLabelText(/card number/i), { target: { name: 'cardNumber', value: '1111222233334444' } });
    fireEvent.change(screen.getByLabelText(/expiry date/i), { target: { name: 'expiryDate', value: '12/25' } });
    fireEvent.change(screen.getByLabelText(/cvv/i), { target: { name: 'cvv', value: '123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /confirm payment/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        paymentMethod: 'creditCard',
        cardNumber: '1111222233334444',
        expiryDate: '12/25',
        cvv: '123',
      });
    });
  });

  test('calls onError if required credit card fields are missing on submit', async () => {
    render(<PaymentForm onSubmit={mockOnSubmit} isLoading={mockIsLoading} onError={mockOnError} />);

    // Submit with missing CVV
    fireEvent.change(screen.getByLabelText(/card number/i), { target: { name: 'cardNumber', value: '1111222233334444' } });
    fireEvent.change(screen.getByLabelText(/expiry date/i), { target: { name: 'expiryDate', value: '12/25' } });
    // CVV is missing

    fireEvent.click(screen.getByRole('button', { name: /confirm payment/i }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith('Please fill in all required credit card details.');
    });
  });

  test('calls onSubmit for PayPal and does not require CC fields', async () => {
    render(<PaymentForm onSubmit={mockOnSubmit} isLoading={mockIsLoading} onError={mockOnError} />);

    // Select PayPal
    const methodSelect = screen.getByLabelText(/payment method/i) as HTMLSelectElement;
    fireEvent.change(methodSelect, { target: { value: 'paypal' } });

    // Submit the form for PayPal
    fireEvent.click(screen.getByRole('button', { name: /confirm payment/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        paymentMethod: 'paypal',
      });
      expect(mockOnError).not.toHaveBeenCalled(); // Should not error if PayPal is selected
    });
  });

  test('disables submit button when isLoading is true', () => {
    render(<PaymentForm onSubmit={mockOnSubmit} isLoading={true} onError={mockOnError} />);

    const submitButton = screen.getByRole('button', { name: /processing\.\.\./i });
    expect(submitButton).toBeDisabled();
  });
});
