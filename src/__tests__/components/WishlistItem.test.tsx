
// src/__tests__/components/WishlistItem.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WishlistItem from '../components/WishlistItem';
import type { Product } from '../types/product';
import type { WishlistItem as WishlistItemType } from '../types/wishlist';

// Mock Product and WishlistItem types
const mockProduct: Product = {
  id: 'prod-1',
  name: 'Fancy Gadget',
  price: 99.99,
  description: 'A very fancy gadget indeed.',
  imageUrl: '/images/gadget.jpg',
};

const mockWishlistItem: WishlistItemType = {
  ...mockProduct,
  wishlistId: 'wish-item-abc', // Unique ID for this wishlist entry
  addedAt: new Date().toISOString(),
};

const mockWishlistItemWithoutImage: WishlistItemType = {
  id: 'prod-2',
  productId: 'prod-2', // This might be redundant if item.id is the productId
  wishlistId: 'wish-item-def',
  name: 'Basic Widget',
  price: 19.50,
  description: 'A simple widget.',
  addedAt: new Date().toISOString(),
  // imageUrl is missing
};

describe('WishlistItem', () => {
  // Happy Path: Renders item details and buttons correctly
  test('renders item details and buttons correctly', () => {
    const mockOnRemove = jest.fn();
    const mockOnAddToCart = jest.fn();

    render(
      <WishlistItem item={mockWishlistItem} onRemove={mockOnRemove} onAddToCart={mockOnAddToCart} />
    );

    // Check if product details are rendered
    expect(screen.getByText('Fancy Gadget')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('A very fancy gadget indeed.')).toBeInTheDocument();
    const img = screen.getByAltText('Fancy Gadget');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/gadget.jpg');

    // Check if buttons are rendered
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  // Edge Case: Renders item without an image, using placeholder
  test('renders with placeholder image if imageUrl is missing', () => {
    const mockOnRemove = jest.fn();
    const mockOnAddToCart = jest.fn();

    render(
      <WishlistItem item={mockWishlistItemWithoutImage} onRemove={mockOnRemove} onAddToCart={mockOnAddToCart} />
    );

    expect(screen.getByText('Basic Widget')).toBeInTheDocument();
    expect(screen.getByText('$19.50')).toBeInTheDocument();
    expect(screen.getByText('A simple widget.')).toBeInTheDocument();
    const img = screen.getByAltText('Basic Widget');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/placeholder-image.png'); // Expecting the placeholder
  });

  // Test: onRemove function is called when "Remove" button is clicked
  test('calls onRemove with correct wishlistId when Remove button is clicked', () => {
    const mockOnRemove = jest.fn();
    const mockOnAddToCart = jest.fn();

    render(<WishlistItem item={mockWishlistItem} onRemove={mockOnRemove} onAddToCart={mockOnAddToCart} />);

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    expect(mockOnRemove).toHaveBeenCalledWith(mockWishlistItem.wishlistId); // Ensure the correct ID is passed
  });

  // Test: onAddToCart function is called with correct product details when "Add to Cart" button is clicked
  test('calls onAddToCart with correct product details when Add to Cart button is clicked', () => {
    const mockOnRemove = jest.fn();
    const mockOnAddToCart = jest.fn();

    render(<WishlistItem item={mockWishlistItem} onRemove={mockOnRemove} onAddToCart={mockOnAddToCart} />);

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);

    expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
    // Check if the product object passed matches the expected structure and data
    expect(mockOnAddToCart).toHaveBeenCalledWith({
      id: mockWishlistItem.id, // Should be the productId
      name: mockWishlistItem.name,
      price: mockWishlistItem.price,
      description: mockWishlistItem.description,
      imageUrl: mockWishlistItem.imageUrl,
    });
  });
});
