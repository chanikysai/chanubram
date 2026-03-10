// src/__tests__/components/WishlistItem.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WishlistItem from '../components/WishlistItem'; // Corrected import path
import type { Product } from '../types/product'; // Assuming Product type is needed

// Mock Product type if not globally available
interface MockProduct extends Product {
  id: string;
  name: string;
  price: number;
}

describe('WishlistItem', () => {
  const mockProduct: MockProduct = {
    id: 'wish-item-1',
    name: 'Wishlist Item Example',
    price: 75.50,
  };

  const mockOnRemove = jest.fn();
  const mockOnMoveToCart = jest.fn();

  // Test 1: Render product details correctly (happy path)
  test('should render product name and price', () => {
    render(
      <WishlistItem
        product={mockProduct}
        onRemove={mockOnRemove}
        onMoveToCart={mockOnMoveToCart}
      />
    );

    expect(screen.getByText('Wishlist Item Example')).toBeInTheDocument();
    expect(screen.getByText('$75.50')).toBeInTheDocument();
  });

  // Test 2: Call onRemove when "Remove" button is clicked (happy path)
  test('should call onRemove with product ID when "Remove" button is clicked', () => {
    render(
      <WishlistItem
        product={mockProduct}
        onRemove={mockOnRemove}
        onMoveToCart={mockOnMoveToCart}
      />
    );

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    expect(mockOnRemove).toHaveBeenCalledWith(mockProduct.id);
  });

  // Test 3: Call onMoveToCart when "Add to Cart" button is clicked (happy path)
  test('should call onMoveToCart with product details when "Add to Cart" button is clicked', () => {
    render(
      <WishlistItem
        product={mockProduct}
        onRemove={mockOnRemove}
        onMoveToCart={mockOnMoveToCart}
      />
    );

    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    expect(mockOnMoveToCart).toHaveBeenCalledTimes(1);
    expect(mockOnMoveToCart).toHaveBeenCalledWith(mockProduct);
  });

  // Test 4: Edge case - Product with zero price
  test('should render correctly with a zero price product', () => {
    const zeroPriceProduct: MockProduct = {
      ...mockProduct,
      id: 'wish-item-zero-price',
      price: 0.00,
    };
    render(
      <WishlistItem
        product={zeroPriceProduct}
        onRemove={mockOnRemove}
        onMoveToCart={mockOnMoveToCart}
      />
    );

    expect(screen.getByText('Wishlist Item Example')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  // Test 5: Error handling - This component relies on its parent to handle errors from API calls
  // For component-level testing, we ensure the correct callbacks are triggered.
  // A more robust error handling test would involve mocking `onRemove` or `onMoveToCart` to throw errors,
  // but this component itself doesn't have error handling logic, it just calls props.
  // We can test that callbacks are called, which is covered by tests 2 and 3.
});
