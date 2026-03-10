// src/components/CartSummary.tsx - Updated to use Product type correctly
import React from 'react';
import { useCart } from '../context/CartContext';
import type { Product } from '../types/product'; // Import Product type

const CartSummary: React.FC = () => {
  const { cartItems } = useCart();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="cart-summary">
      <h2>Order Summary</h2>
      <p>Total Items: {totalItems}</p>
      <p>Total Price: ${totalPrice.toFixed(2)}</p>
    </div>
  );
};

export default CartSummary;
