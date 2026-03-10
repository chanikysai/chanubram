// src/pages/CartPage.tsx
import React from 'react';
import { useCart } from '../context/CartContext';
import CartItemComponent from '../components/CartItem';
import CartSummary from '../components/CartSummary';

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem } = useCart();

  return (
    <div className="cart-page" style={{ padding: '20px', maxWidth: '960px', margin: '0 auto' }}>
      <h1>Shopping Cart</h1>
      {items.length === 0 ? (
        <p>Your shopping cart is currently empty. Why not add some products?</p>
      ) : (
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 2 }}>
            {items.map(item => (
              <CartItemComponent
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <CartSummary items={items} />
            {/* Add a "Proceed to Checkout" button or similar here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
