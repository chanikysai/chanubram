import React, { useState } from 'react';
import './CouponForm.css'; // Assuming a CSS file for styling

interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validFrom: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  usageLimit: number;
}

interface CouponFormProps {
  onSubmit: (coupon: Coupon) => void;
}

const CouponForm: React.FC<CouponFormProps> = ({ onSubmit }) => {
  const [coupon, setCoupon] = useState<Coupon>({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    validFrom: '',
    validUntil: '',
    usageLimit: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCoupon(prevCoupon => ({
      ...prevCoupon,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation before submitting
    if (!coupon.code || coupon.discountValue <= 0 || !coupon.validFrom || !coupon.validUntil) {
      alert('Please fill in all required fields correctly.');
      return;
    }
    onSubmit(coupon);
  };

  return (
    <form onSubmit={handleSubmit} className="coupon-form">
      <h2>Create New Coupon</h2>
      <div className="form-group">
        <label htmlFor="code">Coupon Code:</label>
        <input
          type="text"
          id="code"
          name="code"
          value={coupon.code}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="discountType">Discount Type:</label>
        <select
          id="discountType"
          name="discountType"
          value={coupon.discountType}
          onChange={handleChange}
          required
        >
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="discountValue">Discount Value:</label>
        <input
          type="number"
          id="discountValue"
          name="discountValue"
          value={coupon.discountValue}
          onChange={handleChange}
          min="0.01"
          step="0.01"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="validFrom">Valid From:</label>
        <input
          type="date"
          id="validFrom"
          name="validFrom"
          value={coupon.validFrom}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="validUntil">Valid Until:</label>
        <input
          type="date"
          id="validUntil"
          name="validUntil"
          value={coupon.validUntil}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="usageLimit">Usage Limit (optional):</label>
        <input
          type="number"
          id="usageLimit"
          name="usageLimit"
          value={coupon.usageLimit}
          onChange={handleChange}
          min="0"
          placeholder="e.g., 100"
        />
      </div>
      <button type="submit">Create Coupon</button>
    </form>
  );
};

export default CouponForm;
