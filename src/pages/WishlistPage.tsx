import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import WishlistItemComponent from '../components/WishlistItem'; // Import the WishlistItem component
import { WishlistItem } from '../types/wishlist'; // Import the WishlistItem type
import { getWishlistItems, removeWishlistItem, moveWishlistItemToCart } from '../services/wishlistApi'; // Import wishlist API functions
import './WishlistPage.css'; // Assuming CSS for styling

const WishlistPage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch wishlist items on component mount
  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getWishlistItems();
      setWishlistItems(items);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch wishlist.');
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Handler for removing an item from the wishlist
  const handleRemoveItem = async (wishlistItemId: string) => {
    if (window.confirm('Are you sure you want to remove this item from your wishlist?')) {
      try {
        await removeWishlistItem(wishlistItemId);
        // Optimistically update state or re-fetch
        setWishlistItems(prevItems => prevItems.filter(item => item.wishlistId !== wishlistItemId));
        // In a real app, you might want a more robust state update or confirmation
      } catch (err: any) {
        setError(`Failed to remove item: ${err.message}`);
        // Optionally re-fetch to get the correct state if optimistic update failed
        fetchWishlist();
      }
    }
  };

  // Handler for moving an item from wishlist to cart
  const handleMoveToCart = async (item: WishlistItem) => {
    // You might want to check inventory here if it's not handled by the API,
    // or display a confirmation message.
    try {
      await moveWishlistItemToCart(item.wishlistId);
      // After moving to cart, remove it from wishlist
      await removeWishlistItem(item.wishlistId); // Ensure it's removed from wishlist too
      setWishlistItems(prevItems => prevItems.filter(wishItem => wishItem.wishlistId !== item.wishlistId));
      // Optionally navigate to the cart page or show a success message
      // For now, we'll just update the state and assume the cart API call was successful.
      console.log(`Item ${item.name} moved to cart and removed from wishlist.`);
      // Navigate to cart if desired
      // navigate('/cart');
    } catch (err: any) {
      setError(`Failed to move item to cart: ${err.message}`);
      // Optionally re-fetch to get the correct state
      fetchWishlist();
    }
  };

  // Render loading state
  if (loading) {
    return <div className="wishlist-page__loading">Loading your wishlist...</div>;
  }

  // Render error state
  if (error) {
    return <div className="wishlist-page__error">Error: {error}</div>;
  }

  return (
    <div className="wishlist-page">
      <header className="wishlist-page__header">
        <h1>My Wishlist</h1>
      </header>

      <div className="wishlist-page__content">
        {wishlistItems.length > 0 ? (
          wishlistItems.map(item => (
            <WishlistItemComponent
              key={item.wishlistId} // Use wishlistId for unique key
              item={item}
              onRemove={handleRemoveItem}
              onMoveToCart={handleMoveToCart}
            />
          ))
        ) : (
          <p className="wishlist-page__empty">Your wishlist is empty. Start adding products!</p>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
