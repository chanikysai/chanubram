import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WishlistItemComponent from '../../src/components/WishlistItem'; // Adjust the import path as needed
import { WishlistItem } from '../../src/types/wishlist'; // Import the WishlistItem type

// Mock data for a WishlistItem
const mockWishlistItem: WishlistItem = {
  id: 'prod_1',
  wishlistId: 'wish_abc',
  name: 'Stylish T-Shirt',
  description: 'A comfortable and stylish t-shirt.',
  price: 25.00,
  imageUrl: '/images/product1.jpg',
  inventory: 50,
  addedAt: '2023-10-27T10:00:00Z',
};

// Mock handler functions
const mockOnRemove = jest.fn();
const mockOnMoveToCart = jest.fn();

describe('WishlistItemComponent', () => {
  // Test case 1: Renders correctly with item details
  test('renders item details correctly', () => {
    render(
      <WishlistItemComponent
        item={mockWishlistItem}
        onRemove={mockOnRemove}
        onMoveToCart={mockOnMoveToCart}
      />
    );

    // Check if product name, price, and image are displayed
    expect(screen.getByText(mockWishlistItem.name)).toBeInTheDocument();
    expect(screen.getByText(`$${mockWishlistItem.price.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByAltText(mockWishlistItem.name)).toBeInTheDocument();
    expect(screen.getByAltText(mockWishlistItem.name)).toHaveAttribute('src', mockWishlistItem.imageUrl);
  });

  // Test case 2: Calls onRemove when the "Remove" button is clicked
  test('calls onRemove handler when Remove button is clicked', () => {
    render(
      <WishlistItemComponent
        item={mockWishlistItem}
        onRemove={mockOnRemove}
        onMoveToCart={mockOnMoveToCart}
      />
    );

    const removeButton = screen.getByRole('button', { name: `Remove ${mockWishlistItem.name} from wishlist` });
    fireEvent.click(removeButton);

    // Expect onRemove to have been called with the correct wishlistId
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    expect(mockOnRemove).toHaveBeenCalledWith(mockWishlistItem.wishlistId);
  });

  // Test case 3: Calls onMoveToCart when the "Move to Cart" button is clicked
  test('calls onMoveToCart handler when Move to Cart button is clicked', () => {
    render(
      <WishlistItemComponent
        item={mockWishlistItem}
        onRemove={mockOnRemove}
        onMoveToCart={mockOnMoveToCart}
      />
    );

    const moveToCartButton = screen.getByRole('button', { name: `Move ${mockWishlistItem.name} to cart` });
    fireEvent.click(moveToCartButton);

    // Expect onMoveToCart to have been called with the item object
    expect(mockOnMoveToCart).toHaveBeenCalledTimes(1);
    expect(mockOnMoveToCart).toHaveBeenCalledWith(mockWishlistItem);
  });

  // Edge case: Test with missing image URL (should use placeholder)
  test('displays placeholder image if imageUrl is missing', () => {
    const itemWithoutImage: WishlistItem = {
      ...mockWishlistItem,
      imageUrl: '', // Empty imageUrl
    };

    render(
      <WishlistItemComponent
        item={itemWithoutImage}
        onRemove={mockOnRemove}
        onMoveToCart={mockOnMoveToCart}
      />
    );

    // Check if the alt text is still correct and the src points to the placeholder
    const imgElement = screen.getByAltText(itemWithoutImage.name);
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', 'https://via.placeholder.com/100');
  });
});
