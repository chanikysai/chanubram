
// src/services/wishlistApi.ts
// Mock API endpoint URL
const WISHLIST_API_URL = '/api/wishlist';

// Helper function to simulate API calls and handle responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
  }
  return response.json();
};

/**
 * Fetches the user's wishlist.
 * @param userId - The ID of the user whose wishlist to fetch.
 * @returns A Promise that resolves to an array of WishlistItem objects.
 */
export const getWishlist = async (userId: string) => {
  try {
    const response = await fetch(`${WISHLIST_API_URL}/${userId}`);
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching wishlist for user ${userId}:`, error);
    throw error; // Re-throw to be handled by the caller
  }
};

/**
 * Adds a product to the user's wishlist.
 * @param userId - The ID of the user.
 * @param productId - The ID of the product to add.
 * @returns A Promise that resolves to the updated wishlist or a success message.
 */
export const addToWishlist = async (userId: string, productId: string) => {
  try {
    const response = await fetch(`${WISHLIST_API_URL}/${userId}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error adding product ${productId} to wishlist for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Removes a product from the user's wishlist.
 * @param userId - The ID of the user.
 * @param wishlistId - The unique ID of the wishlist item to remove.
 * @returns A Promise that resolves to the updated wishlist or a success message.
 */
export const removeFromWishlist = async (userId: string, wishlistId: string) => {
  try {
    const response = await fetch(`${WISHLIST_API_URL}/${userId}/remove/${wishlistId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error removing wishlist item ${wishlistId} for user ${userId}:`, error);
    throw error;
  }
};
