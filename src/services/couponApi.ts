import { API_BASE_URL } from '../config'; // Assuming a config file for API base URL

interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validFrom: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  usageLimit: number;
}

interface ApplyCouponResponse {
  success: boolean;
  message: string;
  discountAmount?: number; // The amount of discount applied
  newTotal?: number; // The new total after discount
  couponDetails?: Coupon; // Details of the applied coupon
}

// Mock fetch for testing purposes within the service file itself if needed,
// but typically you'd mock the service function in the test file.
// For simplicity here, we assume fetch is globally available or imported.

export const createCoupon = async (couponData: Coupon): Promise<Coupon> => {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization headers if needed
      },
      body: JSON.stringify(couponData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create coupon');
    }

    const createdCoupon: Coupon = await response.json();
    return createdCoupon;
  } catch (error) {
    console.error('Error in createCoupon service:', error);
    throw error;
  }
};

export const applyCoupon = async (code: string): Promise<ApplyCouponResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization headers if needed
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Invalid coupon code');
    }

    const data: ApplyCouponResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error in applyCoupon service:', error);
    // Return a structured error response that the UI can understand
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'An unexpected error occurred.' };
  }
};

// You might also need functions for:
// - fetching coupons for admin listing
// - updating coupons
// - deleting coupons
