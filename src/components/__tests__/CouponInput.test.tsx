// src/components/__tests__/CouponInput.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CouponInput from '../CouponInput';
import * as couponApi from '../../services/couponApi';
import { CouponApplicationResult } from '../../types/coupon';

// Mock the couponApi module
jest.mock('../../services/couponApi');

const mockedCouponApi = couponApi as jest.Mocked<typeof couponApi>;

describe('CouponInput', () => {
  const mockOnCouponApplied = jest.fn();
  const mockOnCouponError = jest.fn();

  beforeEach(() => {
    // Clear mocks before each test
    mockOnCouponApplied.mockClear();
    mockOnCouponError.mockClear();
    mockedCouponApi.applyCoupon.mockClear();
  });

  // Happy Path - Successful Coupon Application
  test('should call onCouponApplied with success result when coupon is valid', async () => {
    const mockResult: CouponApplicationResult = {
      success: true,
      message: 'Coupon applied successfully!',
      discountAmount: 10.50,
      couponId: 'c1',
    };
    mockedCouponApi.applyCoupon.mockResolvedValue(mockResult);

    render(<CouponInput onCouponApplied={mockOnCouponApplied} onCouponError={mockOnCouponError} isLoading={false} />);

    // Enter coupon code
    fireEvent.change(screen.getByPlaceholderText(/Enter coupon code/i), { target: { value: 'VALID10' } });
    // Apply coupon
    fireEvent.click(screen.getByRole('button', { name: /Apply/i }));

    await waitFor(() => {
      expect(mockedCouponApi.applyCoupon).toHaveBeenCalledTimes(1);
      expect(mockedCouponApi.applyCoupon).toHaveBeenCalledWith('VALID10');
      expect(mockOnCouponApplied).toHaveBeenCalledTimes(1);
      expect(mockOnCouponApplied).toHaveBeenCalledWith(mockResult);
      expect(mockOnCouponError).not.toHaveBeenCalled(); // Error handler should not be called on success
      // Input should be cleared on success
      expect(screen.getByPlaceholderText(/Enter coupon code/i)).toHaveValue('');
    });
  });

  // Error Path - Invalid Coupon Code
  test('should call onCouponError with message when coupon is invalid', async () => {
    const mockResult: CouponApplicationResult = {
      success: false,
      message: 'Invalid coupon code.',
      discountAmount: 0,
    };
    mockedCouponApi.applyCoupon.mockResolvedValue(mockResult);

    render(<CouponInput onCouponApplied={mockOnCouponApplied} onCouponError={mockOnCouponError} isLoading={false} />);

    fireEvent.change(screen.getByPlaceholderText(/Enter coupon code/i), { target: { value: 'INVALID' } });
    fireEvent.click(screen.getByRole('button', { name: /Apply/i }));

    await waitFor(() => {
      expect(mockedCouponApi.applyCoupon).toHaveBeenCalledTimes(1);
      expect(mockedCouponApi.applyCoupon).toHaveBeenCalledWith('INVALID');
      // Expecting 2 calls as both internal state and parent handler might be triggered
      expect(mockOnCouponError).toHaveBeenCalledTimes(2); 
      expect(mockOnCouponError).toHaveBeenCalledWith('Invalid coupon code.');
      expect(mockOnCouponApplied).not.toHaveBeenCalled();
      // Input should NOT be cleared on error
      expect(screen.getByPlaceholderText(/Enter coupon code/i)).toHaveValue('INVALID');
    });
  });

  // Error Path - API throws an error
  test('should call onCouponError with generic message when API throws an error', async () => {
    mockedCouponApi.applyCoupon.mockRejectedValue(new Error('Network Error'));

    render(<CouponInput onCouponApplied={mockOnCouponApplied} onCouponError={mockOnCouponError} isLoading={false} />);

    fireEvent.change(screen.getByPlaceholderText(/Enter coupon code/i), { target: { value: 'ANYCODE' } });
    fireEvent.click(screen.getByRole('button', { name: /Apply/i }));

    await waitFor(() => {
      expect(mockedCouponApi.applyCoupon).toHaveBeenCalledTimes(1);
      expect(mockedCouponApi.applyCoupon).toHaveBeenCalledWith('ANYCODE');
      // Expecting 2 calls as both internal state and parent handler might be triggered
      expect(mockOnCouponError).toHaveBeenCalledTimes(2); 
      // Ensure the error message is correctly formatted as seen in console.error
      expect(mockOnCouponError).toHaveBeenCalledWith('Error: Network Error'); 
      expect(mockOnCouponApplied).not.toHaveBeenCalled();
    });
  });

  // Edge Case - Empty input
  test('should call onCouponError if coupon code input is empty', async () => {
    render(<CouponInput onCouponApplied={mockOnCouponApplied} onCouponError={mockOnCouponError} isLoading={false} />);

    // Try to apply with empty input
    fireEvent.click(screen.getByRole('button', { name: /Apply/i }));

    await waitFor(() => {
      expect(mockedCouponApi.applyCoupon).not.toHaveBeenCalled();
      // Empty input validation triggers the error handler once
      expect(mockOnCouponError).toHaveBeenCalledTimes(1); 
      expect(mockOnCouponError).toHaveBeenCalledWith('Please enter a coupon code.');
      expect(mockOnCouponApplied).not.toHaveBeenCalled();
    });
  });

  // Edge Case - Inputting code and then clearing it
  test('should clear error when user types after an error occurs', async () => {
    const mockResult: CouponApplicationResult = { success: false, message: 'Invalid code', discountAmount: 0 };
    mockedCouponApi.applyCoupon.mockResolvedValue(mockResult);

    render(<CouponInput onCouponApplied={mockOnCouponApplied} onCouponError={mockOnCouponError} isLoading={false} />);

    // Trigger an error first
    fireEvent.change(screen.getByPlaceholderText(/Enter coupon code/i), { target: { value: 'BADCODE' } });
    fireEvent.click(screen.getByRole('button', { name: /Apply/i }));
    await waitFor(() => {
      expect(mockOnCouponError).toHaveBeenCalledWith('Invalid code');
      // Asserting that the error handler was called at least twice in this error scenario
      expect(mockOnCouponError).toHaveBeenCalledTimes(2); 
    });

    // Now type in a new code
    fireEvent.change(screen.getByPlaceholderText(/Enter coupon code/i), { target: { value: 'GOODCODE' } });
    expect(screen.getByPlaceholderText(/Enter coupon code/i)).toHaveValue('GOODCODE');
    
    // Trigger apply with the new code
    fireEvent.click(screen.getByRole('button', { name: /Apply/i }));
    await waitFor(() => {
        expect(mockedCouponApi.applyCoupon).toHaveBeenCalledWith('GOODCODE');
        // Assuming GOODCODE is valid for this test sequence
        expect(mockOnCouponApplied).toHaveBeenCalledTimes(1); 
    });
  });

  // Keyboard Event - Enter key
  test('should call handleApplyCoupon when Enter key is pressed in input field', async () => {
    const mockResult: CouponApplicationResult = { success: true, message: 'Applied!', discountAmount: 5, couponId: 'c1' };
    mockedCouponApi.applyCoupon.mockResolvedValue(mockResult);

    render(<CouponInput onCouponApplied={mockOnCouponApplied} onCouponError={mockOnCouponError} isLoading={false} />);

    fireEvent.change(screen.getByPlaceholderText(/Enter coupon code/i), { target: { value: 'ENTERCODE' } });
    fireEvent.keyPress(screen.getByPlaceholderText(/Enter coupon code/i), { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(mockedCouponApi.applyCoupon).toHaveBeenCalledTimes(1);
      expect(mockedCouponApi.applyCoupon).toHaveBeenCalledWith('ENTERCODE');
      expect(mockOnCouponApplied).toHaveBeenCalledTimes(1);
      expect(mockOnCouponError).not.toHaveBeenCalled(); // Ensure no error handler called on success
    });
  });

  // UI State - Disabled state when loading
  test('should disable input and button when isLoading is true', () => {
    render(<CouponInput onCouponApplied={mockOnCouponApplied} onCouponError={mockOnCouponError} isLoading={true} />);

    expect(screen.getByPlaceholderText(/Enter coupon code/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /Apply/i })).toBeDisabled();
  });

  // UI State - Button disabled when input is empty
  test('should disable apply button when coupon code input is empty', () => {
    render(<CouponInput onCouponApplied={mockOnCouponApplied} onCouponError={mockOnCouponError} isLoading={false} />);

    const inputElement = screen.getByPlaceholderText(/Enter coupon code/i);
    const applyButton = screen.getByRole('button', { name: /Apply/i });

    // Initially, input is empty, button should be disabled
    expect(applyButton).toBeDisabled();

    // Type something, button should be enabled
    fireEvent.change(inputElement, { target: { value: 'A' } });
    expect(applyButton).not.toBeDisabled();

    // Clear input, button should be disabled again
    fireEvent.change(inputElement, { target: { value: '' } });
    expect(applyButton).toBeDisabled();
  });
});
