// src/types/coupon.ts

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number; // Percentage (e.g., 10 for 10%) or fixed amount (e.g., 5 for $5)
  validFrom: string; // ISO 8601 date string
  validTo: string; // ISO 8601 date string
  usageLimit: number | null; // Total number of times the coupon can be used, null for unlimited
  currentUsage: number; // Number of times the coupon has been used
  isActive: boolean; // Whether the coupon is currently active
}

// Response structure when a coupon is applied at checkout
export interface CouponApplicationResult {
  success: boolean;
  message?: string; // e.g., "Coupon applied successfully", "Invalid coupon code"
  discountAmount: number; // The calculated discount value to be subtracted from the total
  couponId?: string; // The ID of the applied coupon
}
