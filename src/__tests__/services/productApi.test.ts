// src/__tests__/services/productApi.test.ts
import { fetchProducts, fetchProductById, Product } from '../../services/productApi';

// Mocking the fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockProduct1: Product = {
  id: '1',
  name: 'Wireless Mouse',
  price: 25.99,
  description: 'A comfortable and reliable wireless mouse.',
  imageUrl: 'https://via.placeholder.com/150/92c952',
  category: 'Electronics',
  specifications: { 'Connectivity': '2.4GHz Wireless' },
};

const mockProduct2: Product = {
  id: '2',
  name: 'Mechanical Keyboard',
  price: 75.00,
  description: 'Durable mechanical keyboard with tactile keys.',
  imageUrl: 'https://via.placeholder.com/150/771796',
  category: 'Electronics',
  specifications: { 'Switch Type': 'Blue Mechanical' },
};

describe('productApi', () => {
  beforeEach(() => {
    // Clear mock calls and reset any previous mock implementations before each test
    mockFetch.mockClear();
  });

  // Happy Path: fetchProducts
  test('fetchProducts should return a list of products on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockProduct1, mockProduct2],
    });

    const products = await fetchProducts();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/products');
    expect(products).toEqual([mockProduct1, mockProduct2]);
    expect(products.length).toBeGreaterThan(0);
  });

  // Edge Case: fetchProducts returns empty list
  test('fetchProducts should return an empty array if no products are available', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const products = await fetchProducts();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(products).toEqual([]);
  });

  // Error Handling: fetchProducts fails with network error
  test('fetchProducts should throw an error if fetch fails', async () => {
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(networkError);

    await expect(fetchProducts()).rejects.toThrow('Network error');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // Error Handling: fetchProducts returns non-ok response
  test('fetchProducts should throw an error for non-ok HTTP responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(fetchProducts()).rejects.toThrow('HTTP error! status: 500');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // Happy Path: fetchProductById
  test('fetchProductById should return a product when found', async () => {
    const productId = '1';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct1,
    });

    const product = await fetchProductById(productId);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`/api/products/${productId}`);
    expect(product).toEqual(mockProduct1);
  });

  // Edge Case: fetchProductById returns 404
  test('fetchProductById should throw an error if product is not found (404)', async () => {
    const productId = 'non-existent-id';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(fetchProductById(productId)).rejects.toThrow(`Product with id ${productId} not found.`);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // Error Handling: fetchProductById fails with network error
  test('fetchProductById should throw an error if fetch fails', async () => {
    const productId = '1';
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(networkError);

    await expect(fetchProductById(productId)).rejects.toThrow('Network error');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // Error Handling: fetchProductById returns other non-ok response
  test('fetchProductById should throw an error for other non-ok HTTP responses', async () => {
    const productId = '1';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(fetchProductById(productId)).rejects.toThrow('HTTP error! status: 500');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
