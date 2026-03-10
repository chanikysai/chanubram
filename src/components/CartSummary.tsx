// src/components/CartSummary.tsx
import React from 'react';
import { CartItem } from '../context/CartContext';

interface CartSummaryProps {
  items: CartItem[];
}

const CartSummary: React.FC<CartSummaryProps> = ({ items }) => {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="cart-summary" style={{ border: '1px solid #ddd', padding: '20px', margin: '20px 0', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Order Summary</h2>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>{item.name} ({item.quantity}x)</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px', fontWeight: 'bold', fontSize: '1.1em', display: 'flex', justifyContent: 'space-between' }}>
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default CartSummary;
