import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CouponInput from '../CouponInput';

// Mock the onApplyCoupon prop and the couponApi
const mockOnApplyCoupon = jest.fn();

// Mock the couponApi module
jest.mock('../services/couponApi', () => ({
  applyCoupon: jest.fn(),
}));

// Import the mocked applyCoupon function
// We need to import it AFTER mocking to ensure we get the mocked version
import { applyCoupon } from '../services/couponApi';

describe('CouponInput', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockOnApplyCoupon.mockClear();
    // Clear the mock implementation of applyCoupon
    (applyCoupon as jest.Mock).mockClear();
  });

  // Happy Path Test
  test('should call onApplyCoupon with the coupon code when apply is clicked', async () => {
    // Mock successful application
    (applyCoupon as jest.Mock).mockResolvedValue({ success: true, message: 'Coupon applied successfully!' });

    render(<CouponInput onApplyCoupon={mockOnApplyCoupon} isLoading={false} error={null} successMessage={null} />);

    const couponInput = screen.getByPlaceholderText(/Enter coupon code/i);
    const applyButton = screen.getByRole('button', { name: /Apply Coupon/i });

    fireEvent.change(couponInput, { target: { value: 'SAVE10' } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(couponInput).toHaveValue('SAVE10');
      expect(mockOnApplyCoupon).toHaveBeenCalledTimes(1);
      expect(mockOnApplyCoupon).toHaveBeenCalledWith('SAVE10');
    });
  });

  // Test for loading state
  test('should show "Applying..." and disable input/button when isLoading is true', () => {
    render(<CouponInput onApplyCoupon={mockOnApplyCoupon} isLoading={true} error={null} successMessage={null} />);

    const applyButton = screen.getByRole('button', { name: /Applying.../i });
    const couponInput = screen.getByPlaceholderText(/Enter coupon code/i);

    expect(applyButton).toBeDisabled();
    expect(couponInput).toBeDisabled();
  });

  // Test for displaying error message
  test('should display an error message if provided', () => {
    const errorMessage = 'Invalid coupon code.';
    render(<CouponInput onApplyCoupon={mockOnApplyCoupon} isLoading={false} error={errorMessage} successMessage={null} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apply Coupon/i })).not.toBeDisabled();
  });

  // Test for displaying success message
  test('should display a success message if provided', () => {
    const successMsg = 'Coupon applied successfully!';
    render(<CouponInput onApplyCoupon={mockOnApplyCoupon} isLoading={false} error={null} successMessage={successMsg} />);

    expect(screen.getByText(successMsg)).toBeInTheDocument();
  });

  // Edge Case: Empty input
  test('should alert user if apply is clicked with empty coupon code', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<CouponInput onApplyCoupon={mockOnApplyCoupon} isLoading={false} error={null} successMessage={null} />);

    const applyButton = screen.getByRole('button', { name: /Apply Coupon/i });
    fireEvent.click(applyButton);

    expect(mockOnApplyCoupon).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Please enter a coupon code.');

    alertSpy.mockRestore();
  });

  // Test for correct initial state
  test('should render with an empty input and enabled apply button initially', () => {
    render(<CouponInput onApplyCoupon={mockOnApplyCoupon} isLoading={false} error={null} successMessage={null} />);

    expect(screen.getByPlaceholderText(/Enter coupon code/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /Apply Coupon/i })).not.toBeDisabled();
  });
});
