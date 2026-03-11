// src/services/wishlistApi.ts
import { Product } from '../types/product';
import { WishlistItem } from '../types/wishlist';

// Assuming these are your API endpoints
const API_BASE_URL = '/api'; // Use a relative path or configure a base URL

// Helper function to fetch data
const fetchWrapper = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorBody.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Function to get all wishlist items for the current user
export const getWishlistItems = async (): Promise<WishlistItem[]> => {
  console.log('API: Fetching wishlist items...');
  try {
    const items = await fetchWrapper<WishlistItem[]>(`${API_BASE_URL}/wishlist`);
    console.log(`API: Fetched ${items.length} wishlist items.`);
    return items;
  } catch (error) {
    console.error('API: Error fetching wishlist items:', error);
    // In a real app, you might want to return a default empty array or re-throw
    throw error;
  }
};

// Function to add a product to the wishlist
export const addWishlistItem = async (product: Product): Promise<WishlistItem> => {
  console.log(`API: Adding product ${product.id} to wishlist...`);
  if (!product.id) {
    throw new Error('Product ID is required to add to wishlist.');
  }
  try {
    const newItem = await fetchWrapper<WishlistItem>(`${API_BASE_URL}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: product.id }),
    });
    console.log(`API: Product ${product.id} added to wishlist with ID ${newItem.wishlistId}.`);
    return newItem;
  } catch (error) {
    console.error('API: Error adding product to wishlist:', error);
    throw error;
  }
};

// Function to remove an item from the wishlist by its wishlistId
export const removeWishlistItem = async (wishlistItemId: string): Promise<void> => {
  console.log(`API: Removing wishlist item ${wishlistItemId}...`);
  if (!wishlistItemId) {
    throw new Error('Wishlist item ID is required to remove item.');
  }
  try {
    await fetchWrapper<void>(`${API_BASE_URL}/wishlist/${wishlistItemId}`, {
      method: 'DELETE',
    });
    console.log(`API: Wishlist item ${wishlistItemId} removed successfully.`);
  } catch (error) {
    console.error('API: Error removing wishlist item:', error);
    throw error;
  }
};

// Function to move an item from wishlist to cart
export const moveWishlistItemToCart = async (wishlistItemId: string): Promise<void> => {
  console.log(`API: Moving wishlist item ${wishlistItemId} to cart...`);
  if (!wishlistItemId) {
    throw new Error('Wishlist item ID is required to move to cart.');
  }
  try {
    // This endpoint might also return the updated cart or success status
    await fetchWrapper<void>(`${API_BASE_URL}/wishlist/move-to-cart/${wishlistItemId}`, {
      method: 'POST',
      // No body needed if just passing ID in URL, but could be if product details are needed
    });
    console.log(`API: Wishlist item ${wishlistItemId} moved to cart successfully.`);
  } catch (error) {
    console.error('API: Error moving wishlist item to cart:', error);
    throw error;
  }
};
