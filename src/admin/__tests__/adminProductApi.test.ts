import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../services/adminProductApi';
import { Product } from '../types/product';

// Mock the global fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('adminProductApi', () => {
  const API_BASE_URL = '/api/admin/products';

  beforeEach(() => {
    // Clear mock calls before each test
    mockFetch.mockClear();
  });

  // --- getProducts Tests ---
  test('getProducts should fetch products and return them', async () => {
    const mockProducts: Product[] = [
      { id: 'p1', name: 'Laptop', price: 1200.00, stock: 10 },
      { id: 'p2', name: 'Mouse', price: 25.50, stock: 50 },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    const products = await getProducts();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(API_BASE_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(products).toEqual(mockProducts);
  });

  test('getProducts should throw an error if fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Something went wrong',
    });

    await expect(getProducts()).rejects.toThrow('API Error: 500 Internal Server Error - Something went wrong');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // --- getProductById Tests ---
  test('getProductById should fetch a single product and return it', async () => {
    const productId = 'p1';
    const mockProduct: Product = { id: productId, name: 'Laptop', price: 1200.00, stock: 10 };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    });

    const product = await getProductById(productId);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/${productId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(product).toEqual(mockProduct);
  });

  test('getProductById should throw an error if fetch fails', async () => {
    const productId = 'p1';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => 'Product not found',
    });

    await expect(getProductById(productId)).rejects.toThrow('API Error: 404 Not Found - Product not found');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });


  // --- createProduct Tests ---
  test('createProduct should send product data and return the created product', async () => {
    const newProductData = { name: 'Keyboard', description: 'Mechanical', price: 75.00, stock: 30 };
    const createdProduct: Product = { id: 'p3', ...newProductData };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => createdProduct,
    });

    const product = await createProduct(newProductData);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProductData),
    });
    expect(product).toEqual(createdProduct);
  });

  test('createProduct should throw an error if fetch fails', async () => {
    const newProductData = { name: 'Keyboard', price: 75.00, stock: 30 };
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => 'Invalid data',
    });

    await expect(createProduct(newProductData)).rejects.toThrow('API Error: 400 Bad Request - Invalid data');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // --- updateProduct Tests ---
  test('updateProduct should send updated product data and return the updated product', async () => {
    const productId = 'p1';
    const updatedProductData = { name: 'Gaming Laptop', price: 1500.00, stock: 8 };
    const updatedProduct: Product = { id: productId, ...updatedProductData };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedProduct,
    });

    const product = await updateProduct(productId, updatedProductData);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProductData),
    });
    expect(product).toEqual(updatedProduct);
  });

  test('updateProduct should throw an error if fetch fails', async () => {
    const productId = 'p1';
    const updatedProductData = { name: 'Gaming Laptop', price: 1500.00, stock: 8 };
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => 'Product not found for update',
    });

    await expect(updateProduct(productId, updatedProductData)).rejects.toThrow('API Error: 404 Not Found - Product not found for update');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // --- deleteProduct Tests ---
  test('deleteProduct should send a delete request and return void on success', async () => {
    const productId = 'p1';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      // For DELETE, json() might not be called or might return an empty object/null
      // For simplicity, we'll mock it to return an empty object if called.
      json: async () => ({}), 
    });

    await deleteProduct(productId);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/${productId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    // No return value expected for deleteProduct
  });

  test('deleteProduct should throw an error if fetch fails', async () => {
    const productId = 'p1';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Server error during deletion',
    });

    await expect(deleteProduct(productId)).rejects.toThrow('API Error: 500 Internal Server Error - Server error during deletion');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
