import React, { useState, useEffect } from 'react';
import { Coupon, DiscountType } from '../../types/coupon';

interface CouponFormProps {
  coupon?: Coupon; // For editing an existing coupon
  onSubmit: (couponData: Omit<Coupon, 'id' | 'currentUsage' | 'isActive'>) => void;
  onCancel: () => void;
}

const CouponForm: React.FC<CouponFormProps> = ({ coupon, onSubmit, onCancel }) => {
  const [code, setCode] = useState<string>(coupon?.code || '');
  const [discountType, setDiscountType] = useState<DiscountType>(coupon?.discountType || DiscountType.PERCENTAGE);
  const [discountValue, setDiscountValue] = useState<string>(coupon?.discountValue.toString() || '');
  const [validFrom, setValidFrom] = useState<string>(coupon?.validFrom.split('T')[0] || ''); // Date picker expects YYYY-MM-DD
  const [validTo, setValidTo] = useState<string>(coupon?.validTo.split('T')[0] || ''); // Date picker expects YYYY-MM-DD
  const [usageLimit, setUsageLimit] = useState<string>(coupon?.usageLimit?.toString() || '');
  const [error, setError] = useState<string>('');

  // Helper to reset form fields if no coupon is passed (for adding new)
  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setDiscountType(coupon.discountType);
      setDiscountValue(coupon.discountValue.toString());
      setValidFrom(coupon.validFrom.split('T')[0]);
      setValidTo(coupon.validTo.split('T')[0]);
      setUsageLimit(coupon.usageLimit?.toString() || '');
    } else {
      // Reset for new coupon
      setCode('');
      setDiscountType(DiscountType.PERCENTAGE);
      setDiscountValue('');
      setValidFrom('');
      setValidTo('');
      setUsageLimit('');
    }
  }, [coupon]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!code || !discountValue || !validFrom || !validTo) {
      setError('All fields except Usage Limit are required.');
      return;
    }

    const parsedDiscountValue = parseFloat(discountValue);
    const parsedUsageLimit = usageLimit === '' ? null : parseInt(usageLimit, 10);

    if (isNaN(parsedDiscountValue) || parsedDiscountValue < 0) {
      setError('Discount Value must be a non-negative number.');
      return;
    }
    if (parsedUsageLimit !== null && (isNaN(parsedUsageLimit) || parsedUsageLimit <= 0)) {
      setError('Usage Limit must be a positive integer or empty.');
      return;
    }
    if (new Date(validTo) < new Date(validFrom)) {
      setError('Valid To date must be after Valid From date.');
      return;
    }

    onSubmit({
      code,
      discountType,
      discountValue: parsedDiscountValue,
      validFrom: new Date(validFrom).toISOString(),
      validTo: new Date(validTo).toISOString(),
      usageLimit: parsedUsageLimit,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        {coupon ? 'Edit Coupon' : 'Create New Coupon'}
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-1">
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Coupon Code
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())} // Codes are usually uppercase
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            required
            disabled={!!coupon} // Usually, coupon code is not editable after creation
          />
        </div>

        <div className="md:col-span-1">
          <label htmlFor="discountType" className="block text-sm font-medium text-gray-700">
            Discount Type
          </label>
          <select
            id="discountType"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as DiscountType)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            required
          >
            <option value={DiscountType.PERCENTAGE}>Percentage (%)</option>
            <option value={DiscountType.FIXED}>Fixed Amount ($)</option>
          </select>
        </div>

        <div className="md:col-span-1">
          <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700">
            Discount Value {discountType === DiscountType.PERCENTAGE ? '(%)' : '($)'}
          </label>
          <input
            type="number"
            id="discountValue"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            step={discountType === DiscountType.PERCENTAGE ? '0.1' : '0.01'}
            min="0"
            required
          />
        </div>

        <div className="md:col-span-1">
          <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700">
            Valid From
          </label>
          <input
            type="date"
            id="validFrom"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            required
          />
        </div>

        <div className="md:col-span-1">
          <label htmlFor="validTo" className="block text-sm font-medium text-gray-700">
            Valid To
          </label>
          <input
            type="date"
            id="validTo"
            value={validTo}
            onChange={(e) => setValidTo(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            required
          />
        </div>

        <div className="md:col-span-1">
          <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700">
            Usage Limit (Optional)
          </label>
          <input
            type="number"
            id="usageLimit"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            min="1"
            placeholder="e.g., 100"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {coupon ? 'Update Coupon' : 'Create Coupon'}
        </button>
      </div>
    </form>
  );
};

export default CouponForm;
