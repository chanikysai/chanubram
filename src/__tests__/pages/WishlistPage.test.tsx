// src/__tests__/pages/WishlistPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom'; // For testing routing
import { CartProvider } from '../context/CartContext'; // Assuming CartProvider is in ../context/
import WishlistPage from '../pages/WishlistPage';
import * as wishlistApi from '../services/wishlistApi'; // Mocking API calls
import type { Product } from '../types/product';

// Mock the Product type if it's not globally available
interface MockProduct extends Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

// Mocking the CartContext hook
const mockAddItem = jest.fn();
jest.mock('../context/CartContext', () => ({
  useCart: () => ({
    addItem: mockAddItem,
    cartItems: [], // Provide a mock cartItems if needed by other parts
  }),
}));

// Mocking wishlist API functions
const mockFetchWishlistItems = jest.spyOn(wishlistApi, 'fetchWishlistItems');
const mockRemoveWishlistItem = jest.spyOn(wishlistApi, 'removeWishlistItem');
const mockMoveWishlistItemToCart = jest.spyOn(wishlistApi, 'moveWishlistItemToCart');

describe('WishlistPage', () => {
  const mockProducts: MockProduct[] = [
    { id: 'wish-item-1', name: 'Fancy Widget', price: 29.99, description: 'A very fancy widget.' },
    { id: 'wish-item-2', name: 'Basic Gadget', price: 10.00, description: 'A simple, reliable gadget.' },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    mockFetchWishlistItems.mockClear();
    mockRemoveWishlistItem.mockClear();
    mockMoveWishlistItemToCart.mockClear();
    mockAddItem.mockClear();

    // Set default mock implementations
    // For fetchWishlistItems, we'll set it in specific tests if needed
    mockFetchWishlistItems.mockResolvedValue(mockProducts);
    mockRemoveWishlistItem.mockResolvedValue(undefined);
    mockMoveWishlistItemToCart.mockResolvedValue(undefined);
  });

  // Test 1: Render loading state (happy path during initial load)
  test('should show loading indicator while fetching wishlist', async () => {
    // Make fetch return a promise that doesn't resolve immediately
    mockFetchWishlistItems.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <CartProvider>
          <WishlistPage />
        </CartProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading wishlist...')).toBeInTheDocument();
  });

  // Test 2: Render wishlist items correctly (happy path)
  test('should render wishlist items when fetched successfully', async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <WishlistPage />
        </CartProvider>
      </MemoryRouter>
    );

    // Wait for the API call to complete and items to be rendered
    await waitFor(() => {
      expect(screen.getByText('My Wishlist')).toBeInTheDocument();
      expect(screen.getByText('Fancy Widget')).toBeInTheDocument();
      expect(screen.getByText('$29.99')).toBeInTheDocument();
      expect(screen.getByText('Basic Gadget')).toBeInTheDocument();
      expect(screen.getByText('$10.00')).toBeInTheDocument();
    });

    expect(mockFetchWishlistItems).toHaveBeenCalledTimes(1);
  });

  // Test 3: Display empty wishlist message (edge case)
  test('should display empty wishlist message when no items are returned', async () => {
    mockFetchWishlistItems.mockResolvedValue([]); // Simulate an empty wishlist

    render(
      <MemoryRouter>
        <CartProvider>
          <WishlistPage />
        </CartProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('My Wishlist')).toBeInTheDocument();
      expect(screen.getByText('Your wishlist is empty. Start shopping!')).toBeInTheDocument();
      expect(screen.queryByText('Fancy Widget')).not.toBeInTheDocument(); // Ensure no items are rendered
    });
  });

  // Test 4: Handle error during wishlist fetching (error handling)
  test('should display error message if fetching wishlist fails', async () => {
    const errorMessage = 'Failed to fetch';
    mockFetchWishlistItems.mockRejectedValue(new Error(errorMessage));

    render(
      <MemoryRouter>
        <CartProvider>
          <WishlistPage />
        </CartProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('My Wishlist')).toBeInTheDocument();
      expect(screen.getByText('Could not load your wishlist. Please try again later.')).toBeInTheDocument();
      expect(screen.queryByText('Loading wishlist...')).not.toBeInTheDocument();
    });
  });

  // Test 5: Remove an item from the wishlist (happy path)
  test('should remove item from wishlist when "Remove" button is clicked', async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <WishlistPage />
        </CartProvider>
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => expect(screen.getByText('Fancy Widget')).toBeInTheDocument());

    // Find the "Remove" button for the first item and click it
    const firstItemRemoveButton = screen.getAllByText('Remove')[0];
    fireEvent.click(firstItemRemoveButton);

    // Wait for the API call to resolve and the item to be removed from the UI
    await waitFor(() => {
      expect(mockRemoveWishlistItem).toHaveBeenCalledTimes(1);
      expect(mockRemoveWishlistItem).toHaveBeenCalledWith('wish-item-1');
      expect(screen.queryByText('Fancy Widget')).not.toBeInTheDocument(); // Item should be gone
      expect(screen.queryByText('Basic Gadget')).toBeInTheDocument(); // Other item should remain
    });
  });

  // Test 6: Handle error when removing an item (error handling)
  test('should display error message when removing an item fails', async () => {
    const errorMessage = 'Failed to remove';
    mockRemoveWishlistItem.mockRejectedValue(new Error(errorMessage));

    render(
      <MemoryRouter>
        <CartProvider>
          <WishlistPage />
        </CartProvider>
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => expect(screen.getByText('Fancy Widget')).toBeInTheDocument());

    // Find the "Remove" button for the first item and click it
    const firstItemRemoveButton = screen.getAllByText('Remove')[0];
    fireEvent.click(firstItemRemoveButton);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(mockRemoveWishlistItem).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Could not remove item. Please try again.')).toBeInTheDocument();
      expect(screen.getByText('Fancy Widget')).toBeInTheDocument(); // Item should still be visible as removal failed
    });
  });

  // Test 7: Move an item from wishlist to cart (happy path)
  test('should move item to cart and remove from wishlist when "Add to Cart" is clicked', async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <WishlistPage />
        </CartProvider>
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => expect(screen.getByText('Fancy Widget')).toBeInTheDocument());

    // Find the "Add to Cart" button for the first item and click it
    const firstItemAddToCartButton = screen.getAllByText('Add to Cart')[0];
    fireEvent.click(firstItemAddToCartButton);

    // Wait for the API call to resolve, item to be added to cart, and item to be removed from wishlist
    await waitFor(() => {
      expect(mockMoveWishlistItemToCart).toHaveBeenCalledTimes(1);
      expect(mockMoveWishlistItemToCart).toHaveBeenCalledWith('wish-item-1');
      expect(mockAddItem).toHaveBeenCalledTimes(1);
      expect(mockAddItem).toHaveBeenCalledWith(expect.objectContaining({ id: 'wish-item-1' })); // Check if correct product was added
      expect(screen.queryByText('Fancy Widget')).not.toBeInTheDocument(); // Item should be gone from wishlist
      expect(screen.queryByText('Basic Gadget')).toBeInTheDocument(); // Other item should remain
    });
  });

  // Test 8: Handle error when moving item to cart (error handling)
  test('should display error message when moving item to cart fails', async () => {
    const errorMessage = 'Failed to move';
    mockMoveWishlistItemToCart.mockRejectedValue(new Error(errorMessage));

    render(
      <MemoryRouter>
        <CartProvider>
          <WishlistPage />
        </CartProvider>
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => expect(screen.getByText('Fancy Widget')).toBeInTheDocument());

    // Find the "Add to Cart" button for the first item and click it
    const firstItemAddToCartButton = screen.getAllByText('Add to Cart')[0];
    fireEvent.click(firstItemAddToCartButton);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(mockMoveWishlistItemToCart).toHaveBeenCalledTimes(1);
      expect(mockAddItem).not.toHaveBeenCalled(); // AddItem should not be called if move fails
      expect(screen.getByText('Could not move item to cart. Please try again.')).toBeInTheDocument();
      expect(screen.getByText('Fancy Widget')).toBeInTheDocument(); // Item should still be visible in wishlist
    });
  });

  // Test 9: Navigation to product page (implicitly tested if links were present)
  // If WishlistItem had a link to ProductPage, we would test that here.
  // The current WishlistItem does not have such a link, so this test is not applicable.

  // Test 10: Render a product with zero price (edge case for rendering)
  test('should render a product with zero price correctly', async () => {
    const zeroPriceProduct: MockProduct = {
      id: 'wish-item-zero',
      name: 'Freebie',
      price: 0.00,
      description: 'A free item!',
    };
    mockFetchWishlistItems.mockResolvedValue([zeroPriceProduct]);

    render(
      <MemoryRouter>
        <CartProvider>
          <WishlistPage />
        </CartProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Freebie')).toBeInTheDocument();
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });
  });
});
