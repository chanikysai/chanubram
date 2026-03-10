// src/__tests__/pages/ProductPage.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProductPage from '../../pages/ProductPage';
import { fetchProductById, Product } from '../../services/productApi';
import ProductDetail from '../../components/ProductDetail'; // Import to mock its usage

// Mock the API service
jest.mock('../../services/productApi');
// Mock useParams from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));
// Mock the ProductDetail component to check if it's called with correct props
jest.mock('../../components/ProductDetail');

// Cast mocked components/functions to Jest Mock types
const mockUseParams = useParams as jest.Mock;
const mockFetchProductById = fetchProductById as jest.Mock;
const MockProductDetail = ProductDetail as jest.Mock;

// Mock product data
const mockProduct: Product = {
  id: '1',
  name: 'Detailed Product',
  price: 123.45,
  description: 'This is the detailed description for the product page.',
  imageUrl: 'https://via.placeholder.com/400/fedcba',
  category: 'Detailed Category',
  specifications: { 'Size': 'Large' },
};

describe('ProductPage', () => {
  beforeEach(() => {
    // Clear mocks before each test
    mockUseParams.mockClear();
    mockFetchProductById.mockClear();
    MockProductDetail.mockClear();
  });

  // Happy Path: Product is fetched successfully
  test('should fetch and display product details when ID is valid', async () => {
    const productId = '1';
    mockUseParams.mockReturnValue({ id: productId });
    mockFetchProductById.mockResolvedValueOnce(mockProduct);

    render(<ProductPage />);

    // Initial state: Should show loading in ProductDetail
    expect(MockProductDetail).toHaveBeenCalledWith(expect.objectContaining({ isLoading: true, error: null, product: null }), {});

    // Wait for fetchProductById to complete and ProductDetail to be updated
    await waitFor(() => {
      expect(mockFetchProductById).toHaveBeenCalledTimes(1);
      expect(mockFetchProductById).toHaveBeenCalledWith(productId);
      expect(MockProductDetail).toHaveBeenCalledWith(expect.objectContaining({
        isLoading: false,
        error: null,
        product: mockProduct,
      }), {});
    });
  });

  // Edge Case: Product ID is missing in URL params
  test('should display an error if product ID is missing', async () => {
    mockUseParams.mockReturnValue({}); // No ID provided

    render(<ProductPage />);

    await waitFor(() => {
      expect(mockFetchProductById).not.toHaveBeenCalled();
      expect(MockProductDetail).toHaveBeenCalledWith(expect.objectContaining({
        isLoading: false,
        error: 'Product ID is missing.',
        product: null,
      }), {});
    });
  });

  // Error Handling: fetchProductById fails
  test('should display an error message if fetching product fails', async () => {
    const productId = '1';
    const errorMessage = 'Product not found';
    mockUseParams.mockReturnValue({ id: productId });
    mockFetchProductById.mockRejectedValueOnce(new Error(errorMessage));

    render(<ProductPage />);

    await waitFor(() => {
      expect(mockFetchProductById).toHaveBeenCalledTimes(1);
      expect(mockFetchProductById).toHaveBeenCalledWith(productId);
      expect(MockProductDetail).toHaveBeenCalledWith(expect.objectContaining({
        isLoading: false,
        error: errorMessage,
        product: null,
      }), {});
    });
  });

  // Test rendering with different product details (implicitly covered by happy path, but good to note)
  // This test ensures that if the product data structure changes slightly, ProductDetail still handles it.
  test('should render ProductDetail correctly with potentially different product structure', async () => {
    const productId = '2';
    const anotherMockProduct: Product = {
      id: '2',
      name: 'Another Product',
      price: 50.00,
      description: 'A different product for testing.',
      imageUrl: 'https://via.placeholder.com/400/123456',
      category: 'Another Category',
      specifications: {}, // Test with empty specs
    };
    mockUseParams.mockReturnValue({ id: productId });
    mockFetchProductById.mockResolvedValueOnce(anotherMockProduct);

    render(<ProductPage />);

    await waitFor(() => {
      expect(mockFetchProductById).toHaveBeenCalledTimes(1);
      expect(mockFetchProductById).toHaveBeenCalledWith(productId);
      expect(MockProductDetail).toHaveBeenCalledWith(expect.objectContaining({
        isLoading: false,
        error: null,
        product: anotherMockProduct,
      }), {});
    });
  });
});
