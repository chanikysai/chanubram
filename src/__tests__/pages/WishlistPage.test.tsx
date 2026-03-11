import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import WishlistPage from '../../src/pages/WishlistPage';
import * as wishlistApi from '../../src/services/wishlistApi';
import { WishlistItem } from '../../src/types/wishlist';

// Mocking the API service
jest.mock('../../src/services/wishlistApi');
const mockedWishlistApi = wishlistApi as jest.Mocked<typeof wishlistApi>;

// Mocking react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock data
const mockWishlistItem1: WishlistItem = {
  id: 'prod_1',
  wishlistId: 'wish_abc',
  name: 'Stylish T-Shirt',
  description: 'A comfortable and stylish t-shirt.',
  price: 25.00,
  imageUrl: '/images/product1.jpg',
  inventory: 50,
  addedAt: '2023-10-27T10:00:00Z',
};

const mockWishlistItem2: WishlistItem = {
  id: 'prod_2',
  wishlistId: 'wish_def',
  name: 'Comfortable Jeans',
  description: 'Durable and soft denim jeans.',
  price: 50.00,
  imageUrl: '/images/product2.jpg',
  inventory: 30,
  addedAt: '2023-10-27T11:00:00Z',
};

const mockWishlistItems: WishlistItem[] = [mockWishlistItem1, mockWishlistItem2];

describe('WishlistPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockedWishlistApi.getWishlistItems.mockClear();
    mockedWishlistApi.removeWishlistItem.mockClear();
    mockedWishlistApi.moveWishlistItemToCart.mockClear();
    mockNavigate.mockClear();

    // Set default successful mocks
    mockedWishlistApi.getWishlistItems.mockResolvedValue(mockWishlistItems);
    mockedWishlistApi.removeWishlistItem.mockResolvedValue(undefined);
    mockedWishlistApi.moveWishlistItemToCart.mockResolvedValue(undefined);
  });

  // Test case 1: Loading state
  test('displays loading indicator while fetching wishlist', async () => {
    // Make getWishlistItems take longer to resolve to simulate loading
    mockedWishlistApi.getWishlistItems.mockResolvedValueOnce(new Promise(resolve => setTimeout(() => resolve(mockWishlistItems), 100)));

    render(
      <BrowserRouter>
        <WishlistPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading your wishlist.../i)).toBeInTheDocument();
    // Wait for the loading state to disappear
    await waitFor(() => expect(screen.queryByText(/Loading your wishlist.../i)).not.toBeInTheDocument());
  });

  // Test case 2: Error state
  test('displays error message if fetching wishlist fails', async () => {
    const errorMessage = 'Failed to fetch items.';
    mockedWishlistApi.getWishlistItems.mockRejectedValueOnce(new Error(errorMessage));

    render(
      <BrowserRouter>
        <WishlistPage />
      </BrowserRouter>
    );

    // Wait for the error to be displayed
    await waitFor(() => expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument());
    expect(screen.queryByText(/Loading your wishlist.../i)).not.toBeInTheDocument();
  });

  // Test case 3: Renders empty wishlist message
  test('displays empty wishlist message when there are no items', async () => {
    mockedWishlistApi.getWishlistItems.mockResolvedValueOnce([]);

    render(
      <BrowserRouter>
        <WishlistPage />
      </BrowserRouter>
    );

    // Wait for fetching to complete and empty message to appear
    await waitFor(() => expect(screen.getByText(/Your wishlist is empty./i)).toBeInTheDocument());
    expect(screen.queryByText(/Loading your wishlist.../i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Stylish T-Shirt/i)).not.toBeInTheDocument(); // Ensure items are not rendered
  });

  // Test case 4: Renders wishlist items correctly
  test('renders wishlist items correctly', async () => {
    render(
      <BrowserRouter>
        <WishlistPage />
      </BrowserRouter>
    );

    // Wait for items to be loaded
    await waitFor(() => expect(screen.getByText(mockWishlistItem1.name)).toBeInTheDocument());

    // Check if all items are rendered
    expect(screen.getByText(mockWishlistItem1.name)).toBeInTheDocument();
    expect(screen.getByText(`$${mockWishlistItem1.price.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByAltText(mockWishlistItem1.name)).toBeInTheDocument();

    expect(screen.getByText(mockWishlistItem2.name)).toBeInTheDocument();
    expect(screen.getByText(`$${mockWishlistItem2.price.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByAltText(mockWishlistItem2.name)).toBeInTheDocument();

    // Check if action buttons are present for each item
    expect(screen.getAllByRole('button', { name: /Move to Cart/i })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /Remove/i })).toHaveLength(2);
  });

  // Test case 5: Remove item functionality
  test('calls removeWishlistItem and updates UI when Remove button is clicked', async () => {
    // Mock window.confirm to return true (user confirms removal)
    jest.spyOn(window, 'confirm').mockImplementation(jest.fn(() => true));

    render(
      <BrowserRouter>
        <WishlistPage />
      </BrowserRouter>
    );

    // Wait for items to load
    await waitFor(() => expect(screen.getByText(mockWishlistItem1.name)).toBeInTheDocument());

    // Find and click the remove button for the first item
    const removeButton = screen.getByRole('button', { name: `Remove ${mockWishlistItem1.name} from wishlist` });
    fireEvent.click(removeButton);

    // Wait for the API call and state update to complete
    await waitFor(() => {
      expect(mockedWishlistApi.removeWishlistItem).toHaveBeenCalledTimes(1);
      expect(mockedWishlistApi.removeWishlistItem).toHaveBeenCalledWith(mockWishlistItem1.wishlistId);
    });

    // Check if the item is removed from the UI
    expect(screen.queryByText(mockWishlistItem1.name)).not.toBeInTheDocument();
    expect(screen.getByText(mockWishlistItem2.name)).toBeInTheDocument(); // Ensure other item is still there

    // Restore original confirm function
    jest.spyOn(window, 'confirm').mockRestore();
  });

  // Test case 6: Move to cart functionality
  test('calls moveWishlistItemToCart and removeWishlistItem when Move to Cart button is clicked', async () => {
    render(
      <BrowserRouter>
        <WishlistPage />
      </BrowserRouter>
    );

    // Wait for items to load
    await waitFor(() => expect(screen.getByText(mockWishlistItem1.name)).toBeInTheDocument());

    // Find and click the "Move to Cart" button for the first item
    const moveToCartButton = screen.getByRole('button', { name: `Move ${mockWishlistItem1.name} to cart` });
    fireEvent.click(moveToCartButton);

    // Wait for API calls and state update
    await waitFor(() => {
      expect(mockedWishlistApi.moveWishlistItemToCart).toHaveBeenCalledTimes(1);
      expect(mockedWishlistApi.moveWishlistItemToCart).toHaveBeenCalledWith(mockWishlistItem1.wishlistId);
      expect(mockedWishlistApi.removeWishlistItem).toHaveBeenCalledTimes(1);
      expect(mockedWishlistApi.removeWishlistItem).toHaveBeenCalledWith(mockWishlistItem1.wishlistId);
    });

    // Check if the item is removed from the UI
    expect(screen.queryByText(mockWishlistItem1.name)).not.toBeInTheDocument();
    expect(screen.getByText(mockWishlistItem2.name)).toBeInTheDocument(); // Ensure other item is still there
  });

  // Test case 7: Error handling for remove item
  test('displays error message when removing item fails', async () => {
    const removeErrorMessage = 'Failed to remove from API.';
    mockedWishlistApi.removeWishlistItem.mockRejectedValueOnce(new Error(removeErrorMessage));
    // Mock window.confirm to return true (user confirms removal)
    jest.spyOn(window, 'confirm').mockImplementation(jest.fn(() => true));

    render(
      <BrowserRouter>
        <WishlistPage />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText(mockWishlistItem1.name)).toBeInTheDocument());

    const removeButton = screen.getByRole('button', { name: `Remove ${mockWishlistItem1.name} from wishlist` });
    fireEvent.click(removeButton);

    // Wait for the error to be shown
    await waitFor(() => {
      expect(screen.getByText(`Error: Failed to remove item: ${removeErrorMessage}`)).toBeInTheDocument();
      // Ensure the item is still in the UI as the optimistic update would have failed, and an error was caught.
      // The fetchWishlist() would have been called within the error handler, so it should re-render.
      expect(screen.getByText(mockWishlistItem1.name)).toBeInTheDocument();
      expect(mockedWishlistApi.getWishlistItems).toHaveBeenCalledTimes(1); // It's called on error fallback
    });

    jest.spyOn(window, 'confirm').mockRestore();
  });

  // Test case 8: Error handling for move to cart
  test('displays error message when moving item to cart fails', async () => {
    const moveErrorMessage = 'Failed to move to cart.';
    mockedWishlistApi.moveWishlistItemToCart.mockRejectedValueOnce(new Error(moveErrorMessage));

    render(
      <BrowserRouter>
        <WishlistPage />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText(mockWishlistItem1.name)).toBeInTheDocument());

    const moveToCartButton = screen.getByRole('button', { name: `Move ${mockWishlistItem1.name} to cart` });
    fireEvent.click(moveToCartButton);

    // Wait for the error to be shown
    await waitFor(() => {
      expect(screen.getByText(`Error: Failed to move item to cart: ${moveErrorMessage}`)).toBeInTheDocument();
      // Ensure the item is still in the UI
      expect(screen.getByText(mockWishlistItem1.name)).toBeInTheDocument();
      expect(mockedWishlistApi.getWishlistItems).toHaveBeenCalledTimes(1); // It's called on error fallback
    });
  });
});
