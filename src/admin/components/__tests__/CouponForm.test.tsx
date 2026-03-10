// src/admin/components/__tests__/CouponForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CouponForm from '../CouponForm';
import { DiscountType } from '../../../types/coupon';

describe('CouponForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  // Happy Path - Create New
  test('should call onSubmit with correct data when creating a new coupon', async () => {
    render(<CouponForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Coupon Code/i), { target: { value: 'SUMMER20' } });
    fireEvent.change(screen.getByLabelText(/Discount Type/i), { target: { value: DiscountType.PERCENTAGE } });
    fireEvent.change(screen.getByLabelText(/Discount Value \(%\)/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Valid From/i), { target: { value: '2024-07-01' } });
    fireEvent.change(screen.getByLabelText(/Valid To/i), { target: { value: '2024-07-31' } });
    fireEvent.change(screen.getByLabelText(/Usage Limit \(Optional\)/i), { target: { value: '100' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Coupon/i }));

    // Wait for submission and check if onSubmit was called with correct data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        code: 'SUMMER20',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        validFrom: new Date('2024-07-01T00:00:00.000Z').toISOString(),
        validTo: new Date('2024-07-31T00:00:00.000Z').toISOString(),
        usageLimit: 100,
      });
    });
  });

  // Happy Path - Edit Existing
  test('should pre-fill form and call onSubmit with updated data when editing a coupon', async () => {
    const existingCoupon = {
      id: 'c1',
      code: 'OLDCODE',
      discountType: DiscountType.FIXED,
      discountValue: 10,
      validFrom: new Date('2024-01-01').toISOString(),
      validTo: new Date('2024-01-31').toISOString(),
      usageLimit: 50,
      currentUsage: 10,
      isActive: true,
    };
    render(<CouponForm coupon={existingCoupon} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    // Verify form is pre-filled
    expect(screen.getByLabelText(/Coupon Code/i)).toHaveValue('OLDCODE');
    expect(screen.getByLabelText(/Discount Type/i)).toHaveValue(DiscountType.FIXED);
    expect(screen.getByLabelText(/Discount Value \(\$\)/i)).toHaveValue('10');
    expect(screen.getByLabelText(/Valid From/i)).toHaveValue('2024-01-01');
    expect(screen.getByLabelText(/Valid To/i)).toHaveValue('2024-01-31');
    expect(screen.getByLabelText(/Usage Limit \(Optional\)/i)).toHaveValue('50');
    expect(screen.getByRole('button', { name: /Update Coupon/i })).toBeInTheDocument();
    // Code input should be disabled for editing
    expect(screen.getByLabelText(/Coupon Code/i)).toBeDisabled();

    // Change some values
    fireEvent.change(screen.getByLabelText(/Discount Value \(\$\)/i), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText(/Valid To/i), { target: { value: '2024-02-15' } });
    fireEvent.change(screen.getByLabelText(/Usage Limit \(Optional\)/i), { target: { value: '' } }); // Clear usage limit

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Update Coupon/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        code: 'OLDCODE', // Unchanged
        discountType: DiscountType.FIXED, // Unchanged
        discountValue: 15, // Updated
        validFrom: new Date('2024-01-01T00:00:00.000Z').toISOString(), // Unchanged
        validTo: new Date('2024-02-15T00:00:00.000Z').toISOString(), // Updated
        usageLimit: null, // Updated (cleared)
      });
    });
  });

  // Cancel functionality
  test('should call onCancel when Cancel button is clicked', () => {
    render(<CouponForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  // Validation - Required fields
  test('should display error message for missing required fields', async () => {
    render(<CouponForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    // Submit with empty fields
    fireEvent.click(screen.getByRole('button', { name: /Create Coupon/i }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('All fields except Usage Limit are required.')).toBeInTheDocument();
    });
  });

  // Validation - Discount Value
  test('should display error for negative discount value', async () => {
    render(<CouponForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    fireEvent.change(screen.getByLabelText(/Coupon Code/i), { target: { value: 'CODE' } });
    fireEvent.change(screen.getByLabelText(/Discount Value \(%\)/i), { target: { value: '-10' } });
    fireEvent.change(screen.getByLabelText(/Valid From/i), { target: { value: '2024-07-01' } });
    fireEvent.change(screen.getByLabelText(/Valid To/i), { target: { value: '2024-07-31' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Coupon/i }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Discount Value must be a non-negative number.')).toBeInTheDocument();
    });
  });

  // Validation - Usage Limit
  test('should display error for non-positive usage limit', async () => {
    render(<CouponForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    fireEvent.change(screen.getByLabelText(/Coupon Code/i), { target: { value: 'CODE' } });
    fireEvent.change(screen.getByLabelText(/Discount Value \(%\)/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Valid From/i), { target: { value: '2024-07-01' } });
    fireEvent.change(screen.getByLabelText(/Valid To/i), { target: { value: '2024-07-31' } });
    fireEvent.change(screen.getByLabelText(/Usage Limit \(Optional\)/i), { target: { value: '0' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Coupon/i }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Usage Limit must be a positive integer or empty.')).toBeInTheDocument();
    });
  });

  // Validation - Date Range
  test('should display error for invalid date range', async () => {
    render(<CouponForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    fireEvent.change(screen.getByLabelText(/Coupon Code/i), { target: { value: 'CODE' } });
    fireEvent.change(screen.getByLabelText(/Discount Value \(%\)/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Valid From/i), { target: { value: '2024-07-31' } }); // End date is before start date
    fireEvent.change(screen.getByLabelText(/Valid To/i), { target: { value: '2024-07-01' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Coupon/i }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Valid To date must be after Valid From date.')).toBeInTheDocument();
    });
  });

  // Edge Case - Empty usage limit on submit
  test('should handle empty usage limit as null', async () => {
    render(<CouponForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/Coupon Code/i), { target: { value: 'UNLIMITED' } });
    fireEvent.change(screen.getByLabelText(/Discount Type/i), { target: { value: DiscountType.FIXED } });
    fireEvent.change(screen.getByLabelText(/Discount Value \(\$\)/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Valid From/i), { target: { value: '2024-08-01' } });
    fireEvent.change(screen.getByLabelText(/Valid To/i), { target: { value: '2024-08-31' } });
    // Usage limit left empty

    fireEvent.click(screen.getByRole('button', { name: /Create Coupon/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        usageLimit: null, // Should be null when empty
      }));
    });
  });

  // Edge Case - Coupon code becomes uppercase
  test('should automatically convert coupon code to uppercase', () => {
    render(<CouponForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const codeInput = screen.getByLabelText(/Coupon Code/i);
    fireEvent.change(codeInput, { target: { value: 'Summer20' } });
    expect(codeInput).toHaveValue('SUMMER20');
  });
});
