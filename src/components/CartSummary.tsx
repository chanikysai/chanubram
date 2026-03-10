// src/components/CartSummary.tsx
import React from 'react';
import { CartItem } from '../context/CartContext';

interface CartSummaryProps {
  items: CartItem[];
  total: number; // Added for the final calculated total
  discountAmount?: number; // Added for the applied discount
  couponMessage?: string; // Added for displaying coupon success/failure messages
}

const CartSummary: React.FC<CartSummaryProps> = ({ items, total, discountAmount = 0, couponMessage }) => {
  // Calculate subtotal based on items, independent of the total prop which might include discounts
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="cart-summary" style={{ border: '1px solid #ddd', padding: '20px', margin: '20px 0', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Order Summary</h2>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {/* Display individual item subtotals */}
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>{item.name} ({item.quantity}x)</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          {/* Display Subtotal */}
          <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {/* Display Discount if applicable */}
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'green', fontWeight: 'bold' }}>
              <span>Discount Applied:</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          
          {/* Display Coupon Message if provided */}
          {couponMessage && (
            <p style={{ fontSize: '0.9em', color: discountAmount > 0 ? 'green' : 'red', marginTop: '5px' }}>
              {couponMessage}
            </p>
          )}

          {/* Display Final Total */}
          <div style={{ marginTop: '20px', borderTop: '2px solid #ccc', paddingTop: '15px', fontWeight: 'bold', fontSize: '1.2em', display: 'flex', justifyContent: 'space-between' }}>
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default CartSummary;

