
// src/__tests__/pages/WishlistPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WishlistPage from '../pages/WishlistPage';
import { getWishlist, removeFromWishlist } from '../services/wishlistApi';
import { CartContext } from '../context/CartContext';
import type { Product } from '../types/product';
import type { WishlistItem as WishlistItemType } from '../types/wishlist';

// Mock the API service functions
jest.mock('../services/wishlistApi');
const mockGetWishlist = getWishlist as jest.Mock;
const mockRemoveFromWishlist = removeFromWishlist as jest.Mock;

// Mock the CartContext provider and its methods
const mockAddItem = jest.fn();
const mockCartContextValue = {
  items: [], // Mock items if needed for other context interactions
  addItem: mockAddItem,
  removeItem: jest.fn(), // Mock other methods if they were used in the page
  updateQuantity: jest.fn(),
  clearCart: jest.fn(),
};

// Mock data
const MOCK_USER_ID = 'current-user-123'; // Matches the one in WishlistPage.tsx

const mockWishlistItem1: WishlistItemType = {
  wishlistId: 'wish-item-1',
  id: 'prod-1', // Product ID
  productId: 'prod-1',
  name: 'Awesome T-Shirt',
  price: 29.99,
  imageUrl: '/images/tshirt.jpg',
  addedAt: new Date().toISOString(),
};

const mockWishlistItem2: WishlistItemType = {
  wishlistId: 'wish-item-2',
  id: 'prod-2', // Product ID
  productId: 'prod-2',
  name: 'Cool Jeans',
  price: 75.00,
  imageUrl: '/images/jeans.jpg',
  addedAt: new Date().toISOString(),
};

const mockWishlist = [mockWishlistItem1, mockWishlistItem2];

// Mock Product type for onAddToCart's expected argument
const mockProduct1ForCart: Product = {
    id: 'prod-1',
    name: 'Awesome T-Shirt',
    price: 29.99,
    imageUrl: '/images/tshirt.jpg',
};

describe('WishlistPage', () => {
  // Mock window.confirm to control confirmation dialogs
  let confirmSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset mocks before each test
    mockGetWishlist.mockClear();
    mockRemoveFromWishlist.mockClear();
    mockAddItem.mockClear();

    // Set default mock behavior for API calls
    mockGetWishlist.mockResolvedValue([]); // Default to empty wishlist
    mockRemoveFromWishlist.mockResolvedValue([]); // Default to successful removal

    // Mock confirm dialog
    confirmSpy = jest.spyOn(window, 'confirm');
    confirmSpy.mockClear(); // Clear any previous mock implementations
  });

  afterEach(() => {
    // Restore the original confirm function after each test
    confirmSpy.mockRestore();
  });

  // Helper to render the page with the mocked CartContext
  const renderWithContext = (ui: React.ReactElement) => {
    return render(<CartContext.Provider value={mockCartContextValue}>{ui}</CartContext.Provider>);
  };

  // Happy Path: Displays wishlist items when available
  test('displays wishlist items when they are available', async () => {
    mockGetWishlist.mockResolvedValue(mockWishlist);
    renderWithContext(<WishlistPage />);

    // Check for loading state initially
    expect(screen.getByText(/loading your wishlist/i)).toBeInTheDocument();

    // Wait for the loading state to disappear and items to render
    await waitFor(() => {
      expect(screen.queryByText(/loading your wishlist/i)).not.toBeInTheDocument();
    });

    // Check if product names are rendered
    expect(screen.getByText('Awesome T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Cool Jeans')).toBeInTheDocument();

    // Check if the correct number of items are displayed (implicitly by checking presence of items)
    // We expect two WishlistItem components to be rendered
    expect(screen.getAllByRole('button', { name: /remove/i })).toHaveLength(2);
  });

  // Edge Case: Displays message when wishlist is empty
  test('displays an empty wishlist message when there are no items', async () => {
    mockGetWishlist.mockResolvedValue([]); // API returns an empty array
    renderWithContext(<WishlistPage />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading your wishlist/i)).not.toBeInTheDocument();
    });

    // Check for the empty wishlist message
    expect(screen.getByText(/your wishlist is currently empty/i)).toBeInTheDocument();
    expect(screen.getByText(/start exploring and add your favorite products!/i)).toBeInTheDocument();
  });

  // Error Handling: Displays error message if fetching wishlist fails
  test('displays an error message if fetching wishlist fails', async () => {
    const errorMessage = 'Failed to load your wishlist. Please try again later.';
    mockGetWishlist.mockRejectedValue(new Error('API Error'));
    renderWithContext(<WishlistPage />);

    // Wait for loading to finish (and error to be shown)
    await waitFor(() => {
      expect(screen.queryByText(/loading your wishlist/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(/failed to load your wishlist/i)).toBeInTheDocument(); // Specific part of error message
  });

  // Interaction Test: Removing an item from the wishlist
  test('removes an item from the wishlist when the "Remove" button is clicked and confirmed', async () => {
    mockGetWishlist.mockResolvedValue(mockWishlist);
    mockRemoveFromWishlist.mockResolvedValue([mockWishlistItem1]); // Simulate successful removal of item 2
    renderWithContext(<WishlistPage />);

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Awesome T-Shirt')).toBeInTheDocument();
      expect(screen.getByText('Cool Jeans')).toBeInTheDocument();
    });

    // Find the "Remove" button for "Cool Jeans"
    // We need to be careful to target the correct remove button.
    // Since WishlistItem renders its own buttons, we can query for them within the context of the item.
    // A more robust way is to find the item by its name and then find the button within it.
    const jeansItemElement = screen.getByText('Cool Jeans').closest('.wishlist-item');
    expect(jeansItemElement).toBeInTheDocument();

    const removeButtonForJeans = jeansItemElement?.querySelector('button[aria-label*="Remove Cool Jeans"]');
    expect(removeButtonForJeans).toBeInTheDocument();

    // Mock window.confirm to return true (user confirms)
    confirmSpy.mockReturnValue(true);

    // Click the remove button
    fireEvent.click(removeButtonForJeans!);

    // Wait for the confirmation prompt to be called
    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to remove this item from your wishlist?');
    });

    // Wait for the API call to be made
    await waitFor(() => {
      expect(mockRemoveFromWishlist).toHaveBeenCalledTimes(1);
      expect(mockRemoveFromWishlist).toHaveBeenCalledWith(MOCK_USER_ID, mockWishlistItem2.wishlistId);
    });

    // Wait for the UI to update (item 2 should be gone)
    await waitFor(() => {
      expect(screen.queryByText('Cool Jeans')).not.toBeInTheDocument();
      expect(screen.getByText('Awesome T-Shirt')).toBeInTheDocument(); // Item 1 should still be there
      expect(screen.getAllByRole('button', { name: /remove/i })).toHaveLength(1); // Only one remove button left
    });
  });

  // Interaction Test: Moving an item to the cart
  test('moves an item to the cart and removes it from wishlist', async () => {
    mockGetWishlist.mockResolvedValue(mockWishlist);
    // Simulate successful removal after adding to cart
    mockRemoveFromWishlist.mockResolvedValue([mockWishlistItem1]);
    renderWithContext(<WishlistPage />);

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Awesome T-Shirt')).toBeInTheDocument();
    });

    // Find the "Add to Cart" button for "Awesome T-Shirt"
    const tShirtItemElement = screen.getByText('Awesome T-Shirt').closest('.wishlist-item');
    expect(tShirtItemElement).toBeInTheDocument();

    const addToCartButtonForTShirt = tShirtItemElement?.querySelector('button[aria-label*="Add Awesome T-Shirt to cart"]');
    expect(addToCartButtonForTShirt).toBeInTheDocument();

    // Click the "Add to Cart" button
    fireEvent.click(addToCartButtonForTShirt!);

    // Wait for the addItem to be called on the context
    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledTimes(1);
      // Check if it was called with the correct Product object structure
      expect(mockAddItem).toHaveBeenCalledWith({
        id: mockWishlistItem1.id, // Product ID
        name: mockWishlistItem1.name,
        price: mockWishlistItem1.price,
        imageUrl: mockWishlistItem1.imageUrl,
        description: mockWishlistItem1.description, // Ensure description is passed if available
      });
    });

    // Wait for the removeFromWishlist API call to be made (as it's called after addItem)
    await waitFor(() => {
      expect(mockRemoveFromWishlist).toHaveBeenCalledTimes(1);
      expect(mockRemoveFromWishlist).toHaveBeenCalledWith(MOCK_USER_ID, mockWishlistItem1.wishlistId);
    });

    // Wait for the UI to update (item 1 should be gone from wishlist view)
    await waitFor(() => {
      expect(screen.queryByText('Awesome T-Shirt')).not.toBeInTheDocument();
      expect(screen.getByText('Cool Jeans')).toBeInTheDocument(); // Item 2 should still be there
      expect(screen.getAllByRole('button', { name: /remove/i })).toHaveLength(1); // Only one remove button left for item 2
    });
  });

  // Interaction Test: Handle error when removing an item
  test('displays an error message if removing an item fails', async () => {
    mockGetWishlist.mockResolvedValue(mockWishlist);
    mockRemoveFromWishlist.mockRejectedValue(new Error('Failed to remove')); // Simulate API error
    renderWithContext(<WishlistPage />);

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Awesome T-Shirt')).toBeInTheDocument();
    });

    // Find and click the remove button for item 1
    const tShirtItemElement = screen.getByText('Awesome T-Shirt').closest('.wishlist-item');
    const removeButtonForTShirt = tShirtItemElement?.querySelector('button[aria-label*="Remove Awesome T-Shirt from wishlist"]');
    confirmSpy.mockReturnValue(true); // User confirms removal
    fireEvent.click(removeButtonForTShirt!);

    // Wait for API call and error message display
    await waitFor(() => {
      expect(mockRemoveFromWishlist).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Failed to remove item. Please try again.')).toBeInTheDocument();
    });

    // Ensure the item is still in the list as removal failed
    expect(screen.getByText('Awesome T-Shirt')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /remove/i })).toHaveLength(2);
  });

  // Interaction Test: Handle error when moving item to cart
  test('displays an error message if moving an item to cart fails', async () => {
    mockGetWishlist.mockResolvedValue(mockWishlist);
    // Simulate API error during removal after adding to cart
    mockRemoveFromWishlist.mockRejectedValue(new Error('Failed to remove after add'));
    renderWithContext(<WishlistPage />);

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Awesome T-Shirt')).toBeInTheDocument();
    });

    // Find and click the "Add to Cart" button for item 1
    const tShirtItemElement = screen.getByText('Awesome T-Shirt').closest('.wishlist-item');
    const addToCartButtonForTShirt = tShirtItemElement?.querySelector('button[aria-label*="Add Awesome T-Shirt to cart"]');
    fireEvent.click(addToCartButtonForTShirt!);

    // Wait for addItem to be called and then for the removeFromWishlist error
    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledTimes(1);
      expect(mockRemoveFromWishlist).toHaveBeenCalledTimes(1); // This call will fail
      expect(screen.getByText('Failed to move item to cart. Please check your connection or try again.')).toBeInTheDocument();
    });

    // Check that the item is still in the wishlist as the move operation failed
    expect(screen.getByText('Awesome T-Shirt')).toBeInTheDocument();
  });

  // Test: User cancels removal confirmation
  test('does not remove item if user cancels the confirmation dialog', async () => {
    mockGetWishlist.mockResolvedValue(mockWishlist);
    renderWithContext(<WishlistPage />);

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Awesome T-Shirt')).toBeInTheDocument();
    });

    const tShirtItemElement = screen.getByText('Awesome T-Shirt').closest('.wishlist-item');
    const removeButtonForTShirt = tShirtItemElement?.querySelector('button[aria-label*="Remove Awesome T-Shirt from wishlist"]');

    // Mock window.confirm to return false (user cancels)
    confirmSpy.mockReturnValue(false);

    fireEvent.click(removeButtonForTShirt!);

    // Wait for confirm to be called
    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledTimes(1);
    });

    // Ensure no API calls were made and the item is still present
    expect(mockRemoveFromWishlist).not.toHaveBeenCalled();
    expect(screen.getByText('Awesome T-Shirt')).toBeInTheDocument();
  });
});
