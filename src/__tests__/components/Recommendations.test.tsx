// src/__tests__/components/Recommendations.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Recommendations from '../components/Recommendations';
import { getRecommendations, getPopularProducts } from '../services/recommendationApi';
import { Product } from '../types/product'; // Assuming Product type is defined here

// Mock the API functions
jest.mock('../services/recommendationApi');

// Mock the Product type structure
interface MockProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

// Cast the mocked API functions to use our mock type for better type safety in tests
const mockGetRecommendations = getRecommendations as jest.Mock;
const mockGetPopularProducts = getPopularProducts as jest.Mock;

describe('Recommendations Component', () => {
  const mockProduct1: MockProduct = {
    id: 'p1',
    name: 'Mock Gadget',
    description: 'A mock gadget for testing',
    price: 99.99,
    imageUrl: '/path/to/mock-gadget.jpg',
  };
  const mockProduct2: MockProduct = {
    id: 'p2',
    name: 'Mock Item',
    description: 'Another mock item',
    price: 49.50,
    imageUrl: '/path/to/mock-item.jpg',
  };
  const mockProduct3: MockProduct = {
    id: 'p3',
    name: 'Mock Third',
    description: 'A third mock product',
    price: 25.00,
    imageUrl: '/path/to/mock-third.jpg',
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test case 1: Loading state
  test('should display loading message while fetching recommendations', async () => {
    mockGetRecommendations.mockImplementation(async () => {
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 50));
      return [mockProduct1];
    });

    render(<Recommendations productId="p1" />);
    expect(screen.getByText('Loading recommendations...')).toBeInTheDocument();

    // Wait for the loading message to disappear
    await waitFor(() => expect(screen.queryByText('Loading recommendations...')).not.toBeInTheDocument());
  });

  // Test case 2: Error state
  test('should display error message if fetching recommendations fails', async () => {
    const errorMessage = 'Failed to load recommendations.';
    mockGetRecommendations.mockRejectedValue(new Error('API Error'));

    render(<Recommendations productId="p1" />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.queryByText('Loading recommendations...')).not.toBeInTheDocument();
    });
  });

  // Test case 3: No recommendations available
  test('should display message when no recommendations are available', async () => {
    mockGetRecommendations.mockResolvedValue([]); // Return an empty array

    render(<Recommendations productId="p1" />);

    await waitFor(() => {
      expect(screen.getByText('No recommendations available at the moment.')).toBeInTheDocument();
      expect(screen.queryByText('Loading recommendations...')).not.toBeInTheDocument();
    });
  });

  // Test case 4: Display recommendations when productId is provided
  test('should display recommendations when productId is provided', async () => {
    mockGetRecommendations.mockResolvedValue([mockProduct1, mockProduct2]);

    render(<Recommendations productId="p1" />);

    await waitFor(() => {
      expect(screen.getByText('Recommended for You')).toBeInTheDocument();
      expect(screen.getByText(mockProduct1.name)).toBeInTheDocument();
      expect(screen.getByText(`$${mockProduct1.price.toFixed(2)}`)).toBeInTheDocument();
      expect(screen.getByText(mockProduct2.name)).toBeInTheDocument();
      expect(screen.getByText(`$${mockProduct2.price.toFixed(2)}`)).toBeInTheDocument();
      expect(mockGetRecommendations).toHaveBeenCalledWith('p1');
      expect(mockGetPopularProducts).not.toHaveBeenCalled();
    });
  });

  // Test case 5: Display popular products when no productId is provided
  test('should display popular products when no productId is provided', async () => {
    mockGetPopularProducts.mockResolvedValue([mockProduct1, mockProduct3]);

    render(<Recommendations />); // No productId passed

    await waitFor(() => {
      expect(screen.getByText('Recommended for You')).toBeInTheDocument();
      expect(screen.getByText(mockProduct1.name)).toBeInTheDocument();
      expect(screen.getByText(`$${mockProduct1.price.toFixed(2)}`)).toBeInTheDocument();
      expect(screen.getByText(mockProduct3.name)).toBeInTheDocument();
      expect(screen.getByText(`$${mockProduct3.price.toFixed(2)}`)).toBeInTheDocument();
      expect(mockGetPopularProducts).toHaveBeenCalled();
      expect(mockGetRecommendations).not.toHaveBeenCalled();
    });
  });

  // Test case 6: Component re-renders with new productId
  test('should refetch recommendations if productId prop changes', async () => {
    const initialProductIds = [mockProduct1.id];
    const updatedProductIds = [mockProduct2.id, mockProduct3.id];

    mockGetRecommendations.mockResolvedValueOnce([mockProduct1]); // First render
    mockGetRecommendations.mockResolvedValueOnce([mockProduct2, mockProduct3]); // Second render

    const { rerender } = render(<Recommendations productId="p1" />);

    await waitFor(() => expect(mockGetRecommendations).toHaveBeenCalledWith('p1'));
    expect(screen.getByText(mockProduct1.name)).toBeInTheDocument();

    // Rerender with a new productId
    rerender(<Recommendations productId="p2" />);

    await waitFor(() => expect(mockGetRecommendations).toHaveBeenCalledWith('p2'));
    expect(screen.queryByText(mockProduct1.name)).not.toBeInTheDocument(); // Old product should be gone
    expect(screen.getByText(mockProduct2.name)).toBeInTheDocument();
    expect(screen.getByText(mockProduct3.name)).toBeInTheDocument();
  });
});
