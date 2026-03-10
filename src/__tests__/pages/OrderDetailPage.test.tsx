// src/__tests__/pages/OrderDetailPage.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderDetailPage from '../../pages/OrderDetailPage';
import { getOrderById } from '../../services/orderApi';
import type { Order, OrderItem } from '../../types/order';

// Mock the API call
jest.mock('../../services/orderApi');

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

// Cast the mocked functions for type safety
const mockGetOrderById = getOrderById as jest.MockedFunction<typeof getOrderById>;
const mockUseParams = require('react-router-dom').useParams as jest.Mock;

// Mock order data
const mockOrder1: Order = {
  id: 'ord_001',
  date: new Date(Date.UTC(2026, 2, 1, 10, 30, 0)).toISOString(),
  totalAmount: 89.99,
  status: 'Delivered',
  items: [
    { productId: 'p1', name: 'Awesome Gadget', quantity: 1, price: 49.99 },
    { productId: 'p2', name: 'Super Widget', quantity: 2, price: 19.50 },
  ],
  shippingAddress: '123 Main St, Anytown, USA',
  paymentMethod: 'Credit Card',
};

const mockOrderWithNoItems: Order = {
  id: 'ord_empty',
  date: new Date(Date.UTC(2026, 2, 10, 11, 0, 0)).toISOString(),
  totalAmount: 0.00,
  status: 'Processing',
  items: [],
  shippingAddress: 'No items address',
  paymentMethod: 'No items payment',
};

describe('OrderDetailPage', () => {
  const orderId = 'ord_001';

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Set default mock for useParams
    mockUseParams.mockReturnValue({ orderId: orderId });

    // Mock setTimeout for the API delay
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Test Case 1: Loading state
  test('should display loading message while fetching order details', async () => {
    // Simulate a delay for the API call
    mockGetOrderById.mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      return mockOrder1;
    });

    render(
      <MemoryRouter initialEntries={[`/orders/${orderId}`]}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Check for loading indicator
    expect(screen.getByText('Loading order details...')).toBeInTheDocument();

    // Advance timers to allow the mock API call (including setTimeout) to complete
    jest.advanceTimersByTime(100);

    // Wait for the loading message to disappear
    await waitFor(() => expect(screen.queryByText('Loading order details...')).not.toBeInTheDocument());
  });

  // Test Case 2: Error state for API failure
  test('should display error message if order details fail to load', async () => {
    const errorMessage = 'Failed to load order details. API Error';
    mockGetOrderById.mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter initialEntries={[`/orders/${orderId}`]}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    jest.advanceTimersByTime(500); // Advance timers to allow the rejected promise and error handling

    // Wait for the error state to be displayed
    await waitFor(() => expect(screen.getByText(errorMessage)).toBeInTheDocument());
    expect(mockGetOrderById).toHaveBeenCalledTimes(1);
    expect(mockGetOrderById).toHaveBeenCalledWith(orderId);
  });

  // Test Case 3: Error state for missing order ID
  test('should display error message if order ID is missing', async () => {
    mockUseParams.mockReturnValue({ orderId: undefined }); // Simulate missing orderId

    render(
      <MemoryRouter initialEntries={['/orders/']}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // No API call should be made, and an immediate error should be shown
    expect(screen.getByText('Order ID is missing.')).toBeInTheDocument();
    expect(mockGetOrderById).not.toHaveBeenCalled();
  });

  // Test Case 4: Display order details when successfully fetched
  test('should display order details correctly when fetched successfully', async () => {
    mockGetOrderById.mockResolvedValueOnce(mockOrder1);

    render(
      <MemoryRouter initialEntries={[`/orders/${orderId}`]}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    jest.advanceTimersByTime(500); // Advance timers to allow mock API call

    // Wait for loading to complete and details to appear
    await waitFor(() => expect(screen.queryByText('Loading order details...')).not.toBeInTheDocument());

    // Check for core order information
    expect(screen.getByText(`#${mockOrder1.id}`)).toBeInTheDocument();
    const formattedDate = new Date(mockOrder1.date).toLocaleDateString();
    expect(screen.getByText(`Date: ${formattedDate}`)).toBeInTheDocument();
    expect(screen.getByText(`Status: ${mockOrder1.status}`)).toBeInTheDocument();
    expect(screen.getByText(`Shipping Address: ${mockOrder1.shippingAddress}`)).toBeInTheDocument();
    expect(screen.getByText(`Payment Method: ${mockOrder1.paymentMethod}`)).toBeInTheDocument();
    expect(screen.getByText(`Order Total: $${mockOrder1.totalAmount.toFixed(2)}`)).toBeInTheDocument();

    // Check for items
    expect(screen.getByText('Items:')).toBeInTheDocument();
    expect(screen.getByText(`1 x ${mockOrder1.items[0].name}`)).toBeInTheDocument();
    expect(screen.getByText(`$${(mockOrder1.items[0].quantity * mockOrder1.items[0].price).toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`2 x ${mockOrder1.items[1].name}`)).toBeInTheDocument();
    expect(screen.getByText(`$${(mockOrder1.items[1].quantity * mockOrder1.items[1].price).toFixed(2)}`)).toBeInTheDocument();

    expect(mockGetOrderById).toHaveBeenCalledTimes(1);
    expect(mockGetOrderById).toHaveBeenCalledWith(orderId);
  });

  // Test Case 5: Handle order with no items
  test('should display "No items in this order." if the order has no items', async () => {
    mockGetOrderById.mockResolvedValueOnce(mockOrderWithNoItems);
    mockUseParams.mockReturnValue({ orderId: 'ord_empty' });

    render(
      <MemoryRouter initialEntries={['/orders/ord_empty']}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => expect(screen.queryByText('Loading order details...')).not.toBeInTheDocument());

    expect(screen.getByText('No items in this order.')).toBeInTheDocument();
    expect(screen.queryByText('Items:')).toBeInTheDocument(); // "Items:" heading should still be there
    expect(screen.queryByText('Order Total:')).toBeInTheDocument(); // Total should still be shown
    expect(screen.getByText('Order Total: $0.00')).toBeInTheDocument();
  });

  // Test Case 6: "Order not found" scenario (if API returned null/undefined or specific error)
  // This is implicitly covered by Test Case 2 if the API throws an error for not found.
  // If getOrderById were to return null instead of throwing, this test would be needed.
  test('should display "Order not found." if the fetched order is null/undefined', async () => {
    // Mock getOrderById to return null when order is not found
    mockGetOrderById.mockResolvedValueOnce(null as any); // Explicitly mock null return
    mockUseParams.mockReturnValue({ orderId: 'ord_nonexistent' });

    render(
      <MemoryRouter initialEntries={['/orders/ord_nonexistent']}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => expect(screen.queryByText('Loading order details...')).not.toBeInTheDocument());
    expect(screen.getByText('Order not found.')).toBeInTheDocument();
    expect(mockGetOrderById).toHaveBeenCalledWith('ord_nonexistent');
  });

  // Test Case 7: "Back to Order History" link functionality
  test('should have a functional "Back to Order History" link', async () => {
    mockGetOrderById.mockResolvedValueOnce(mockOrder1);

    render(
      <MemoryRouter initialEntries={[`/orders/${orderId}`]}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/orders" element={<div>Order History Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => expect(screen.queryByText('Loading order details...')).not.toBeInTheDocument());

    const backLink = screen.getByText('← Back to Order History');
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/orders');
  });
});
