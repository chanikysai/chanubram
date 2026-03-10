// src/__tests__/components/OrderItem.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import OrderItem from '../../components/OrderItem';
import type { Order } from '../../types/order';
import { BrowserRouter as Router } from 'react-router-dom'; // Mocking React Router

// Mock the Link component to check its props
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Use actual Link for rendering, but we can inspect props if needed
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

const mockOrderDelivered: Order = {
  id: 'ord_001',
  date: new Date(Date.UTC(2026, 2, 1, 10, 30, 0)).toISOString(), // March 1, 2026
  totalAmount: 89.99,
  status: 'Delivered',
  items: [], // Items not rendered by OrderItem
  shippingAddress: '',
  paymentMethod: '',
};

const mockOrderProcessing: Order = {
  id: 'ord_003',
  date: new Date(Date.UTC(2026, 2, 8, 9, 15, 0)).toISOString(), // March 8, 2026
  totalAmount: 75.00,
  status: 'Processing',
  items: [],
  shippingAddress: '',
  paymentMethod: '',
};

describe('OrderItem Component', () => {
  // Test 1: Happy Path - Verify correct rendering of order details and status
  test('renders order details correctly for a delivered order', () => {
    render(
      <Router>
        <OrderItem order={mockOrderDelivered} />
      </Router>
    );

    // Check for order ID
    expect(screen.getByText(/Order #ord_001/i)).toBeInTheDocument();
    // Check for formatted date
    expect(screen.getByText('3/1/2026')).toBeInTheDocument(); // Based on toLocaleDateString() default format for US locale
    // Check for total amount
    expect(screen.getByText('$89.99')).toBeInTheDocument();
    // Check for status text
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  // Test 2: Status and Color - Verify different status text and background color
  test('renders correct status text and background color for a processing order', () => {
    render(
      <Router>
        <OrderItem order={mockOrderProcessing} />
      </Router>
    );

    const statusBadge = screen.getByText('Processing');
    expect(statusBadge).toBeInTheDocument();

    // Check background color (using inline styles, so check computed style or the element's style attribute if rendered directly)
    // Since we're mocking Link to 'a' tag, the status badge will be a span inside it.
    // We can check the parent of the status badge, which is the Link mock (a tag)
    // Or, if the status badge is a direct child of the main div, we can find it.
    // Let's assume getStatusColor applies directly to the span containing the status text.
    // The style is applied to the span.
    const statusElement = screen.getByText('Processing').parentElement; // Get the parent element, which is the span with styles
    expect(statusElement).toHaveStyle('background-color: #FFA500'); // Orange for Processing
  });

  // Test 3: Link Navigation - Verify the link directs to the correct order detail page
  test('links to the correct order detail page', () => {
    render(
      <Router>
        <OrderItem order={mockOrderDelivered} />
      </Router>
    );

    // The Link component is mocked to be an anchor tag 'a' with href
    const linkElement = screen.getByText(/Order #ord_001/i);
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/orders/ord_001');
  });
});
