// src/pages/WishlistPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import WishlistItem from '../components/WishlistItem'; // Import the new WishlistItem component
import { fetchWishlistItems, removeWishlistItem, moveWishlistItemToCart } from '../services/wishlistApi';
import type { Product } from '../types/product';

const WishlistPage: React.FC = () => {
  const { addItem } = useCart();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWishlist = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await fetchWishlistItems();
        setWishlistItems(items);
      } catch (err) {
        console.error("Failed to load wishlist:", err);
        setError("Could not load your wishlist. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const handleRemoveItem = async (productId: string) => {
    setError(null);
    try {
      await removeWishlistItem(productId);
      // Optimistically update UI or re-fetch
      setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
      console.log(`Item ${productId} removed from wishlist.`);
    } catch (err) {
      console.error("Failed to remove item from wishlist:", err);
      setError("Could not remove item. Please try again.");
    }
  };

  const handleMoveToCart = async (product: Product) => {
    setError(null);
    try {
      // Call the wishlist API to move item (this might also remove it from wishlist)
      await moveWishlistItemToCart(product.id);
      // Add item to cart context
      addItem(product);
      // Remove item from wishlist state after successful move to cart
      setWishlistItems(prevItems => prevItems.filter(item => item.id !== product.id));
      console.log(`Item ${product.id} moved to cart.`);
    } catch (err) {
      console.error("Failed to move item to cart:", err);
      setError("Could not move item to cart. Please try again.");
    }
  };

  return (
    <div className="wishlist-page" style={{ padding: '20px' }}>
      <h1>My Wishlist</h1>

      {isLoading && <p>Loading wishlist...</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!isLoading && !error && wishlistItems.length === 0 && (
        <p>Your wishlist is empty. <Link to="/">Start shopping!</Link></p>
      )}

      {!isLoading && !error && wishlistItems.length > 0 && (
        <div>
          {wishlistItems.map(item => (
            <WishlistItem
              key={item.id}
              product={item}
              onRemove={handleRemoveItem}
              onMoveToCart={handleMoveToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
