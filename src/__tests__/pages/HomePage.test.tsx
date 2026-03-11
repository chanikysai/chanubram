// src/__tests__/pages/HomePage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import HomePage from '../../src/pages/HomePage';
import * as productApi from '../../src/services/productApi'; // Import functions to mock them

// Mock Product type
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  inventory: number;
}

// Mock the product API functions
jest.mock('../../src/services/productApi');

// Mock product data
const mockProducts: Product[] = [
  { id: 'prod_1', name: 'Stylish T-Shirt', description: 'Cotton T-Shirt', price: 25.00, imageUrl: '/images/product1.jpg', inventory: 50 },
  { id: 'prod_2', name: 'Comfortable Jeans', description: 'Denim Jeans', price: 50.00, imageUrl: '/images/product2.jpg', inventory: 30 },
  { id: 'prod_3', name: 'Classic Sneakers', description: 'Running Sneakers', price: 75.00, imageUrl: '/images/product3.jpg', inventory: 20 },
];

// Mock navigate from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock implementations for API calls
    (productApi.getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (productApi.getProductById as jest.Mock).mockResolvedValue(mockProducts[0]); // Default mock for getProductById
  });

  // Happy Path Test: Renders product list and allows navigation
  test('renders product list and navigates to product detail page on click', async () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );

    // Wait for loading to finish and products to be displayed
    await waitFor(() => expect(screen.getByText('Product Catalog')).toBeInTheDocument());
    expect(screen.getByText('Stylish T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    expect(screen.getByText('Comfortable Jeans')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();

    // Click on the first product card
    const firstProductCard = screen.getByText('Stylish T-Shirt').closest('.product-card');
    expect(firstProductCard).toBeInTheDocument();
    fireEvent.click(firstProductCard!);

    // Verify navigation to product detail page
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/products/prod_1');
    });
  });

  // Edge Case Test: Handles API error when fetching products
  test('displays an error message if fetching products fails', async () => {
    (productApi.getProducts as jest.Mock).mockRejectedValue(new Error('Failed to load products'));

    render(
      <Router>
        <HomePage />
      </Router>
    );

    await waitFor(() => expect(screen.getByText('Error: Failed to load products')).toBeInTheDocument());
  });

  // Edge Case Test: No products found message
  test('displays a message when no products are available', async () => {
    (productApi.getProducts as jest.Mock).mockResolvedValue([]); // Simulate empty product list

    render(
      <Router>
        <HomePage />
      </Router>
    );

    await waitFor(() => expect(screen.getByText('No products available at the moment.')).toBeInTheDocument());
  });

  // Test for search functionality
  test('filters products based on search query', async () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );

    await waitFor(() => expect(screen.getByText('Stylish T-Shirt')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText('Search products by name or description...');
    fireEvent.change(searchInput, { target: { value: 'Jeans' } });

    // Wait for filtering to apply
    await waitFor(() => {
      expect(screen.getByText('Comfortable Jeans')).toBeInTheDocument();
      expect(screen.queryByText('Stylish T-Shirt')).not.toBeInTheDocument();
    });
  });

  // Test for category filtering functionality
  test('filters products based on selected category', async () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );

    await waitFor(() => expect(screen.getByText('Stylish T-Shirt')).toBeInTheDocument());

    const categorySelect = screen.getByLabelText('Filter by Category:');
    fireEvent.change(categorySelect, { target: { value: 'cat_2' } }); // Footwear (mocked to match prod_3)

    await waitFor(() => {
      // Since mock categories are hardcoded and mapping is simplified, we expect 'prod_3'
      // If 'cat_2' maps to 'prod_3', it should be visible.
      // The current mock mapping in HomePage.tsx is: cat_1 -> prod_1, cat_2 -> prod_3, cat_3 -> prod_4
      expect(screen.getByText('Classic Sneakers')).toBeInTheDocument();
      expect(screen.queryByText('Stylish T-Shirt')).not.toBeInTheDocument();
      expect(screen.queryByText('Comfortable Jeans')).not.toBeInTheDocument();
    });
  });

  // Test for "No products found" message when search yields no results
  test('displays "No products found" message when search query has no matches', async () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );

    await waitFor(() => expect(screen.getByText('Stylish T-Shirt')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText('Search products by name or description...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentProduct' } });

    await waitFor(() => expect(screen.getByText('No products found matching your criteria.')).toBeInTheDocument());
  });
});
