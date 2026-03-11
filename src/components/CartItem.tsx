// src/components/CartItem.tsx
import React from 'react';
import { CartItem } from '../context/CartContext';

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

const CartItemComponent: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(event.target.value, 10);
    if (!isNaN(newQuantity)) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    } else {
      // If quantity is 1 and user decrements, remove the item
      onRemove(item.id);
    }
  };

  const handleRemove = () => {
    onRemove(item.id);
  };

  return (
    <div className="cart-item" style={{ display: 'flex', alignItems: 'center', border: '1px solid #eee', padding: '15px', margin: '10px 0', borderRadius: '5px', backgroundColor: '#fff' }}>
      {/* Placeholder for Image - In a real app, you'd fetch/display the product image */}
      <div style={{ flex: 1, marginRight: '15px', width: '80px', height: '80px', backgroundColor: '#e0e0e0', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666' }}>
        [Img]
      </div>
      
      <div style={{ flex: 3, marginRight: '15px' }}>
        <h4 style={{ margin: 0, fontSize: '1.1em' }}>{item.name}</h4>
        <p style={{ margin: '5px 0', color: '#555' }}>${item.price.toFixed(2)} each</p>
      </div>

      <div style={{ flex: 2, display: 'flex', alignItems: 'center', marginRight: '15px' }}>
        <button onClick={handleDecrement} style={{ padding: '5px 10px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>-</button>
        <input
          type="number"
          value={item.quantity}
          onChange={handleQuantityChange}
          min="1"
          style={{ width: '50px', padding: '5px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px' }}
          aria-label={`Quantity for ${item.name}`}
        />
        <button onClick={handleIncrement} style={{ padding: '5px 10px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' }}>+</button>
      </div>

      <div style={{ flex: 1, textAlign: 'right' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</p>
        <button onClick={handleRemove} style={{ marginTop: '5px', padding: '5px 10px', backgroundColor: '#f8d7da', color: '#721c24', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItemComponent;