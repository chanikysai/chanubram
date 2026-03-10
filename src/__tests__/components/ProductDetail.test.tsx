import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductDetail from './ProductDetail';
import { CartProvider, useCart } from '../context/CartContext'; // Assuming CartContext is in ../context/

// Mock the useCart hook
jest.mock('../context/CartContext', () => ({
  ...jest.requireActual('../context/CartContext'),
  useCart: jest.fn(),
}));

const mockUseCart = useCart as jest.Mock;

// Mock the Product type
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
}

describe('ProductDetail', () => {
  const mockProduct: Product = {
    id: 'prod-detail-1',
    name: 'Detailed Product',
    description: 'This is a detailed description of the product.',
    price: 150.75,
  };

  beforeEach(() => {
    // Reset mocks before each test
    mockUseCart.mockClear();
  });

  // Test 1: Render product details correctly (happy path)
  test('should render product name, description, and price', () => {
    // Mock the context to return the addItem function
    mockUseCart.mockReturnValue({
      addItem: jest.fn(),
    });

    render(
      <CartProvider> {/* CartProvider is needed for context value propagation */}
        <ProductDetail product={mockProduct} />
      </CartProvider>
    );

    expect(screen.getByRole('heading', { name: 'Detailed Product' })).toBeInTheDocument();
    expect(screen.getByText('This is a detailed description of the product.')).toBeInTheDocument();
    expect(screen.getByText('$150.75')).toBeInTheDocument();
  });

  // Test 2: Render with no description available (edge case)
  test('should render "No description available." if description is missing', () => {
    const productWithoutDescription: Product = {
      id: 'prod-detail-no-desc',
      name: 'Product Without Desc',
      price: 75.00,
    };

    mockUseCart.mockReturnValue({
      addItem: jest.fn(),
    });

    render(
      <CartProvider>
        <ProductDetail product={productWithoutDescription} />
      </CartProvider>
    );

    expect(screen.getByRole('heading', { name: 'Product Without Desc' })).toBeInTheDocument();
    expect(screen.getByText('No description available.')).toBeInTheDocument();
    expect(screen.getByText('$75.00')).toBeInTheDocument();
  });

  // Test 3: Call addItem when "Add to Cart" button is clicked (happy path)
  test('should call addItem from context with product details when "Add to Cart" button is clicked', () => {
    const mockAddItem = jest.fn();
    mockUseCart.mockReturnValue({
      addItem: mockAddItem,
    });

    render(
      <CartProvider>
        <ProductDetail product={mockProduct} />
      </CartProvider>
    );

    const addButton = screen.getByText('Add to Cart');
    fireEvent.click(addButton);

    expect(mockAddItem).toHaveBeenCalledTimes(1);
    // Expect it to be called with the full product object
    expect(mockAddItem).toHaveBeenCalledWith(mockProduct);
  });

  // Test 4: Ensure the button click triggers the correct action
  // Covered by Test 3, verifying mockAddItem is called.

  // Test 5: Ensure context is correctly passed if CartProvider is used
  test('should use context provided by CartProvider', () => {
    const mockAddItem = jest.fn();
    mockUseCart.mockReturnValue({
      addItem: mockAddItem,
    });

    render(
      <CartProvider> {/* Explicitly use CartProvider */}
        <ProductDetail product={mockProduct} />
      </CartProvider>
    );

    // Check if the hook was used, implying context was accessible
    expect(mockUseCart).toHaveBeenCalled();
  });
});
