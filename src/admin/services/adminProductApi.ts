import { Product } from '../types/product';

const API_BASE_URL = '/api/admin/products'; // Assuming an API endpoint

// Helper function for making API requests
const request = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json() as Promise<T>;
};

export const getProducts = async (): Promise<Product[]> => {
  return request<Product[]>(API_BASE_URL);
};

export const getProductById = async (id: string): Promise<Product> => {
  return request<Product>(`${API_BASE_URL}/${id}`);
};

export const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  // In a real scenario, the backend would generate the ID.
  // We'll simulate this by creating a temporary ID or returning the data as is.
  // For this mock, we'll assume the backend returns the created product with an ID.
  return request<Product>(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

export const updateProduct = async (id: string, productData: Omit<Product, 'id'>): Promise<Product> => {
  // The backend should return the updated product.
  return request<Product>(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  await request<void>(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
};

// Mocking for testing purposes if direct fetch is not available or for specific test scenarios
// In a real app, you would ensure your test setup mocks the fetch API itself.
export const mockApi = {
  getProducts: jest.fn(getProducts),
  getProductById: jest.fn(getProductById),
  createProduct: jest.fn(createProduct),
  updateProduct: jest.fn(updateProduct),
  deleteProduct: jest.fn(deleteProduct),
};
