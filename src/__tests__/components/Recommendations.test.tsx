// src/__tests__/components/Recommendations.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Recommendations from '../../components/Recommendations';
import { getRecommendations } from '../../services/recommendationApi'; // Import the mocked function

// Mock the recommendationApi module
jest.mock('../../services/recommendationApi');

// Mock the ProductCard component as it's a dependency
const MockProductCard: React.FC<{ product: any }> = ({ product }) => (
  <div data-testid={`product-card-${product.id}`} style={{ border: '1px solid #ccc', padding: '10px', margin: '5px' }}>
    <h4>{product.name}</h4>
    <p>${product.price}</p>
    <img src={product.imageUrl} alt={product.name} style={{ width: '50px', height: '50px' }} />
  </div>
);

// Mock the ProductCard component
jest.mock('../../components/ProductCard', () => MockProductCard);

// Type casting the mocked getRecommendations to jest.Mock
const mockGetRecommendations = getRecommendations as jest.Mock;

describe('Recommendations Component', () => {
  const mockProductId = 'prod_123';
  const mockProducts = [
    { id: 'rec_1', name: 'Recommended Item 1', imageUrl: '/img/rec1.jpg', price: 10 },
    { id: 'rec_2', name: 'Recommended Item 2', imageUrl: '/img/rec2.jpg', price: 20 },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    mockGetRecommendations.mockClear();
    // Default mock implementation to return an empty array to ensure tests don't interfere
    mockGetRecommendations.mockResolvedValue([]);
  });

  // Test Case 1: Loading State
  test('should display loading indicator while fetching recommendations', async () => {
    // Configure the mock to simulate a delay before resolving
    mockGetRecommendations.mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
      return mockProducts;
    });

    render(<Recommendations productId={mockProductId} />);

    // Check for loading text
    expect(screen.getByText('Loading recommendations...')).toBeInTheDocument();

    // Wait for the loading text to disappear
    await waitFor(() => expect(screen.queryByText('Loading recommendations...')).not.toBeInTheDocument());
  });

  // Test Case 2: Error State
  test('should display error message if fetching recommendations fails', async () => {
    const errorMessage = 'Could not load recommendations. Please try again later.';
    mockGetRecommendations.mockRejectedValue(new Error('API Error'));

    render(<Recommendations productId={mockProductId} />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  // Test Case 3: Empty State
  test('should display message when no recommendations are available', async () => {
    mockGetRecommendations.mockResolvedValue([]); // API returns an empty array

    render(<Recommendations productId={mockProductId} />);

    // Wait for loading to disappear and empty message to appear
    await waitFor(() => {
      expect(screen.getByText('No recommendations available at this time.')).toBeInTheDocument();
    });
  });

  // Test Case 4: Happy Path - Displaying Recommendations
  test('should display recommended products using ProductCard components', async () => {
    mockGetRecommendations.mockResolvedValue(mockProducts);

    render(<Recommendations productId={mockProductId} />);

    // Wait for loading to disappear and recommendations to be displayed
    await waitFor(() => {
      expect(screen.queryByText('Loading recommendations...')).not.toBeInTheDocument();
      expect(screen.getByText('Recommended for You')).toBeInTheDocument();
    });

    // Check if ProductCards are rendered for each recommended item
    expect(screen.getByTestId('product-card-rec_1')).toBeInTheDocument();
    expect(screen.getByTestId('product-card-rec_2')).toBeInTheDocument();

    // Check if the mock ProductCard content is rendered
    expect(screen.getByText('Recommended Item 1')).toBeInTheDocument();
    expect(screen.getByText('$10')).toBeInTheDocument();
    expect(screen.getByText('Recommended Item 2')).toBeInTheDocument();
    expect(screen.getByText('$20')).toBeInTheDocument();
  });

  // Test Case 5: Component does not fetch if no productId is provided
  test('should not fetch recommendations if productId is not provided or is empty', async () => {
    const { rerender } = render(<Recommendations productId={mockProductId} />);

    // Wait for initial fetch to complete and verify it was called
    await waitFor(() => expect(mockGetRecommendations).toHaveBeenCalledTimes(1));
    mockGetRecommendations.mockClear(); // Clear call count

    // Render with an empty productId
    rerender(<Recommendations productId="" />);

    // Give a moment for potential async operations (though none should happen)
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(mockGetRecommendations).not.toHaveBeenCalled();
    expect(screen.getByText('No recommendations available at this time.')).toBeInTheDocument();
  });
});
