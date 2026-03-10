// src/components/CartItem.tsx
import React from 'react';
import { Product } from '../types/product';
import { CartItem } from '../context/CartContext';

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

const CartItemComponent: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const handleIncrease = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrease = () => {
    onUpdateQuantity(item.id, item.quantity - 1);
  };

  const handleRemove = () => {
    onRemove(item.id);
  };

  return (
    <div className="cart-item" style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h3>{item.name}</h3>
        <p>Price: ${item.price.toFixed(2)}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button onClick={handleDecrease} style={{ marginRight: '5px' }}>-</button>
        <span style={{ margin: '0 10px', fontWeight: 'bold' }}>{item.quantity}</span>
        <button onClick={handleIncrease} style={{ marginRight: '5px' }}>+</button>
        <button onClick={handleRemove} style={{ backgroundColor: '#f8d7da', color: '#721c24', border: 'none', padding: '5px 10px', borderRadius: '3px' }}>Remove</button>
      </div>
    </div>
  );
};

export default CartItemComponent;
