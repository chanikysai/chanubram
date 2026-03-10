// src/components/WishlistItem.tsx
import React from 'react';
import type { Product } from '../types/product';

interface WishlistItemProps {
  product: Product;
  onRemove: (productId: string) => void;
  onMoveToCart: (product: Product) => void;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ product, onRemove, onMoveToCart }) => {
  return (
    <div className="wishlist-item" style={{ border: '1px solid #eee', padding: '10px', margin: '10px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h4>{product.name}</h4>
        <p>${product.price.toFixed(2)}</p>
      </div>
      <div>
        <button onClick={() => onMoveToCart(product)} style={{ marginRight: '5px' }}>
          Add to Cart
        </button>
        <button onClick={() => onRemove(product.id)}>
          Remove
        </button>
      </div>
    </div>
  );
};

export default WishlistItem;
