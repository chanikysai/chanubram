// src/services/wishlistApi.ts
// This file contains functions for interacting with the wishlist backend API.

import type { Product } from '../types/product';

// In a real application, these would be actual API calls (e.g., using fetch or axios).
// For now, we simulate API responses.

export const fetchWishlistItems = async (): Promise<Product[]> => {
  console.log('Simulating API call to fetch wishlist items...');
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 200));

  // Placeholder data - replace with actual fetch logic
  // This mock data should ideally be fetched from an API or retrieved from local storage if offline support is needed.
  // For demonstration purposes, we'll return an empty array or some predefined items.
  // In a real app, you'd fetch from: const response = await fetch('/api/wishlist');
  const mockWishlist: Product[] = [
    { id: 'wish-prod-1', name: 'Fancy Widget', price: 29.99, description: 'A very fancy widget.' },
    { id: 'wish-prod-2', name: 'Basic Gadget', price: 10.00, description: 'A simple, reliable gadget.' },
  ];
  return mockWishlist;
};

export const addWishlistItem = async (product: Product): Promise<void> => {
  console.log(`Simulating API call to add product ${product.id} to wishlist...`);
  await new Promise(resolve => setTimeout(resolve, 150));
  // In a real app: await fetch('/api/wishlist', { method: 'POST', body: JSON.stringify({ productId: product.id }) });
  console.log(`Product ${product.id} added to wishlist.`);
};

export const removeWishlistItem = async (productId: string): Promise<void> => {
  console.log(`Simulating API call to remove product ${productId} from wishlist...`);
  await new Promise(resolve => setTimeout(resolve, 150));
  // In a real app: await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' });
  console.log(`Product ${productId} removed from wishlist.`);
};

// This function would be used to move an item from wishlist to cart.
// It might involve removing from wishlist and adding to cart API calls.
// For now, it's a placeholder.
export const moveWishlistItemToCart = async (productId: string): Promise<void> => {
  console.log(`Simulating API call to move product ${productId} from wishlist to cart...`);
  await new Promise(resolve => setTimeout(resolve, 200));
  // In a real app, this could involve two steps:
  // 1. Remove from wishlist: await removeWishlistItem(productId);
  // 2. Add to cart: await addItemToCart(productId); // Assuming addItemToCart API exists
  console.log(`Product ${productId} moved to cart.`);
};
