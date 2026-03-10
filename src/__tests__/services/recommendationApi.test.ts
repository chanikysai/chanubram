// src/__tests__/services/recommendationApi.test.ts

import { getRecommendations, Product } from '../../services/recommendationApi';

// Mocking the delay for testing
jest.useFakeTimers();

describe('recommendationApi', () => {
  // Happy Path: Get recommendations for a product with known related items
  test('should return relevant recommendations for a given product ID', async () => {
    const productId = 'prod_1';
    const expectedRecommendations: Product[] = [
      { id: 'prod_2', name: 'Comfortable Jeans', imageUrl: '/images/product2.jpg', price: 50 },
      { id: 'prod_4', name: 'Leather Wallet', imageUrl: '/images/product4.jpg', price: 30 },
    ];

    const promise = getRecommendations(productId);
    jest.advanceTimersByTime(500); // Advance timers to resolve the timeout

    const recommendations = await promise;
    expect(recommendations).toEqual(expectedRecommendations);
    expect(recommendations.length).toBe(2);
  });

  // Edge Case: Product ID with no specific recommendations defined, should return fallback (popular items)
  test('should return fallback recommendations if no specific ones are found for the product ID', async () => {
    const productId = 'prod_non_existent'; // An ID not in productViewMap
    const expectedFallback: Product[] = [
      { id: 'prod_1', name: 'Stylish T-Shirt', imageUrl: '/images/product1.jpg', price: 25 },
      { id: 'prod_2', name: 'Comfortable Jeans', imageUrl: '/images/product2.jpg', price: 50 },
      { id: 'prod_3', name: 'Classic Sneakers', imageUrl: '/images/product3.jpg', price: 75 },
    ];

    const promise = getRecommendations(productId);
    jest.advanceTimersByTime(500);

    const recommendations = await promise;
    // The fallback should be the first 3 mock products, excluding the productId itself if it matched any.
    // Since prod_non_existent is not in mockProducts, it won't be excluded.
    expect(recommendations).toEqual(expectedFallback);
    expect(recommendations.length).toBe(3);
  });

  // Edge Case: Ensure a product is not recommended for itself
  test('should not recommend the same product that is being viewed', async () => {
    const productId = 'prod_2'; // This product has 'prod_1' and 'prod_3' as recommendations
    const recommendations = await getRecommendations(productId);

    expect(recommendations.some(p => p.id === productId)).toBe(false);
    expect(recommendations.length).toBe(2); // Should still have the correct count of other recommendations
  });
});
