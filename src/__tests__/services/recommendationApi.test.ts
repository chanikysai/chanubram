// src/__tests__/services/recommendationApi.test.ts
import { getRecommendations, getPopularProducts } from '../services/recommendationApi';

// Mock Product type
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
};

// Mock the simulateDelay function to control time
jest.useFakeTimers();

// Mock product data used in the service
const mockProducts: Record<string, Product> = {
  'p1': { id: 'p1', name: 'Example Gadget', description: 'Desc 1', price: 99.99, imageUrl: '/path/to/gadget.jpg' },
  'p2': { id: 'p2', name: 'Another Item', description: 'Desc 2', price: 49.50, imageUrl: '/path/to/item.jpg' },
  'p3': { id: 'p3', name: 'Third Product', description: 'Desc 3', price: 25.00, imageUrl: '/path/to/third.jpg' },
  'p4': { id: 'p4', name: 'Fourth Item', description: 'Desc 4', price: 75.20, imageUrl: '/path/to/fourth.jpg' },
  'p5': { id: 'p5', name: 'Fifth Product', description: 'Desc 5', price: 150.00, imageUrl: '/path/to/fifth.jpg' },
};

describe('recommendationApi', () => {
  // Restore real timers after all tests in this suite
  afterAll(() => {
    jest.useRealTimers();
  });

  describe('getRecommendations', () => {
    it('should return popular products when no productId is provided', async () => {
      const promise = getRecommendations();
      // Advance timers to resolve the setTimeout
      jest.advanceTimersByTime(300);
      const recommendations = await promise;

      expect(recommendations).toHaveLength(4);
      expect(recommendations.map(p => p.id)).toEqual(['p1', 'p2', 'p3', 'p5']);
    });

    it('should return related products when a productId is provided', async () => {
      const productId = 'p1';
      const promise = getRecommendations(productId);
      jest.advanceTimersByTime(300);
      const recommendations = await promise;

      expect(recommendations).toHaveLength(2);
      expect(recommendations.map(p => p.id)).toEqual(['p2', 'p4']);
    });

    it('should handle unknown productIds by returning general popular products', async () => {
      const productId = 'unknown-id';
      const promise = getRecommendations(productId);
      jest.advanceTimersByTime(300);
      const recommendations = await promise;

      expect(recommendations).toHaveLength(3); // Based on default case in switch
      expect(recommendations.map(p => p.id)).toEqual(['p1', 'p2', 'p3']);
    });

    it('should return at most 4 recommendations', async () => {
      const productId = 'p1'; // This case returns 2, which is less than 4
      const promise = getRecommendations(productId);
      jest.advanceTimersByTime(300);
      const recommendations = await promise;
      expect(recommendations.length).toBeLessThanOrEqual(4);

      const popularPromise = getRecommendations(); // Returns 4
      jest.advanceTimersByTime(300);
      const popularRecommendations = await popularPromise;
      expect(popularRecommendations.length).toBeLessThanOrEqual(4);
    });

    // Note: Error handling test would require mocking the API to throw an error,
    // which is not directly done here as the mock itself is deterministic.
    // If the underlying API call (e.g. fetch) were real, error cases would be tested.
  });

  describe('getPopularProducts', () => {
    it('should return a list of popular products', async () => {
      const promise = getPopularProducts();
      jest.advanceTimersByTime(200);
      const products = await promise;

      expect(products).toHaveLength(4);
      expect(products.map(p => p.id)).toEqual(['p1', 'p2', 'p3', 'p5']);
    });

    it('should return at most 4 popular products', async () => {
      const promise = getPopularProducts();
      jest.advanceTimersByTime(200);
      const products = await promise;
      expect(products.length).toBeLessThanOrEqual(4);
    });
  });
});
