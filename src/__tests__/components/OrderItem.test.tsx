// src/__tests__/components/OrderItem.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderItem from '../../components/OrderItem';
import type { Order } from '../../types/order';

describe('OrderItem Component', () => {
  const mockOrderDelivered: Order = {
    id: 'ord_001',
    date: new Date(Date.UTC(2026, 2, 1, 10, 30, 0)).toISOString(),
    totalAmount: 89.99,
    status: 'Delivered',
    items: [], shippingAddress: '', paymentMethod: ''
  };

  const mockOrderShipped: Order = {
    id: 'ord_002',
    date: new Date(Date.UTC(2026, 2, 5, 14, 0, 0)).toISOString(),
    totalAmount: 120.00,
    status: 'Shipped',
    items: [], shippingAddress: '', paymentMethod: ''
  };

  const mockOrderProcessing: Order = {
    id: 'ord_003',
    date: new Date(Date.UTC(2026, 2, 8, 9, 15, 0)).toISOString(),
    totalAmount: 75.00,
    status: 'Processing',
    items: [], shippingAddress: '', paymentMethod: ''
  };

  const mockOrderCancelled: Order = {
    id: 'ord_004',
    date: new Date(Date.UTC(2026, 2, 9, 11, 0, 0)).toISOString(),
    totalAmount: 50.00,
    status: 'Cancelled',
    items: [], shippingAddress: '', paymentMethod: ''
  };

  const formattedDateDelivered = new Date(mockOrderDelivered.date).toLocaleDateString();
  const formattedDateShipped = new Date(mockOrderShipped.date).toLocaleDateString();

  // Test Case 1: Render basic order details
  test('should render order ID, date, and total amount correctly', () => {
    render(
      <MemoryRouter>
        <OrderItem order={mockOrderDelivered} />
      </MemoryRouter>
    );

    expect(screen.getByText(`#${mockOrderDelivered.id}`)).toBeInTheDocument();
    expect(screen.getByText(`Date: ${formattedDateDelivered}`)).toBeInTheDocument();
    expect(screen.getByText(`Total Amount: $${mockOrderDelivered.totalAmount.toFixed(2)}`)).toBeInTheDocument();
  });

  // Test Case 2: Render correct status and color for 'Delivered'
  test('should display "Delivered" status with green color', () => {
    render(
      <MemoryRouter>
        <OrderItem order={mockOrderDelivered} />
      </MemoryRouter>
    );

    const statusElement = screen.getByText(`Status: ${mockOrderDelivered.status}`);
    expect(statusElement).toBeInTheDocument();
    // Check the color of the status span
    expect(statusElement.nextElementSibling).toHaveStyle('color: rgb(50, 205, 50)'); // Lime Green
  });

  // Test Case 3: Render correct status and color for 'Shipped'
  test('should display "Shipped" status with blue color', () => {
    render(
      <MemoryRouter>
        <OrderItem order={mockOrderShipped} />
      </MemoryRouter>
    );

    const statusElement = screen.getByText(`Status: ${mockOrderShipped.status}`);
    expect(statusElement).toBeInTheDocument();
    expect(statusElement.nextElementSibling).toHaveStyle('color: rgb(30, 144, 255)'); // Dodger Blue
  });

  // Test Case 4: Render correct status and color for 'Processing'
  test('should display "Processing" status with orange color', () => {
    render(
      <MemoryRouter>
        <OrderItem order={mockOrderProcessing} />
      </MemoryRouter>
    );

    const statusElement = screen.getByText(`Status: ${mockOrderProcessing.status}`);
    expect(statusElement).toBeInTheDocument();
    expect(statusElement.nextElementSibling).toHaveStyle('color: rgb(255, 165, 0)'); // Orange
  });

  // Test Case 5: Render correct status and color for 'Cancelled'
  test('should display "Cancelled" status with red color', () => {
    render(
      <MemoryRouter>
        <OrderItem order={mockOrderCancelled} />
      </MemoryRouter>
    );

    const statusElement = screen.getByText(`Status: ${mockOrderCancelled.status}`);
    expect(statusElement).toBeInTheDocument();
    expect(statusElement.nextElementSibling).toHaveStyle('color: rgb(220, 20, 60)'); // Crimson
  });

  // Test Case 6: Ensure "View Details" link navigates correctly
  test('should link to the correct order detail page', () => {
    render(
      <MemoryRouter initialEntries={['/orders']}>
        <Routes>
          <Route path="/orders" element={<OrderItem order={mockOrderDelivered} />} />
          <Route path="/orders/:orderId" element={<div>Order Detail Page Content</div>} />
        </Routes>
      </MemoryRouter>
    );

    const viewDetailsLink = screen.getByText('View Details');
    expect(viewDetailsLink).toBeInTheDocument();
    expect(viewDetailsLink).toHaveAttribute('href', `/orders/${mockOrderDelivered.id}`);
  });

  // Test Case 7: Check rendering with minimal data (if applicable, though types enforce structure)
  // This test ensures the component handles data structure as expected.
  test('should render with minimal required order data', () => {
    const minimalOrder: Order = {
      id: 'ord_min',
      date: new Date(Date.UTC(2026, 2, 15, 12, 0, 0)).toISOString(),
      totalAmount: 10.00,
      status: 'Processing',
      items: [],
      shippingAddress: 'Minimal Address',
      paymentMethod: 'Minimal Method',
    };
    const formattedMinimalDate = new Date(minimalOrder.date).toLocaleDateString();

    render(
      <MemoryRouter>
        <OrderItem order={minimalOrder} />
      </MemoryRouter>
    );

    expect(screen.getByText(`#${minimalOrder.id}`)).toBeInTheDocument();
    expect(screen.getByText(`Date: ${formattedMinimalDate}`)).toBeInTheDocument();
    expect(screen.getByText(`Total Amount: $${minimalOrder.totalAmount.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`Status: ${minimalOrder.status}`)).toBeInTheDocument();
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });
});
