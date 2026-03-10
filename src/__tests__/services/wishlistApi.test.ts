
// src/__tests__/services/wishlistApi.test.ts
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/wishlistApi';

// Mock the fetch API
global.fetch = jest.fn();

// Define mock data and responses
const mockUserId = 'user-123';
const mockProductId1 = 'prod-abc';
const mockProductId2 = 'prod-def';

const mockWishlistItem1 = {
  wishlistId: 'wish-1', // Unique ID for the wishlist entry
  productId: mockProductId1,
  userId: mockUserId,
  addedAt: new Date().toISOString(),
  name: 'Sample Product 1',
  price: 10.99,
  imageUrl: '/images/prod1.jpg',
};

const mockWishlistItem2 = {
  wishlistId: 'wish-2',
  productId: mockProductId2,
  userId: mockUserId,
  addedAt: new Date().toISOString(),
  name: 'Sample Product 2',
  price: 25.50,
  imageUrl: '/images/prod2.jpg',
};

const mockWishlist = [mockWishlistItem1, mockWishlistItem2];

describe('wishlistApi', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    (global.fetch as jest.Mock).mockClear();
  });

  // Happy Path Test for getWishlist
  test('getWishlist should fetch and return wishlist items', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockWishlist,
    });

    const wishlist = await getWishlist(mockUserId);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(`/api/wishlist/${mockUserId}`);
    expect(wishlist).toEqual(mockWishlist);
  });

  // Edge Case Test for getWishlist (empty wishlist)
  test('getWishlist should return an empty array if wishlist is empty', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const wishlist = await getWishlist(mockUserId);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(wishlist).toEqual([]);
  });

  // Error Handling Test for getWishlist
  test('getWishlist should throw an error if API call fails', async () => {
    const errorStatus = 500;
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: errorStatus,
      text: async () => 'Internal Server Error',
    });

    await expect(getWishlist(mockUserId)).rejects.toThrow(`HTTP error! status: ${errorStatus}`);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  // Happy Path Test for addToWishlist
  test('addToWishlist should add an item and return updated list', async () => {
    const newWishlistItem = {
      wishlistId: 'wish-3',
      productId: 'prod-new',
      userId: mockUserId,
      addedAt: new Date().toISOString(),
      name: 'New Product',
      price: 50.00,
      imageUrl: '/images/newprod.jpg',
    };
    const updatedWishlist = [...mockWishlist, newWishlistItem];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedWishlist,
    });

    const result = await addToWishlist(mockUserId, 'prod-new');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(`/api/wishlist/${mockUserId}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'prod-new' }),
    });
    expect(result).toEqual(updatedWishlist);
  });

  // Error Handling Test for addToWishlist
  test('addToWishlist should throw an error if API call fails', async () => {
    const errorStatus = 400;
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: errorStatus,
      text: async () => 'Bad Request',
    });

    await expect(addToWishlist(mockUserId, mockProductId1)).rejects.toThrow(`HTTP error! status: ${errorStatus}`);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  // Happy Path Test for removeFromWishlist
  test('removeFromWishlist should remove an item and return updated list', async () => {
    const updatedWishlist = [mockWishlistItem1]; // Simulate removing mockWishlistItem2
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedWishlist,
    });

    const result = await removeFromWishlist(mockUserId, mockWishlistItem2.wishlistId);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(`/api/wishlist/${mockUserId}/remove/${mockWishlistItem2.wishlistId}`);
    expect(result).toEqual(updatedWishlist);
  });

  // Edge Case Test for removeFromWishlist (item not found)
  test('removeFromWishlist should still succeed if item not found (server returns 200)', async () => {
    const updatedWishlist = [mockWishlistItem1]; // If item 2 was already gone
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedWishlist,
    });

    const result = await removeFromWishlist(mockUserId, 'non-existent-wish-id');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual(updatedWishlist); // Assuming API returns remaining items
  });

  // Error Handling Test for removeFromWishlist
  test('removeFromWishlist should throw an error if API call fails', async () => {
    const errorStatus = 404;
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: errorStatus,
      text: async () => 'Not Found',
    });

    await expect(removeFromWishlist(mockUserId, mockWishlistItem1.wishlistId)).rejects.toThrow(`HTTP error! status: ${errorStatus}`);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
