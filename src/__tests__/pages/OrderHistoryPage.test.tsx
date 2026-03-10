// src/__tests__/pages/OrderHistoryPage.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router, MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderHistoryPage from '../../pages/OrderHistoryPage';
import type { Order } from '../../types/order';

// Mock the API service
const mockGetOrderHistory = jest.fn();
jest.mock('../../services/orderApi', () => ({
  getOrderHistory: () => mockGetOrderHistory(),
}));

// Mock the OrderItem component to isolate OrderHistoryPage rendering
// However, since OrderItem is simple and already tested, rendering it directly might be fine.
// For this test, let's assume OrderItem renders correctly and focus on OrderHistoryPage logic.
// If OrderItem had complex dependencies or props that OrderHistoryPage manages, we might mock it.
// For now, we will let it render and rely on its own tests.

// Mock the Link component from react-router-dom for testing navigation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));


const mockOrders: Order[] = [
  {
    id: 'ord_001',
    date: new Date(Date.UTC(2026, 2, 1, 10, 30, 0)).toISOString(),
    totalAmount: 89.99,
    status: 'Delivered',
    items: [],
    shippingAddress: '',
    paymentMethod: '',
  },
  {
    id: 'ord_003',
    date: new Date(Date.UTC(2026, 2, 8, 9, 15, 0)).toISOString(),
    totalAmount: 75.00,
    status: 'Processing',
    items: [],
    shippingAddress: '',
    paymentMethod: '',
  },
];

describe('OrderHistoryPage Component', () => {
  // Clean up mocks after each test
  afterEach(() => {
    mockGetOrderHistory.mockReset();
  });

  // Test 1: Loading State - Verify loading message is displayed
  test('displays loading message while fetching orders', async () => {
    // Simulate a delay in API call
    mockGetOrderHistory.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <Router>
        <OrderHistoryPage />
      </Router>
    );

    expect(screen.getByText('Loading your orders...')).toBeInTheDocument();
    await waitFor(() => expect(mockGetOrderHistory).toHaveBeenCalledTimes(1));
  });

  // Test 2: Error State - Verify error message is displayed
  test('displays error message if fetching orders fails', async () => {
    const errorMessage = 'Failed to load order history. Please try again later.';
    mockGetOrderHistory.mockRejectedValue(new Error('API Error'));

    render(
      <Router>
        <OrderHistoryPage />
      </Router>
    );

    // Wait for the error message to appear
    await waitFor(() => expect(screen.getByText(errorMessage)).toBeInTheDocument());
    expect(screen.queryByText('Loading your orders...')).not.toBeInTheDocument();
  });

  // Test 3: No Orders State - Verify message when there are no orders
  test('displays message when user has no past orders', async () => {
    mockGetOrderHistory.mockResolvedValue([]); // Resolve with an empty array

    render(
      <Router>
        <OrderHistoryPage />
      </Router>
    );

    // Wait for the orders to be fetched and processed
    await waitFor(() => expect(mockGetOrderHistory).toHaveBeenCalledTimes(1));
    expect(screen.getByText('You have no past orders.')).toBeInTheDocument();
    expect(screen.queryByText('Loading your orders...')).not.toBeInTheDocument();
  });

  // Test 4: Orders Present State - Verify orders are rendered using OrderItem component
  test('renders a list of orders using OrderItem components', async () => {
    mockGetOrderHistory.mockResolvedValue(mockOrders);

    render(
      <Router>
        <OrderHistoryPage />
      </Router>
    );

    // Wait for the orders to be fetched and processed
    await waitFor(() => expect(mockGetOrderHistory).toHaveBeenCalledTimes(1));

    // Check if the loading and no orders messages are gone
    expect(screen.queryByText('Loading your orders...')).not.toBeInTheDocument();
    expect(screen.queryByText('You have no past orders.')).not.toBeInTheDocument();

    // Check if the correct number of OrderItem components are rendered
    // Each OrderItem has a link to the order detail page. Let's find those links.
    const orderLinks = screen.getAllByRole('link', { name: /Order #ord_/i });
    expect(orderLinks).toHaveLength(mockOrders.length);

    // Check specific details rendered by OrderItem within OrderHistoryPage context
    expect(screen.getByText('Order #ord_001')).toBeInTheDocument();
    expect(screen.getByText('3/1/2026')).toBeInTheDocument();
    expect(screen.getByText('$89.99')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();

    expect(screen.getByText('Order #ord_003')).toBeInTheDocument();
    expect(screen.getByText('3/8/2026')).toBeInTheDocument();
    expect(screen.getByText('$75.00')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });
});
