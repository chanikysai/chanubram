// src/components/CouponInput.tsx
import React, { useState } from 'react';
import { applyCoupon } from '../services/couponApi';
import { CouponApplicationResult } from '../types/coupon';

interface CouponInputProps {
  onCouponApplied: (result: CouponApplicationResult) => void;
  onCouponError: (errorMessage: string) => void;
  isLoading: boolean;
}

const CouponInput: React.FC<CouponInputProps> = ({ onCouponApplied, onCouponError, isLoading }) => {
  const [couponCode, setCouponCode] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setLocalError('Please enter a coupon code.');
      onCouponError('Please enter a coupon code.');
      return;
    }

    setLocalError(''); // Clear previous local error
    // isLoading prop is handled by parent, but we can disable input here
    
    try {
      const result = await applyCoupon(couponCode.trim().toUpperCase());
      if (result.success) {
        setCouponCode(''); // Clear input on success
        onCouponApplied(result);
      } else {
        setLocalError(result.message || 'Failed to apply coupon.');
        onCouponError(result.message || 'Failed to apply coupon.');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      setLocalError(`Error: ${errorMessage}`);
      onCouponError(`Error: ${errorMessage}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  return (
    <div className="coupon-input-container p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Have a coupon?</h3>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => {
            setCouponCode(e.target.value.toUpperCase());
            setLocalError(''); // Clear error when user types
            onCouponError(''); // Clear parent error as well
          }}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <button
          onClick={handleApplyCoupon}
          disabled={isLoading || !couponCode.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>
      {localError && <p className="text-red-500 text-sm mt-2">{localError}</p>}
    </div>
  );
};

export default CouponInput;
