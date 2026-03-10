// src/pages/CartPage.tsx - Updated to use Product type correctly
import React from 'react';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import { useCart } from '../context/CartContext';
import type { Product } from '../types/product'; // Import Product type

const CartPage: React.FC = () => {
  const { cartItems, clearCart } = useCart();

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>
          <CartSummary />
          <button onClick={clearCart} className="clear-cart-button">
            Clear Cart
          </button>
        </>
      )}
    </div>
  );
};

export default CartPage;
