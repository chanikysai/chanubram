
// src/pages/WishlistPage.tsx
import React, { useState, useEffect, useContext } from 'react';
import WishlistItem from '../components/WishlistItem';
import { getWishlist, removeFromWishlist } from '../services/wishlistApi';
import type { Product } from '../types/product';
import type { WishlistItem as WishlistItemType } from '../types/wishlist';
import { CartContext } from '../context/CartContext'; // Assuming CartContext is exported

// Mock userId for now. In a real app, this would come from an authentication context.
// It's crucial to have a way to get the current user's ID.
const MOCK_USER_ID = 'current-user-123';

const WishlistPage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Assume CartContext provides an addItem function that takes a Product object
  const { addItem } = useContext(CartContext);

  useEffect(() => {
    const fetchWishlistData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch wishlist items using the API service
        const items = await getWishlist(MOCK_USER_ID);
        // Ensure items conform to WishlistItemType. The API response should match this.
        // The WishlistItemType already extends Product and adds wishlistId and addedAt.
        setWishlistItems(items);
      } catch (err: any) {
        // Set an error message if fetching fails
        setError('Failed to load your wishlist. Please try again later.');
        console.error('Error fetching wishlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistData();
  }, []); // Empty dependency array ensures this effect runs once on component mount.

  const handleRemoveItem = async (wishlistItemId: string) => {
    // Confirmation dialog for critical actions like removal
    if (!window.confirm('Are you sure you want to remove this item from your wishlist?')) {
      return;
    }
    try {
      // Call the API to remove the item from the wishlist
      await removeFromWishlist(MOCK_USER_ID, wishlistItemId);
      // Update local state by filtering out the removed item
      setWishlistItems(prevItems => prevItems.filter(item => item.wishlistId !== wishlistItemId));
    } catch (err) {
      setError('Failed to remove item. Please try again.');
      console.error('Error removing item from wishlist:', err);
    }
  };

  const handleMoveToCart = async (item: WishlistItemType) => {
    try {
      // Prepare the product object for addItem.
      // WishlistItemType extends Product, so we can directly use its properties.
      const productToAdd: Product = {
        id: item.id, // Assuming item.id is the productId
        name: item.name,
        price: item.price,
        description: item.description, // Include description if available
        imageUrl: item.imageUrl, // Assuming imageUrl is part of Product or WishlistItem
      };

      // Add the product to the cart using the context function
      addItem(productToAdd);

      // Optionally, remove the item from wishlist after successfully adding to cart
      // This provides a smoother UX if the backend supports it atomically.
      await removeFromWishlist(MOCK_USER_ID, item.wishlistId);
      setWishlistItems(prevItems => prevItems.filter(i => i.wishlistId !== item.wishlistId));
    } catch (err) {
      setError('Failed to move item to cart. Please check your connection or try again.');
      console.error('Error moving item to cart:', err);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6 text-center text-gray-500">Loading your wishlist...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800 text-center">My Wishlist</h1>
      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">Your wishlist is currently empty.</p>
          <p className="text-gray-500">Start exploring and add your favorite products!</p>
          {/* Optional: Link to products page */}
          {/* <Link to="/products" className="text-blue-600 hover:underline">Go to Products</Link> */}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {wishlistItems.map((item) => (
            <WishlistItem
              key={item.wishlistId} // Use the unique wishlist item ID for the key
              item={item}
              onRemove={handleRemoveItem}
              onAddToCart={handleMoveToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
