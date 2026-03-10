// src/__tests__/components/Recommendations.test.tsx
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import Recommendations from '../components/Recommendations';
import type { Product } from '../types/product';

// Mock the recommendation API module
// We need to mock the actual module path where it's imported in Recommendations.tsx
jest.mock('../services/recommendationApi', () => ({
  getRecommendations: jest.fn(),
  getPopularProducts: jest.fn(),
}));

// Get the mocked functions
const mockGetRecommendations = require('../services/recommendationApi').getRecommendations;
const mockGetPopularProducts = require('../services/recommendationApi').getPopularProducts;

// Mock Product type (same as in the service tests)
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
};

// Mock ProductCard component for easier testing of the list rendering
// This prevents needing to mock ProductCard's internal dependencies like CartContext
jest.mock('../components/ProductCard', () => {
  return jest.fn(({ product }: { product: Product }) => (
    <div data-testid="mock-product-card" data-product-id={product.id}>
      {product.name} - ${product.price.toFixed(2)}
    </div>
  ));
});

describe('Recommendations Component', () => {
  const mockProduct1: Product = { id: 'p1', name: 'Gadget', price: 99.99, description: 'A gadget' };
  const mockProduct2: Product = { id: 'p2', name: 'Item', price: 49.50, description: 'An item' };
  const mockProduct3: Product = { id: 'p3', name: 'Third', price: 25.00, description: 'A third thing' };
  const mockProduct4: Product = { id: 'p4', name: 'Fourth', price: 75.20, description: 'A fourth thing' };

  beforeEach(() => {
    // Clear mocks before each test
    mockGetRecommendations.mockClear();
    mockGetPopularProducts.mockClear();
    // Ensure the mocked ProductCard is also cleared if its state needs resetting,
    // though it's stateless here so clear() is sufficient.
    require('../components/ProductCard').default.mockClear();

    // Default mock behavior: simulate successful fetch of popular products
    mockGetPopularProducts.mockResolvedValue([mockProduct1, mockProduct2]);
    // Default mock behavior for getRecommendations when a productId is passed
    mockGetRecommendations.mockResolvedValue([mockProduct3, mockProduct4]);
  });

  it('should render loading state initially', () => {
    // Mocking the API call to not resolve immediately, so loading state is visible
    // We don't await the render, just check the initial state
    render(<Recommendations />);
    expect(screen.getByText('Loading recommendations...')).toBeInTheDocument();
  });

  it('should display recommendations when fetched successfully (no productId)', async () => {
    render(<Recommendations />);

    // Wait for the loading state to disappear and recommendations to appear
    await waitFor(() => {
      expect(screen.queryByText('Loading recommendations...')).not.toBeInTheDocument();
    });

    expect(mockGetPopularProducts).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Recommended for You')).toBeInTheDocument();
    expect(screen.getByText('Gadget - $99.99')).toBeInTheDocument();
    expect(screen.getByText('Item - $49.50')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-product-card')).toHaveLength(2);
  });

  it('should display recommendations when fetched successfully (with productId)', async () => {
    render(<Recommendations productId="p1" />);

    await waitFor(() => {
      expect(screen.queryByText('Loading recommendations...')).not.toBeInTheDocument();
    });

    expect(mockGetRecommendations).toHaveBeenCalledTimes(1);
    expect(mockGetRecommendations).toHaveBeenCalledWith('p1');
    expect(screen.getByText('Recommended for You')).toBeInTheDocument();
    expect(screen.getByText('Third - $25.00')).toBeInTheDocument();
    expect(screen.getByText('Fourth - $75.20')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-product-card')).toHaveLength(2);
  });

  it('should display an error message if fetching fails', async () => {
    const errorMessage = 'Failed to load recommendations';
    mockGetPopularProducts.mockRejectedValue(new Error('API Error'));

    render(<Recommendations />);

    await waitFor(() => {
      expect(screen.queryByText('Loading recommendations...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Could not load recommendations/)).toBeInTheDocument();
    expect(screen.getByText(/Could not load recommendations/)).toHaveStyle('color: red');
  });

  it('should display "No recommendations available" when API returns an empty list', async () => {
    mockGetPopularProducts.mockResolvedValue([]);
    render(<Recommendations />);

    await waitFor(() => {
      expect(screen.queryByText('Loading recommendations...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No recommendations available at the moment.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-product-card')).not.toBeInTheDocument();
  });

  it('should re-fetch recommendations if productId prop changes', async () => {
    const { rerender } = render(<Recommendations productId="p1" />);

    await waitFor(() => {
      expect(screen.queryByText('Loading recommendations...')).not.toBeInTheDocument();
    });
    expect(mockGetRecommendations).toHaveBeenCalledTimes(1);
    expect(mockGetRecommendations).toHaveBeenCalledWith('p1');
    expect(screen.getAllByTestId('mock-product-card')).toHaveLength(2); // Mocked data for p3, p4

    // Simulate product ID change
    mockGetPopularProducts.mockResolvedValue([mockProduct1, mockProduct2, mockProduct3]); // New popular products
    rerender(<Recommendations productId="p2" />); // New product ID

    // Loading state should appear again
    expect(screen.getByText('Loading recommendations...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading recommendations...')).not.toBeInTheDocument();
    });

    expect(mockGetRecommendations).toHaveBeenCalledTimes(2); // Called again for new ID
    expect(mockGetRecommendations).toHaveBeenCalledWith('p2');
    expect(screen.getAllByTestId('mock-product-card')).toHaveLength(3); // Mocked data for p1, p2, p3
    expect(screen.getByText('Gadget - $99.99')).toBeInTheDocument();
    expect(screen.getByText('Item - $49.50')).toBeInTheDocument();
    expect(screen.getByText('Third - $25.00')).toBeInTheDocument();
  });
});
