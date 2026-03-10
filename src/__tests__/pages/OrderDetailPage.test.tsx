// src/__tests__/pages/OrderDetailPage.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderDetailPage from '../../pages/OrderDetailPage';
import type { Order, OrderItem as OrderItemType } from '../../types/order';

// Mock the API service
const mockGetOrderById = jest.fn();
jest.mock('../../services/orderApi', () => ({
  getOrderById: (id: string) => mockGetOrderById(id),
}));

// Mock the Link component from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

const mockOrderItem1: OrderItemType = { productId: 'p1', name: 'Awesome Gadget', quantity: 1, price: 49.99 };
const mockOrderItem2: OrderItemType = { productId: 'p2', name: 'Super Widget', quantity: 2, price: 19.50 };

const mockOrder: Order = {
  id: 'ord_001',
  date: new Date(Date.UTC(2026, 2, 1, 10, 30, 0)).toISOString(), // March 1, 2026
  totalAmount: 89.99, // 49.99 + (2 * 19.50)
  status: 'Delivered',
  items: [mockOrderItem1, mockOrderItem2],
  shippingAddress: '123 Main St, Anytown, USA',
  paymentMethod: 'Credit Card',
};

describe('OrderDetailPage Component', () => {
  const orderId = 'ord_001';
  const orderNotFoundMessage = `Order with ID ${orderId} not found.`;

  afterEach(() => {
    mockGetOrderById.mockReset();
  });

  // Helper function to render the page with a specific order ID in the URL
  const renderOrderDetailPage = (orderIdToRender: string) => {
    return render(
      <MemoryRouter initialEntries={[`/orders/${orderIdToRender}`]}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  // Test 1: Loading State
  test('displays loading message while fetching order details', async () => {
    mockGetOrderById.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100))); // Simulate delay

    renderOrderDetailPage(orderId);

    expect(screen.getByText('Loading order details...')).toBeInTheDocument();
    await waitFor(() => expect(mockGetOrderById).toHaveBeenCalledWith(orderId));
  });

  // Test 2: Order Not Found State
  test('displays error message if order is not found', async () => {
    const notFoundError = new Error(orderNotFoundMessage);
    mockGetOrderById.mockRejectedValue(notFoundError);

    renderOrderDetailPage(orderId);

    await waitFor(() => expect(mockGetOrderById).toHaveBeenCalledWith(orderId));
    expect(screen.getByText(`Failed to load order details. ${orderNotFoundMessage}`)).toBeInTheDocument();
    expect(screen.queryByText('Loading order details...')).not.toBeInTheDocument();
  });

  // Test 3: Generic API Error State
  test('displays generic error message for other API errors', async () => {
    const genericError = new Error('Network error');
    mockGetOrderById.mockRejectedValue(genericError);

    renderOrderDetailPage(orderId);

    await waitFor(() => expect(mockGetOrderById).toHaveBeenCalledWith(orderId));
    expect(screen.getByText(`Failed to load order details. ${genericError.message}`)).toBeInTheDocument();
  });

  // Test 4: Missing Order ID in URL
  test('displays error message if order ID is missing in URL', async () => {
    renderOrderDetailPage(''); // Empty order ID

    await waitFor(() => expect(mockGetOrderById).not.toHaveBeenCalled()); // API should not be called
    expect(screen.getByText('Order ID is missing.')).toBeInTheDocument();
    expect(screen.queryByText('Loading order details...')).not.toBeInTheDocument();
  });

  // Test 5: Happy Path - Verify all order details are displayed
  test('displays all order details correctly for a valid order', async () => {
    mockGetOrderById.mockResolvedValue(mockOrder);

    renderOrderDetailPage(orderId);

    await waitFor(() => expect(mockGetOrderById).toHaveBeenCalledWith(orderId));

    // Check main order details
    expect(screen.getByText(`#${mockOrder.id}`)).toBeInTheDocument();
    expect(screen.getByText(new Date(mockOrder.date).toLocaleDateString())).toBeInTheDocument();
    expect(screen.getByText(mockOrder.status)).toBeInTheDocument();
    expect(screen.getByText(mockOrder.shippingAddress)).toBeInTheDocument();
    expect(screen.getByText(mockOrder.paymentMethod)).toBeInTheDocument();
    expect(screen.getByText(`$${mockOrder.totalAmount.toFixed(2)}`)).toBeInTheDocument();

    // Check items list
    expect(screen.getByText('Items:')).toBeInTheDocument();
    mockOrder.items.forEach(item => {
      const itemLine = screen.getByText(`${item.quantity} x ${item.name}`);
      expect(itemLine).toBeInTheDocument();
      expect(itemLine.nextSibling).toHaveTextContent(`$${(item.quantity * item.price).toFixed(2)}`);
    });

    // Check "Back to Order History" link
    const backLink = screen.getByRole('link', { name: /&larr; Back to Order History/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/orders');
  });

  // Test 6: Status Color Check (indirectly through rendering)
  test('displays correct status color badge', async () => {
    mockGetOrderById.mockResolvedValue(mockOrder); // 'Delivered' status

    renderOrderDetailPage(orderId);
    await waitFor(() => expect(mockGetOrderById).toHaveBeenCalledWith(orderId));

    const statusBadge = screen.getByText(mockOrder.status);
    expect(statusBadge).toBeInTheDocument();

    // Check computed style or direct style attribute for the color
    // The getStatusColor logic is in OrderDetailPage itself.
    // We can find the span with the status text and check its style attribute.
    const statusElement = statusBadge.parentElement; // The span containing status text and styles
    expect(statusElement).toHaveStyle('background-color: #32CD32'); // Lime Green for Delivered
  });
});
