import { createCoupon, applyCoupon } from '../services/couponApi';
import { API_BASE_URL } from '../config'; // Assuming config for API URL

// Mock fetch API
global.fetch = jest.fn();

// Helper to mock fetch responses
const mockFetch = (data: any, ok: boolean = true, status: number = 200) => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok,
    status,
    json: async () => data,
  });
};

describe('couponApi', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    (global.fetch as jest.Mock).mockClear();
  });

  describe('createCoupon', () => {
    const mockCouponData = {
      code: 'TESTCODE',
      discountType: 'percentage',
      discountValue: 15,
      validFrom: '2024-08-01',
      validUntil: '2024-08-31',
      usageLimit: 100,
    } as any; // Type assertion for mock data

    test('should successfully create a coupon', async () => {
      const mockResponse = { ...mockCouponData, id: 'coupon-123' };
      mockFetch(mockResponse);

      const result = await createCoupon(mockCouponData);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCouponData),
      });
      expect(result).toEqual(mockResponse);
    });

    test('should throw an error if coupon creation fails', async () => {
      const errorMsg = 'Server error creating coupon';
      mockFetch({ message: errorMsg }, false, 500);

      await expect(createCoupon(mockCouponData)).rejects.toThrow(errorMsg);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('should throw a generic error if response is not ok and message is missing', async () => {
      mockFetch({}, false, 500); // Empty error response

      await expect(createCoupon(mockCouponData)).rejects.toThrow('Failed to create coupon');
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('applyCoupon', () => {
    const couponCode = 'DISCOUNT10';

    test('should successfully apply a coupon and return details', async () => {
      const mockResponse = {
        success: true,
        message: 'Coupon applied successfully!',
        discountAmount: 10.50,
        newTotal: 89.50,
        couponDetails: {
          code: couponCode,
          discountType: 'fixed',
          discountValue: 10.50,
          validFrom: '2024-08-01',
          validUntil: '2024-08-31',
          usageLimit: 100,
        },
      };
      mockFetch(mockResponse);

      const result = await applyCoupon(couponCode);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/coupons/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      });
      expect(result).toEqual(mockResponse);
    });

    test('should return an error if coupon code is invalid', async () => {
      const errorMsg = 'Invalid coupon code';
      mockFetch({ message: errorMsg }, false, 400);

      const result = await applyCoupon(couponCode);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: false, message: errorMsg });
    });

    test('should return a generic error if apply coupon fails with no specific message', async () => {
      mockFetch({}, false, 500); // Server error, no message

      const result = await applyCoupon(couponCode);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: false, message: 'An unexpected error occurred.' });
    });
  });
});
