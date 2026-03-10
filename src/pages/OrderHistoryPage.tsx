// src/pages/OrderHistoryPage.tsx
import React, { useState, useEffect } from 'react';
import OrderSummaryItem from '../components/OrderSummaryItem';
import type { Order } from '../types/order';
import { getOrderHistory } from '../services/orderApi';

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const orderData = await getOrderHistory();
        setOrders(orderData);
      } catch (err: any) {
        setError('Failed to load order history. Please try again later.');
        console.error('Error fetching order history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Order History</h1>

      {loading && (
        <p>Loading your orders...</p>
      )}

      {error && (
        <p style={{ color: 'red' }}>{error}</p>
      )}

      {!loading && !error && orders.length === 0 && (
        <p>You have no past orders.</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="order-list">
          {orders.map(order => (
            <OrderSummaryItem key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
