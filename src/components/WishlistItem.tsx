
// src/components/WishlistItem.tsx
import React from 'react';
import type { Product } from '../types/product';
import type { WishlistItem as WishlistItemType } from '../types/wishlist';

interface WishlistItemProps {
  item: WishlistItemType;
  onRemove: (wishlistItemId: string) => void;
  onAddToCart: (product: Product) => void;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ item, onRemove, onAddToCart }) => {
  const handleRemoveClick = () => {
    onRemove(item.wishlistId); // Pass the wishlist item's unique ID for removal
  };

  const handleAddToCartClick = () => {
    // Create a Product object from the item details.
    // The WishlistItemType extends Product, so we can directly use its properties.
    const productToAdd: Product = {
      id: item.id, // Assuming item.id is the productId
      name: item.name,
      price: item.price,
      description: item.description, // Include description if available
      imageUrl: item.imageUrl, // Assuming imageUrl is part of Product or WishlistItem
    };
    onAddToCart(productToAdd);
  };

  return (
    <div className="wishlist-item flex items-center p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
      <img
        src={item.imageUrl || '/placeholder-image.png'}
        alt={item.name}
        className="w-20 h-20 object-cover mr-6 rounded-md shadow-sm"
      />
      <div className="flex-grow">
        <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
        <p className="text-gray-600">${item.price.toFixed(2)}</p>
        {item.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
        )}
      </div>
      <div className="flex items-center space-x-3 ml-6">
        <button
          onClick={handleAddToCartClick}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 ease-in-out flex items-center"
          aria-label={`Add ${item.name} to cart`}
        >
          Add to Cart
        </button>
        <button
          onClick={handleRemoveClick}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 ease-in-out flex items-center"
          aria-label={`Remove ${item.name} from wishlist`}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default WishlistItem;
