// src/__tests__/components/OrderItem.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderItem from '../../components/OrderItem';
import type { Order } from '../../types/order';

// Mock order data
const mockOrder: Order = {
  id: 'ord_123',
  date: new Date(Date.UTC(2026, 2, 15, 11, 0, 0)).toISOString(), // March 15, 2026
  totalAmount: 99.50,
  status: 'Shipped',
  items: [
    { productId: 'p5', name: 'Test Item', quantity: 1, price: 99.50 },
  ],
  shippingAddress: '123 Test Rd, Testville',
  paymentMethod: 'Test Card',
};

const mockDeliveredOrder: Order = {
  ...mockOrder,
  id: 'ord_456',
  date: new Date(Date.UTC(2026, 2, 10, 10, 0, 0)).toISOString(),
  status: 'Delivered',
  totalAmount: 50.00,
};

const mockProcessingOrder: Order = {
  ...mockOrder,
  id: 'ord_789',
  date: new Date(Date.UTC(2026, 2, 12, 12, 0, 0)).toISOString(),
  status: 'Processing',
  totalAmount: 25.00,
};

const mockCancelledOrder: Order = {
  ...mockOrder,
  id: 'ord_000',
  date: new Date(Date.UTC(2026, 2, 13, 13, 0, 0)).toISOString(),
  status: 'Cancelled',
  totalAmount: 10.00,
};

describe('OrderItem', () => {
  // Test Case 1: Render basic order details correctly
  test('should render order ID, date, and total amount correctly', () => {
    render(<OrderItem order={mockOrder} />);

    const formattedDate = new Date(mockOrder.date).toLocaleDateString();

    expect(screen.getByText(`#${mockOrder.id}`)).toBeInTheDocument();
    expect(screen.getByText(`Date: ${formattedDate}`)).toBeInTheDocument();
    expect(screen.getByText(`Total Amount: $${mockOrder.totalAmount.toFixed(2)}`)).toBeInTheDocument();
  });

  // Test Case 2: Render status and check its color
  test('should render the correct status and apply appropriate color styling', () => {
    const { rerender } = render(
      <MemoryRouter>
        <OrderItem order={mockOrder} />
      </MemoryRouter>
    );

    // Check for 'Shipped' status
    const shippedStatusElement = screen.getByText('Status: Shipped');
    expect(shippedStatusElement).toBeInTheDocument();
    expect(shippedStatusElement.parentElement).toHaveStyle('color: #1E90FF'); // Dodger Blue for Shipped

    // Rerender with a different status
    rerender(
      <MemoryRouter>
        <OrderItem order={mockDeliveredOrder} />
      </MemoryRouter>
    );
    const deliveredStatusElement = screen.getByText('Status: Delivered');
    expect(deliveredStatusElement).toBeInTheDocument();
    expect(deliveredStatusElement.parentElement).toHaveStyle('color: #32CD32'); // Lime Green for Delivered

    // Rerender with another status
    rerender(
      <MemoryRouter>
        <OrderItem order={mockProcessingOrder} />
      </MemoryRouter>
    );
    const processingStatusElement = screen.getByText('Status: Processing');
    expect(processingStatusElement).toBeInTheDocument();
    expect(processingStatusElement.parentElement).toHaveStyle('color: #FFA500'); // Orange for Processing

    // Rerender with cancelled status
    rerender(
      <MemoryRouter>
        <OrderItem order={mockCancelledOrder} />
      </MemoryRouter>
    );
    const cancelledStatusElement = screen.getByText('Status: Cancelled');
    expect(cancelledStatusElement).toBeInTheDocument();
    expect(cancelledStatusElement.parentElement).toHaveStyle('color: #DC143C'); // Crimson for Cancelled
  });

  // Test Case 3: Ensure the "View Details" link navigates correctly
  test('should link to the correct order detail page', () => {
    render(
      <MemoryRouter initialEntries={['/orders']}>
        <Routes>
          <Route path="/orders" element={<OrderItem order={mockOrder} />} />
          <Route path="/orders/:orderId" element={<div>Order Detail Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const linkElement = screen.getByText('View Details');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', `/orders/${mockOrder.id}`);
  });
});
