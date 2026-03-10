// src/components/OrderItem.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { Order } from '../types/order';

interface OrderItemProps {
  order: Order;
}

const OrderItem: React.FC<OrderItemProps> = ({ order }) => {
  const formattedDate = new Date(order.date).toLocaleDateString(); // Format date for display

  return (
    <div className="order-item" style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <strong>Order ID:</strong> #{order.id}
        </div>
        <div>
          <strong>Date:</strong> {formattedDate}
        </div>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong> <span style={{ fontWeight: 'bold', color: getStatusColor(order.status) }}>{order.status}</span>
      </div>
      <div>
        <strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}
      </div>
      <div style={{ marginTop: '15px', textAlign: 'right' }}>
        <Link to={`/orders/${order.id}`} style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>
          View Details
        </Link>
      </div>
    </div>
  );
};

// Helper function to determine status color
const getStatusColor = (status: Order['status']): string => {
  switch (status) {
    case 'Processing':
      return '#FFA500'; // Orange
    case 'Shipped':
      return '#1E90FF'; // Dodger Blue
    case 'Delivered':
      return '#32CD32'; // Lime Green
    case 'Cancelled':
      return '#DC143C'; // Crimson
    default:
      return '#808080'; // Grey
  }
};

export default OrderItem;
