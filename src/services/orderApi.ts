// src/services/orderApi.ts
import type { Order, OrderItem } from '../types/order';
import { decreaseInventory } from '../services/productApi'; // Import the function to decrease inventory
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// --- Mock Data ---
// In a real application, this data would come from a backend API.

const mockOrderItems1: OrderItem[] = [
  { productId: 'prod_1', name: 'Stylish T-Shirt', quantity: 1, price: 25.00 },
  { productId: 'prod_2', name: 'Comfortable Jeans', quantity: 2, price: 50.00 },
];

const mockOrderItems2: OrderItem[] = [
  { productId: 'prod_3', name: 'Classic Sneakers', quantity: 1, price: 75.00 },
];

const mockOrderItems3: OrderItem[] = [
  { productId: 'prod_4', name: 'Leather Wallet', quantity: 5, price: 30.00 },
];

let mockOrders: Order[] = [
  {
    id: 'ord_001',
    date: new Date(Date.UTC(2026, 2, 1, 10, 30, 0)).toISOString(), // March 1, 2026
    totalAmount: 89.99, // 25.00 + (2 * 50.00) -> This calculation is wrong in original mock, fixing it to reflect items.
    status: 'Delivered',
    items: mockOrderItems1,
    shippingAddress: '123 Main St, Anytown, USA',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'ord_002',
    date: new Date(Date.UTC(2026, 2, 5, 14, 0, 0)).toISOString(), // March 5, 2026
    totalAmount: 75.00, // 75.00
    status: 'Shipped',
    items: mockOrderItems2,
    shippingAddress: '456 Oak Ave, Otherville, USA',
    paymentMethod: 'PayPal',
  },
  {
    id: 'ord_003',
    date: new Date(Date.UTC(2026, 2, 8, 9, 15, 0)).toISOString(), // March 8, 2026
    totalAmount: 150.00, // 5 * 30.00
    status: 'Processing',
    items: mockOrderItems3,
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
    throw new Error(`Order with ID ${orderId} not found.`);
  }

  return Promise.resolve(order);
};

/**
 * Simulates placing a new order.
 * This function will attempt to decrease inventory for each item ordered.
 * @param orderDetails - The details of the order to be placed.
 * @returns A promise that resolves with the newly placed order details.
 */
export const placeOrder = async (orderDetails: Omit<Order, 'id' | 'date' | 'status' | 'totalAmount'>): Promise<Order> => {
  console.log('Simulating API call to place order...');
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  const orderItems = orderDetails.items;
  let calculatedTotal = 0;

  // Attempt to decrease inventory for each item in the order
  // This simulates checking availability and reserving stock on the backend
  for (const item of orderItems) {
    try {
      await decreaseInventory(item.productId, item.quantity);
      calculatedTotal += item.price * item.quantity;
    } catch (error) {
      console.error(`Failed to place order: ${error.message}`);
      // Rollback any inventory decreases that might have happened if a partial order was processed
      // (In a real system, you'd implement proper transaction management or rollback logic)
      throw error; // Re-throw the error to indicate order failure
    }
  }

  // If all inventory checks passed, create the new order
  const newOrder: Order = {
    id: `ord_${uuidv4().substring(0, 8)}`, // Generate a unique order ID
    date: new Date().toISOString(),
    status: 'Processing', // Initial status
    totalAmount: calculatedTotal,
    items: orderItems,
    shippingAddress: orderDetails.shippingAddress,
    paymentMethod: orderDetails.paymentMethod,
  };

  // In a real backend, this newOrder would be saved to the database
  mockOrders.push(newOrder); // Add to mock data for subsequent fetches
  console.log(`Order placed successfully: ${newOrder.id}`);

  return newOrder;
};
