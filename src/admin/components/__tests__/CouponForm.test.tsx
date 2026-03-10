import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CouponForm from '../CouponForm';

// Mock the onSubmit prop
const mockOnSubmit = jest.fn();

describe('CouponForm', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockOnSubmit.mockClear();
  });

  // Happy Path Test
  test('should call onSubmit with correct coupon data when form is filled', async () => {
    render(<CouponForm onSubmit={mockOnSubmit} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Coupon Code:/i), { target: { value: 'SUMMER20' } });
    fireEvent.change(screen.getByLabelText(/Discount Type:/i), { target: { value: 'percentage' } });
    fireEvent.change(screen.getByLabelText(/Discount Value:/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Valid From:/i), { target: { value: '2024-07-01' } });
    fireEvent.change(screen.getByLabelText(/Valid Until:/i), { target: { value: '2024-07-31' } });
    fireEvent.change(screen.getByLabelText(/Usage Limit \(optional\):/i), { target: { value: '50' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Coupon/i }));

    // Wait for potential async operations (though none are in the form itself yet)
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        code: 'SUMMER20',
        discountType: 'percentage',
        discountValue: 20,
        validFrom: '2024-07-01',
        validUntil: '2024-07-31',
        usageLimit: 50,
      });
    });
  });

  // Edge Case Test: Invalid Date Order (basic check, actual validation might be more complex)
  // The current form's native date input doesn't inherently prevent invalid order,
  // but we can simulate checking it if form logic were added.
  // For now, this test ensures submission is blocked if dates are problematic and
  // basic required fields are not met.
  test('should prevent submission if required fields are missing or dates are problematic', async () => {
    render(<CouponForm onSubmit={mockOnSubmit} />);

    // Fill in the form with dates in wrong order and missing fields
    fireEvent.change(screen.getByLabelText(/Coupon Code:/i), { target: { value: '' } }); // Missing code
    fireEvent.change(screen.getByLabelText(/Discount Type:/i), { target: { value: 'fixed' } });
    fireEvent.change(screen.getByLabelText(/Discount Value:/i), { target: { value: '0' } }); // Invalid value
    fireEvent.change(screen.getByLabelText(/Valid From:/i), { target: { value: '2024-12-31' } }); // End date
    fireEvent.change(screen.getByLabelText(/Valid Until:/i), { target: { value: '2024-12-01' } }); // Start date

    // Mock alert to check if it's called
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    fireEvent.click(screen.getByRole('button', { name: /Create Coupon/i }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      // The form's current validation checks for empty code and discount value <= 0.
      // If we added date order validation, we'd check for a more specific alert.
      expect(alertSpy).toHaveBeenCalledWith('Please fill in all required fields correctly.');
    });
    alertSpy.mockRestore(); // Restore original alert
  });

  // Error Handling Test (simulated missing required fields)
  test('should not call onSubmit if required fields are missing', async () => {
    render(<CouponForm onSubmit={mockOnSubmit} />);

    // Submit with missing required fields
    fireEvent.change(screen.getByLabelText(/Coupon Code:/i), { target: { value: '' } }); // Missing code
    fireEvent.change(screen.getByLabelText(/Discount Value:/i), { target: { value: '0' } }); // Invalid value

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    fireEvent.click(screen.getByRole('button', { name: /Create Coupon/i }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      // The current basic validation checks for empty code and discount value <= 0
      expect(alertSpy).toHaveBeenCalledWith('Please fill in all required fields correctly.');
    });
    alertSpy.mockRestore();
  });

  // Test for correct initial state
  test('should render with initial empty form state', () => {
    render(<CouponForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/Coupon Code:/i)).toHaveValue('');
    expect(screen.getByLabelText(/Discount Type:/i)).toHaveValue('percentage');
    expect(screen.getByLabelText(/Discount Value:/i)).toHaveValue(0);
    expect(screen.getByLabelText(/Valid From:/i)).toHaveValue('');
    expect(screen.getByLabelText(/Valid Until:/i)).toHaveValue('');
    expect(screen.getByLabelText(/Usage Limit \(optional\):/i)).toHaveValue(0);
  });
});
