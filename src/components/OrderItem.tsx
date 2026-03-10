// src/components/OrderItem.tsx
import React from 'react';
import type { Order } from '../types/order';
import { Link } from 'react-router-dom';

interface OrderItemProps {
  order: Order;
}

const OrderItem: React.FC<OrderItemProps> = ({ order }) => {
  const formattedDate = new Date(order.date).toLocaleDateString();

  return (
    <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px', backgroundColor: '#f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '1.1em', fontWeight: 'bold' }}>
          <Link to={`/orders/${order.id}`} style={{ textDecoration: 'none', color: '#007bff' }}>
            Order #{order.id}
          </Link>
        </div>
        <div style={{ color: '#555' }}>{formattedDate}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>${order.totalAmount.toFixed(2)}</div>
        <div style={{ marginTop: '5px', padding: '3px 8px', borderRadius: '4px', fontSize: '0.9em', color: 'white', backgroundColor: getStatusColor(order.status) }}>
          {order.status}
        </div>
      </div>
    </div>
  );
};

// Helper function to determine status color
const getStatusColor = (status: Order['status']): string => {
  switch (status) {
    case 'Processing': return '#FFA500'; // Orange
    case 'Shipped': return '#1E90FF'; // Dodger Blue
    case 'Delivered': return '#32CD32'; // Lime Green
    case 'Cancelled': return '#DC143C'; // Crimson
    default: return '#808080'; // Grey
  }
};

export default OrderItem;
