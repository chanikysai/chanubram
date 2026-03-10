import React, { useState } from 'react';
import './CouponInput.css'; // Assuming a CSS file for styling

interface CouponInputProps {
  onApplyCoupon: (couponCode: string) => void;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const CouponInput: React.FC<CouponInputProps> = ({ onApplyCoupon, isLoading, error, successMessage }) => {
  const [couponCode, setCouponCode] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value);
  };

  const handleApplyClick = () => {
    if (couponCode.trim()) {
      onApplyCoupon(couponCode.trim());
    } else {
      alert('Please enter a coupon code.');
    }
  };

  return (
    <div className="coupon-input-container">
      <input
        type="text"
        placeholder="Enter coupon code"
        value={couponCode}
        onChange={handleInputChange}
        disabled={isLoading}
        aria-label="Coupon Code Input"
      />
      <button onClick={handleApplyClick} disabled={isLoading || !couponCode.trim()}>
        {isLoading ? 'Applying...' : 'Apply Coupon'}
      </button>
      {error && <p className="coupon-error">{error}</p>}
      {successMessage && <p className="coupon-success">{successMessage}</p>}
    </div>
  );
};

export default CouponInput;
