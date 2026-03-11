import { getWishlistItems, addWishlistItem, removeWishlistItem, moveWishlistItemToCart } from '../../src/services/wishlistApi';
import { WishlistItem } from '../../src/types/wishlist';
import { Product } from '../../src/types/product';

// Mock the global fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock data
const mockProduct: Product = {
  id: 'prod_1',
  name: 'Stylish T-Shirt',
  description: 'A comfortable and stylish t-shirt.',
  price: 25.00,
  imageUrl: '/images/product1.jpg',
  inventory: 50,
};

const mockWishlistItem: WishlistItem = {
  ...mockProduct,
  wishlistId: 'wish_abc',
  addedAt: '2023-10-27T10:00:00Z',
};

const mockWishlistItems: WishlistItem[] = [mockWishlistItem, {
  ...mockProduct,
  id: 'prod_2',
  wishlistId: 'wish_def',
  name: 'Comfortable Jeans',
  price: 50.00,
  addedAt: '2023-10-27T11:00:00Z',
}];

describe('wishlistApi', () => {
  beforeEach(() => {
    // Clear any previous calls to mockFetch
    mockFetch.mockClear();
  });

  // Test for getWishlistItems
  describe('getWishlistItems', () => {
    test('should fetch wishlist items successfully', async () => {
      // Mock a successful fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWishlistItems,
      });

      const items = await getWishlistItems();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/wishlist');
      expect(items).toEqual(mockWishlistItems);
    });

    test('should throw an error if fetch fails', async () => {
      // Mock a failed fetch response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      });

      await expect(getWishlistItems()).rejects.toThrow('Server error');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/wishlist');
    });

    test('should throw a generic error if json parsing fails on error response', async () => {
      // Mock a failed fetch response with no JSON body
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('JSON parsing error'); }, // Simulate an error during json parsing
      });

      await expect(getWishlistItems()).rejects.toThrow('HTTP error! status: 500');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/wishlist');
    });
  });

  // Test for addWishlistItem
  describe('addWishlistItem', () => {
    test('should add a product to wishlist successfully', async () => {
      // Mock a successful fetch response for POST
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWishlistItem, // API returns the newly created item
      });

      const newItem = await addWishlistItem(mockProduct);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: mockProduct.id }),
      });
      expect(newItem).toEqual(mockWishlistItem);
    });

    test('should throw an error if product ID is missing', async () => {
      const productWithoutId: Product = { ...mockProduct, id: '' };
      await expect(addWishlistItem(productWithoutId)).rejects.toThrow('Product ID is required to add to wishlist.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    test('should throw an error if fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Product already in wishlist' }),
      });

      await expect(addWishlistItem(mockProduct)).rejects.toThrow('Product already in wishlist');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/wishlist', expect.any(Object));
    });
  });

  // Test for removeWishlistItem
  describe('removeWishlistItem', () => {
    test('should remove a wishlist item successfully', async () => {
      // Mock a successful fetch response for DELETE
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // DELETE requests often return empty body on success
      });

      await removeWishlistItem(mockWishlistItem.wishlistId);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(`/api/wishlist/${mockWishlistItem.wishlistId}`, {
        method: 'DELETE',
      });
    });

    test('should throw an error if wishlist item ID is missing', async () => {
      await expect(removeWishlistItem('')).rejects.toThrow('Wishlist item ID is required to remove item.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    test('should throw an error if fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Wishlist item not found' }),
      });

      await expect(removeWishlistItem(mockWishlistItem.wishlistId)).rejects.toThrow('Wishlist item not found');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(`/api/wishlist/${mockWishlistItem.wishlistId}`, expect.any(Object));
    });
  });

  // Test for moveWishlistItemToCart
  describe('moveWishlistItemToCart', () => {
    test('should move a wishlist item to cart successfully', async () => {
      // Mock a successful fetch response for POST
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }), // Assuming API returns a success object
      });

      await moveWishlistItemToCart(mockWishlistItem.wishlistId);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(`/api/wishlist/move-to-cart/${mockWishlistItem.wishlistId}`, {
        method: 'POST',
      });
    });

    test('should throw an error if wishlist item ID is missing', async () => {
      await expect(moveWishlistItemToCart('')).rejects.toThrow('Wishlist item ID is required to move to cart.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    test('should throw an error if fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ message: 'Cannot move item, insufficient stock in cart' }),
      });

      await expect(moveWishlistItemToCart(mockWishlistItem.wishlistId)).rejects.toThrow('Cannot move item, insufficient stock in cart');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(`/api/wishlist/move-to-cart/${mockWishlistItem.wishlistId}`, expect.any(Object));
    });
  });
});
