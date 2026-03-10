// src/services/couponApi.ts
import { Coupon, DiscountType, CouponApplicationResult } from '../types/coupon';

// Mock coupon data - in a real app, this would come from a backend database
const mockCoupons: Record<string, Coupon> = {
  'SAVE10': {
    id: 'c1',
    code: 'SAVE10',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 10, // 10%
    validFrom: new Date(Date.now() - 86400000).toISOString(), // Valid from yesterday
    validTo: new Date(Date.now() + 604800000).toISOString(), // Valid for next 7 days
    usageLimit: 100,
    currentUsage: 20,
    isActive: true,
  },
  'FREESHIP': {
    id: 'c2',
    code: 'FREESHIP',
    discountType: DiscountType.FIXED,
    discountValue: 5.00, // $5 off
    validFrom: new Date(Date.now() - 86400000 * 2).toISOString(), // Valid from 2 days ago
    validTo: new Date(Date.now() + 259200000).toISOString(), // Valid for next 3 days
    usageLimit: 50,
    currentUsage: 45,
    isActive: true,
  },
  'EXPIRED': {
    id: 'c3',
    code: 'EXPIRED',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 50,
    validFrom: new Date(Date.now() - 86400000 * 10).toISOString(), // Expired 10 days ago
    validTo: new Date(Date.now() - 86400000 * 5).toISOString(), // Expired 5 days ago
    usageLimit: null,
    currentUsage: 0,
    isActive: false, // Explicitly inactive
  },
  'LIMITED': {
    id: 'c4',
    code: 'LIMITED',
    discountType: DiscountType.FIXED,
    discountValue: 15.00,
    validFrom: new Date(Date.now() - 86400000).toISOString(),
    validTo: new Date(Date.now() + 604800000).toISOString(),
    usageLimit: 5,
    currentUsage: 5, // Reached usage limit
    isActive: true,
  },
};

// Helper to simulate network delay
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Admin Functions ---

/**
 * Creates a new coupon.
 * @param couponData The data for the new coupon.
 * @returns A promise that resolves to the created Coupon object.
 */
export const createCoupon = async (couponData: Omit<Coupon, 'id' | 'currentUsage' | 'isActive'>): Promise<Coupon> => {
  await simulateDelay(100); // Simulate network latency
  console.log('API: Creating coupon:', couponData);

  const newId = `c${Object.keys(mockCoupons).length + 1}`;
  const newCoupon: Coupon = {
    ...couponData,
    id: newId,
    currentUsage: 0,
    isActive: true, // Assume new coupons are active by default
  };

  // Basic validation for mock data
  if (!couponData.code || !couponData.discountValue || !couponData.validFrom || !couponData.validTo) {
    throw new Error('API Error: Missing required coupon fields.');
  }
  if (couponData.discountValue < 0) {
    throw new Error('API Error: Discount value cannot be negative.');
  }
  if (new Date(couponData.validTo) < new Date(couponData.validFrom)) {
    throw new Error('API Error: Valid to date cannot be before valid from date.');
  }

  mockCoupons[newId] = newCoupon;
  return newCoupon;
};

/**
 * Fetches all coupons (for admin view).
 * @returns A promise that resolves to an array of Coupon objects.
 */
export const getAllCoupons = async (): Promise<Coupon[]> => {
  await simulateDelay(100);
  console.log('API: Fetching all coupons');
  return Object.values(mockCoupons);
};

/**
 * Updates an existing coupon.
 * @param couponId The ID of the coupon to update.
 * @param couponData The updated data for the coupon.
 * @returns A promise that resolves to the updated Coupon object.
 */
export const updateCoupon = async (couponId: string, couponData: Partial<Omit<Coupon, 'id' | 'currentUsage'>>): Promise<Coupon> => {
  await simulateDelay(100);
  console.log(`API: Updating coupon \${couponId}:`, couponData);

  const existingCoupon = mockCoupons[couponId];
  if (!existingCoupon) {
    throw new Error('API Error: Coupon not found.');
  }

  // Merge and validate updates
  const updatedCoupon: Coupon = { ...existingCoupon, ...couponData, currentUsage: existingCoupon.currentUsage }; // currentUsage is not updatable by admin directly

  if (couponData.discountValue !== undefined && couponData.discountValue < 0) {
    throw new Error('API Error: Discount value cannot be negative.');
  }
  if (couponData.validTo !== undefined && couponData.validFrom !== undefined && new Date(couponData.validTo) < new Date(couponData.validFrom)) {
    throw new Error('API Error: Valid to date cannot be before valid from date.');
  }

  mockCoupons[couponId] = updatedCoupon;
  return updatedCoupon;
};

/**
 * Deletes a coupon.
 * @param couponId The ID of the coupon to delete.
 * @returns A promise that resolves when the coupon is deleted.
 */
export const deleteCoupon = async (couponId: string): Promise<void> => {
  await simulateDelay(100);
  console.log(`API: Deleting coupon \${couponId}`);
  if (!mockCoupons[couponId]) {
    throw new Error('API Error: Coupon not found.');
  }
  delete mockCoupons[couponId];
};


// --- User Facing Functions (Checkout) ---

/**
 * Applies a coupon code during checkout.
 * Validates the coupon and calculates the discount amount.
 * @param code The coupon code to apply.
 * @returns A promise that resolves to CouponApplicationResult.
 */
export const applyCoupon = async (code: string): Promise<CouponApplicationResult> => {
  await simulateDelay(150); // Slightly longer delay for checkout operations
  console.log(`API: Applying coupon code: \${code}`);

  const coupon = mockCoupons[code];

  if (!coupon) {
    return { success: false, message: 'Invalid coupon code.', discountAmount: 0 };
  }

  const now = new Date();
  const validFrom = new Date(coupon.validFrom);
  const validTo = new Date(coupon.validTo);

  if (!coupon.isActive) {
    return { success: false, message: 'Coupon is inactive.', discountAmount: 0 };
  }
  if (now < validFrom) {
    return { success: false, message: 'Coupon is not yet valid.', discountAmount: 0 };
  }
  if (now > validTo) {
    return { success: false, message: 'Coupon has expired.', discountAmount: 0 };
  }
  if (coupon.usageLimit !== null && coupon.currentUsage >= coupon.usageLimit) {
    return { success: false, message: 'Coupon has reached its usage limit.', discountAmount: 0 };
  }

  // Calculate discount amount - this is simplified. In a real app,
  // this would depend on the order total, which is not available here.
  // We'll return a placeholder discount amount and let the frontend
  // use coupon.discountType and coupon.discountValue to calculate it based on order total.
  // For this mock, we'll just simulate a value.
  let calculatedDiscount = 0;
  // In a real scenario, this would involve order total:
  // const orderTotal = getOrderTotalFromContext(); // hypothetical
  // if (coupon.discountType === DiscountType.PERCENTAGE) {
  //   calculatedDiscount = orderTotal * (coupon.discountValue / 100);
  // } else { // FIXED
  //   calculatedDiscount = coupon.discountValue;
  // }

  // For mock, let's just return a value based on type and value for demonstration
  if (coupon.discountType === DiscountType.PERCENTAGE) {
    // Simulate a discount based on a hypothetical order total of $100
    calculatedDiscount = 100 * (coupon.discountValue / 100);
  } else {
    calculatedDiscount = coupon.discountValue;
  }

  // IMPORTANT: In a real app, applying a coupon would also increment its usage count.
  // This side effect would typically happen after the order is placed successfully.
  // For this API mock, we'll simulate the increment here for demonstration.
  coupon.currentUsage += 1;
  console.log(`API: Coupon \${code} used. Current usage: \${coupon.currentUsage}/\${coupon.usageLimit}`);

  return {
    success: true,
    message: 'Coupon applied successfully!',
    discountAmount: calculatedDiscount,
    couponId: coupon.id,
  };
};
