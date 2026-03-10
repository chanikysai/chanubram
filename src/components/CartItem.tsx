// src/components/CartItem.tsx - Updated to use Product type correctly
import React from 'react';
import { useCart } from '../context/CartContext';
import type { Product } from '../types/product';

interface CartItemProps {
  item: {
    product: Product;
    quantity: number;
  };
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(item.product.id, newQuantity);
    } else {
      removeItem(item.product.id);
    }
  };

  const handleRemove = () => {
    removeItem(item.product.id);
  };

  return (
    <div className="cart-item">
      <div className="item-details">
        <h3>{item.product.name}</h3>
        <p>${item.product.price.toFixed(2)} each</p>
      </div>
      <div className="item-controls">
        <button onClick={() => handleQuantityChange(item.quantity - 1)}>-</button>
        <span>{item.quantity}</span>
        <button onClick={() => handleQuantityChange(item.quantity + 1)}>+</button>
        <button onClick={handleRemove}>Remove</button>
      </div>
      <div className="item-subtotal">
        Subtotal: ${(item.product.price * item.quantity).toFixed(2)}
      </div>
    </div>
  );
};

export default CartItem;
