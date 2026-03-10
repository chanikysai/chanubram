// src/pages/OrderDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Order, OrderItem } from '../types/order';
import { getOrderById } from '../services/orderApi';

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('Order ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const orderData = await getOrderById(orderId);
        setOrder(orderData);
      } catch (err: any) {
        setError(`Failed to load order details. ${err.message}`);
        console.error(`Error fetching order ${orderId}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]); // Re-fetch if orderId changes

  const formattedDate = order ? new Date(order.date).toLocaleDateString() : '';

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/orders" style={{ textDecoration: 'none', color: '#007bff', marginBottom: '20px', display: 'block' }}>
        &larr; Back to Order History
      </Link>

      <h1>Order Details</h1>

      {loading && (
        <p>Loading order details...</p>
      )}

      {error && (
        <p style={{ color: 'red' }}>{error}</p>
      )}

      {!loading && !error && !order && (
        <p>Order not found.</p>
      )}

      {!loading && !error && order && (
        <div>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <strong>Order ID:</strong> #{order.id}
              </div>
              <div>
                <strong>Date:</strong> {formattedDate}
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Status:</strong> <span style={{ fontWeight: 'bold', color: getStatusColor(order.status) }}>{order.status}</span>
            </div>
            <div>
              <strong>Shipping Address:</strong> {order.shippingAddress}
            </div>
            <div>
              <strong>Payment Method:</strong> {order.paymentMethod}
            </div>
          </div>

          <h3>Items:</h3>
          {order.items.length === 0 ? (
            <p>No items in this order.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {order.items.map((item, index) => (
                <li key={index} style={{ borderBottom: '1px dashed #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    {item.quantity} x {item.name}
                  </div>
                  <div>
                    ${(item.quantity * item.price).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div style={{ marginTop: '30px', textAlign: 'right', borderTop: '2px solid #eee', paddingTop: '20px', fontSize: '1.1em' }}>
            <strong>Order Total:</strong> ${order.totalAmount.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};

import { getStatusColor } from '../utils/orderUtils';

export default OrderDetailPage;
