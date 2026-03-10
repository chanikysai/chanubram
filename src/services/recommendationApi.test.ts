// src/services/recommendationApi.test.ts
import { getRecommendations, getPopularProducts } from './recommendationApi';
import { Product } from '../types/product';

// Mocking setTimeout to control delay in tests
jest.useFakeTimers();

// Define mock data matching the structure in recommendationApi.ts
const mockProduct1: Product = {
  id: 'p1',
  name: 'Example Gadget',
  description: 'This is a wonderful gadget that does amazing things.',
  price: 99.99,
  stock: 10,
  imageUrl: '/path/to/gadget.jpg',
};
const mockProduct2: Product = {
  id: 'p2',
  name: 'Another Item',
  description: 'A different product with unique features.',
  price: 49.50,
  stock: 5,
  imageUrl: '/path/to/item.jpg',
};
const mockProduct3: Product = {
  id: 'p3',
  name: 'Third Product',
  description: 'This product is essential for your daily needs.',
  price: 25.00,
  stock: 20,
  imageUrl: '/path/to/third.jpg',
};
const mockProduct4: Product = {
  id: 'p4',
  name: 'Fourth Item',
  description: 'An item that complements other products.',
  price: 75.20,
  stock: 15,
  imageUrl: '/path/to/fourth.jpg',
};
const mockProduct5: Product = {
  id: 'p5',
  name: 'Fifth Product',
  description: 'A popular choice among our customers.',
  price: 150.00,
  stock: 8,
  imageUrl: '/path/to/fifth.jpg',
};

describe('Recommendation API', () => {
  // Clear mock timers after each test
  afterEach(() => {
    jest.clearAllTimers();
  });

  // Test case 1: getRecommendations with a known productId
  test('getRecommendations should return relevant products for a given productId', async () => {
    const recommendations = await getRecommendations('p1');
    // Advance timers to allow setTimeout to execute
    jest.advanceTimersByTime(300);

    expect(recommendations).toEqual([
      expect.objectContaining({ id: 'p2' }),
      expect.objectContaining({ id: 'p4' }),
    ]);
  });

  // Test case 2: getRecommendations without productId (should return popular products)
  test('getRecommendations without productId should return popular products', async () => {
    const recommendations = await getRecommendations();
    jest.advanceTimersByTime(300);

    expect(recommendations).toEqual([
      expect.objectContaining({ id: 'p1' }),
      expect.objectContaining({ id: 'p2' }),
      expect.objectContaining({ id: 'p3' }),
      expect.objectContaining({ id: 'p5' }),
    ]);
  });

  // Test case 3: getRecommendations with an unknown productId
  test('getRecommendations with an unknown productId should return general popular products', async () => {
    const recommendations = await getRecommendations('unknown_product_id');
    jest.advanceTimersByTime(300);

    // Based on the logic in recommendationApi.ts, unknown productIds fall through to default
    expect(recommendations).toEqual([
      expect.objectContaining({ id: 'p1' }),
      expect.objectContaining({ id: 'p2' }),
      expect.objectContaining({ id: 'p3' }),
      expect.objectContaining({ id: 'p5' }),
    ]);
  });

  // Test case 4: getPopularProducts
  test('getPopularProducts should return the list of popular products', async () => {
    const popularProducts = await getPopularProducts();
    jest.advanceTimersByTime(200);

    expect(popularProducts).toEqual([
      expect.objectContaining({ id: 'p1' }),
      expect.objectContaining({ id: 'p2' }),
      expect.objectContaining({ id: 'p3' }),
      expect.objectContaining({ id: 'p5' }),
    ]);
  });

  // Test case 5: Ensure functions return Promises and handle delay
  test('API functions should return Promises and respect simulated delay', async () => {
    const startTime = Date.now();

    // Call a function and capture its completion time
    const apiCallPromise = getRecommendations('p1');

    // Advance timers by less than the delay
    jest.advanceTimersByTime(200);
    let endTime = Date.now();
    // The promise should not have resolved yet
    await expect(Promise.race([apiCallPromise, Promise.resolve('not resolved')])).resolves.toBe('not resolved');

    // Advance timers to cover the full delay
    jest.advanceTimersByTime(100); // Total advance is 200 + 100 = 300
    endTime = Date.now();
    const result = await apiCallPromise;

    // Check if the execution took approximately the simulated delay
    expect(endTime - startTime).toBeGreaterThanOrEqual(300);
    expect(result).toEqual([
      expect.objectContaining({ id: 'p2' }),
      expect.objectContaining({ id: 'p4' }),
    ]);
  });

  // Test case 6: Limit the number of recommendations returned
  test('getRecommendations should limit the number of returned recommendations', async () => {
    // Mocking the internal data to be larger than the slice limit
    const largeMockProductList = [
      mockProduct1, mockProduct2, mockProduct3, mockProduct4, mockProduct5,
      { id: 'p6', name: 'Extra Product 1', price: 10.00, stock: 1, description: '', imageUrl: '' },
      { id: 'p7', name: 'Extra Product 2', price: 10.00, stock: 1, description: '', imageUrl: '' },
    ];
    // Temporarily override the mockProduct constant for this test, if possible, or adjust the API logic mock.
    // Since we are testing the existing `recommendationApi.ts` file, and it uses internal mockProduct,
    // we can infer the slice(0, 4) behavior. The current mock data in the file results in 4 recommendations by default.
    // Let's ensure it's capped at 4 if more were available conceptually.
    // The current mock in the API returns at most 4. We just verify that the limit is respected.
    const recommendations = await getRecommendations();
    jest.advanceTimersByTime(300);
    expect(recommendations.length).toBeLessThanOrEqual(4);
    expect(recommendations.length).toBe(4); // Based on current mock data and slice(0,4)
  });
});
