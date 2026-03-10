// src/__tests__/pages/OrderHistoryPage.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderHistoryPage from '../../pages/OrderHistoryPage';
import { getOrderHistory } from '../../services/orderApi';
import type { Order } from '../../types/order';

// Mock the API call
jest.mock('../../services/orderApi');

// Cast the mocked function for type safety
const mockGetOrderHistory = getOrderHistory as jest.MockedFunction<typeof getOrderHistory>;

// Mock order data
const mockOrders: Order[] = [
  {
    id: 'ord_001',
    date: new Date(Date.UTC(2026, 2, 1, 10, 30, 0)).toISOString(),
    totalAmount: 89.99,
    status: 'Delivered',
    items: [], shippingAddress: '', paymentMethod: ''
  },
  {
    id: 'ord_002',
    date: new Date(Date.UTC(2026, 2, 5, 14, 0, 0)).toISOString(),
    totalAmount: 120.00,
    status: 'Shipped',
    items: [], shippingAddress: '', paymentMethod: ''
  },
];

describe('OrderHistoryPage', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  // Test Case 1: Loading state
  test('should display loading message while fetching orders', async () => {
    // Simulate a delay for the API call
    mockGetOrderHistory.mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      return [];
    });

    render(
      <MemoryRouter>
        <OrderHistoryPage />
      </MemoryRouter>
    );

    // Check for loading indicator
    expect(screen.getByText('Loading your orders...')).toBeInTheDocument();

    // Wait for the loading to finish (API call to complete)
    await waitFor(() => expect(screen.queryByText('Loading your orders...')).not.toBeInTheDocument());
  });

  // Test Case 2: Error state
  test('should display error message if order history fails to load', async () => {
    const errorMessage = 'Failed to load order history. Please try again later.';
    mockGetOrderHistory.mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter>
        <OrderHistoryPage />
      </MemoryRouter>
    );

    // Wait for the error state to be displayed
    await waitFor(() => expect(screen.getByText(errorMessage)).toBeInTheDocument());
    expect(mockGetOrderHistory).toHaveBeenCalledTimes(1);
  });

  // Test Case 3: Display orders when successfully fetched
  test('should display order items when order history is fetched successfully', async () => {
    mockGetOrderHistory.mockResolvedValueOnce(mockOrders);

    render(
      <MemoryRouter>
        <OrderHistoryPage />
      </MemoryRouter>
    );

    // Wait for the data to be loaded and displayed
    await waitFor(() => expect(screen.queryByText('Loading your orders...')).not.toBeInTheDocument());

    // Check if the order items are rendered
    expect(screen.getByText(`#${mockOrders[0].id}`)).toBeInTheDocument();
    expect(screen.getByText(`#${mockOrders[1].id}`)).toBeInTheDocument();
    expect(screen.getByText(`Total Amount: $${mockOrders[0].totalAmount.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`Status: ${mockOrders[0].status}`)).toBeInTheDocument();
    expect(mockGetOrderHistory).toHaveBeenCalledTimes(1);
  });

  // Test Case 4: Display message when there are no orders
  test('should display "You have no past orders." when the order list is empty', async () => {
    mockGetOrderHistory.mockResolvedValueOnce([]); // Resolve with an empty array

    render(
      <MemoryRouter>
        <OrderHistoryPage />
      </MemoryRouter>
    );

    // Wait for the loading to finish and the empty message to appear
    await waitFor(() => expect(screen.queryByText('Loading your orders...')).not.toBeInTheDocument());
    expect(screen.getByText('You have no past orders.')).toBeInTheDocument();
    expect(mockGetOrderHistory).toHaveBeenCalledTimes(1);
  });

  // Test Case 5: Ensure navigation links in OrderItem work (indirectly tested via OrderItem tests, but good to ensure page renders them)
  test('should render OrderItem components with correct links', async () => {
    mockGetOrderHistory.mockResolvedValueOnce(mockOrders);

    render(
      <MemoryRouter initialEntries={['/orders']}>
        <Routes>
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:orderId" element={<div>Order Detail Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText('Loading your orders...')).not.toBeInTheDocument());

    // Check if the "View Details" links are present for each order
    const viewDetailsLinks = screen.getAllByText('View Details');
    expect(viewDetailsLinks).toHaveLength(mockOrders.length);

    // Verify one of the links
    expect(viewDetailsLinks[0]).toHaveAttribute('href', `/orders/${mockOrders[0].id}`);
  });
});
