// src/services/orderApi.ts
import type { Order, OrderItem } from '../types/order';

// --- Mock Data ---
// In a real application, this data would come from a backend API.

const mockOrderItems1: OrderItem[] = [
  { productId: 'p1', name: 'Awesome Gadget', quantity: 1, price: 49.99 },
  { productId: 'p2', name: 'Super Widget', quantity: 2, price: 19.50 },
];

const mockOrderItems2: OrderItem[] = [
  { productId: 'p3', name: 'Mega Tool', quantity: 1, price: 120.00 },
];

const mockOrders: Order[] = [
  {
    id: 'ord_001',
    date: new Date(Date.UTC(2026, 2, 1, 10, 30, 0)).toISOString(), // March 1, 2026
    totalAmount: 89.99, // 49.99 + (2 * 19.50)
    status: 'Delivered',
    items: mockOrderItems1,
    shippingAddress: '123 Main St, Anytown, USA',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'ord_002',
    date: new Date(Date.UTC(2026, 2, 5, 14, 0, 0)).toISOString(), // March 5, 2026
    totalAmount: 120.00,
    status: 'Shipped',
    items: mockOrderItems2,
    shippingAddress: '456 Oak Ave, Otherville, USA',
    paymentMethod: 'PayPal',
  },
  {
    id: 'ord_003',
    date: new Date(Date.UTC(2026, 2, 8, 9, 15, 0)).toISOString(), // March 8, 2026
    totalAmount: 75.00,
    status: 'Processing',
    items: [
      { productId: 'p4', name: 'Mini Gizmo', quantity: 5, price: 15.00 },
    ],
    shippingAddress: '789 Pine Ln, Somewhere, USA',
    paymentMethod: 'Credit Card',
  },
];

// --- API Functions ---

/**
 * Simulates fetching the user's order history.
 * @returns A promise that resolves to an array of orders.
 */
export const getOrderHistory = async (): Promise<Order[]> => {
  console.log('Simulating API call to fetch order history...');
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // In a real application:
  // const response = await fetch('/api/orders');
  // if (!response.ok) {
  //   throw new Error('Failed to fetch order history');
  // }
  // return response.json();

  // Return mock data
  return Promise.resolve(mockOrders);
};

/**
 * Simulates fetching details for a specific order.
 * @param orderId The ID of the order to fetch.
 * @returns A promise that resolves to a single order.
 */
export const getOrderById = async (orderId: string): Promise<Order> => {
  console.log(`Simulating API call to fetch order details for ID: ${orderId}`);
  await new Promise(resolve => setTimeout(resolve, 500));

  const order = mockOrders.find(o => o.id === orderId);

  if (!order) {
    // In a real application:
    // const response = await fetch(`/api/orders/${orderId}`);
    // if (!response.ok) {
    //   if (response.status === 404) {
    //     throw new Error(`Order with ID ${orderId} not found`);
    //   }
    //   throw new Error(`Failed to fetch order ${orderId}`);
    // }
    // return response.json();

    // For mock data:
    throw new Error(`Order with ID ${orderId} not found.`);
  }

  return Promise.resolve(order);
};
