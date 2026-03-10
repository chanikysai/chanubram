// src/__tests__/pages/HomePage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../../pages/HomePage';
import { fetchProducts, Product } from '../../services/productApi';
import { useNavigate } from 'react-router-dom';

// Mock the API service
jest.mock('../../services/productApi');
// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mock product data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Mouse',
    price: 25.99,
    description: 'A comfortable and reliable wireless mouse.',
    imageUrl: 'https://via.placeholder.com/150/92c952',
    category: 'Electronics',
  },
  {
    id: '2',
    name: 'Mechanical Keyboard',
    price: 75.00,
    description: 'Durable mechanical keyboard with tactile keys.',
    imageUrl: 'https://via.placeholder.com/150/771796',
    category: 'Electronics',
  },
  {
    id: '3',
    name: 'Webcam',
    price: 55.00,
    description: 'High-definition webcam for clear video calls.',
    imageUrl: 'https://via.placeholder.com/150/24f355',
    category: 'Peripherals',
  },
];

describe('HomePage', () => {
  const mockNavigate = jest.fn();
  const mockFetchProducts = fetchProducts as jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    mockFetchProducts.mockClear();
    mockNavigate.mockClear();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  // Happy Path: Renders product list
  test('should render a list of products when fetchProducts succeeds', async () => {
    mockFetchProducts.mockResolvedValueOnce(mockProducts);

    render(<HomePage />);

    // Check for loading state
    expect(screen.getByText('Loading products...')).toBeInTheDocument();

    // Wait for products to be loaded and rendered
    await waitFor(() => {
      expect(screen.getByText('Our Products')).toBeInTheDocument();
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
      expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
      expect(screen.getByText('Webcam')).toBeInTheDocument();
      expect(screen.getByText('$25.99')).toBeInTheDocument();
      expect(screen.getByText('$75.00')).toBeInTheDocument();
      expect(screen.getByText('$55.00')).toBeInTheDocument();
    });

    expect(mockFetchProducts).toHaveBeenCalledTimes(1);
  });

  // Edge Case: No products returned
  test('should display "No products found" message when no products are fetched', async () => {
    mockFetchProducts.mockResolvedValueOnce([]);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Our Products')).toBeInTheDocument();
      expect(screen.getByText('No products found matching your search criteria.')).toBeInTheDocument();
    });
  });

  // Error Handling: fetchProducts fails
  test('should display error message when fetchProducts fails', async () => {
    const errorMessage = 'Failed to fetch products';
    mockFetchProducts.mockRejectedValueOnce(new Error(errorMessage));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Our Products')).toBeInTheDocument();
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  // Search Functionality
  test('should filter products based on search term', async () => {
    mockFetchProducts.mockResolvedValueOnce(mockProducts);
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
      expect(screen.getByText('Webcam')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search products...');
    fireEvent.change(searchInput, { target: { value: 'mouse' } });

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
      expect(screen.queryByText('Mechanical Keyboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Webcam')).not.toBeInTheDocument();
    });
  });

  // Category Filtering
  test('should filter products based on selected category', async () => {
    mockFetchProducts.mockResolvedValueOnce(mockProducts);
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
      expect(screen.getByText('Webcam')).toBeInTheDocument();
    });

    const categorySelect = screen.getByRole('combobox', { name: /All Categories/i });
    fireEvent.change(categorySelect, { target: { value: 'Peripherals' } });

    await waitFor(() => {
      expect(screen.getByText('Webcam')).toBeInTheDocument();
      expect(screen.queryByText('Wireless Mouse')).not.toBeInTheDocument();
      expect(screen.queryByText('Mechanical Keyboard')).not.toBeInTheDocument();
    });
  });

  // Combined Filtering
  test('should filter products by both search term and category', async () => {
    mockFetchProducts.mockResolvedValueOnce(mockProducts);
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
      expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
      expect(screen.getByText('Webcam')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search products...');
    fireEvent.change(searchInput, { target: { value: 'keyboard' } });

    const categorySelect = screen.getByRole('combobox', { name: /All Categories/i });
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });

    await waitFor(() => {
      expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
      expect(screen.queryByText('Wireless Mouse')).not.toBeInTheDocument();
      expect(screen.queryByText('Webcam')).not.toBeInTheDocument();
    });
  });

  // Product Card Click Navigation
  test('should navigate to product detail page when a product card is clicked', async () => {
    mockFetchProducts.mockResolvedValueOnce(mockProducts);
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    // Find the card element for "Wireless Mouse" and click it
    const mouseCard = screen.getByText('Wireless Mouse').closest('.product-card');
    expect(mouseCard).toBeInTheDocument();
    fireEvent.click(mouseCard!);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/products/1');
    });
  });
});
