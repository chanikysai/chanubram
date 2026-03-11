// src/components/__tests__/CartSummary.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import CartSummary from '../CartSummary';
import { CartItem } from '../../context/CartContext';

describe('CartSummary', () => {
  test('renders "Your cart is empty" message when no items are provided', () => {
    render(<CartSummary items={[]} total={0} />);
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    expect(screen.queryByText('Order Summary')).not.toBeInTheDocument();
  });

  test('renders correctly with items and calculates subtotal', () => {
    const items: CartItem[] = [
      { id: 'p1', name: 'Product A', price: 10.00, quantity: 2 },
      { id: 'p2', name: 'Product B', price: 20.00, quantity: 1 },
    ];
    const subtotal = 40.00; // (10*2) + (20*1)
    const total = 40.00;

    render(<CartSummary items={items} total={total} />);

    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Product A (2x)')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument(); // Price for 2x Product A
    expect(screen.getByText('Product B (1x)')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument(); // Price for 1x Product B
    expect(screen.getByText('Subtotal:')).toBeInTheDocument();
    expect(screen.getByText('$40.00')).toBeInTheDocument(); // Correct subtotal
    expect(screen.getByText('Total:')).toBeInTheDocument();
    expect(screen.getByText('$40.00')).toBeInTheDocument(); // Correct total
  });

  test('renders discount amount and updates total when provided', () => {
    const items: CartItem[] = [
      { id: 'p1', name: 'Product A', price: 10.00, quantity: 2 },
    ];
    const subtotal = 20.00;
    const discountAmount = 5.00;
    const total = subtotal - discountAmount; // 15.00

    render(<CartSummary items={items} total={total} discountAmount={discountAmount} />);

    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Subtotal:')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument();
    expect(screen.getByText('Discount Applied:')).toBeInTheDocument();
    expect(screen.getByText('-$5.00')).toBeInTheDocument();
    expect(screen.getByText('Total:')).toBeInTheDocument();
    expect(screen.getByText('$15.00')).toBeInTheDocument(); // Correct total after discount
  });

  test('displays coupon message when provided', () => {
    const items: CartItem[] = [
      { id: 'p1', name: 'Product A', price: 10.00, quantity: 1 },
    ];
    const total = 10.00;
    const couponMessage = '10% off applied!';

    render(<CartSummary items={items} total={total} couponMessage={couponMessage} />);

    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Coupon: 10% off applied!')).toBeInTheDocument();
  });

  test('handles zero discount amount correctly', () => {
    const items: CartItem[] = [
      { id: 'p1', name: 'Product A', price: 10.00, quantity: 1 },
    ];
    const total = 10.00;
    const discountAmount = 0;

    render(<CartSummary items={items} total={total} discountAmount={discountAmount} />);

    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    // Ensure "Discount Applied" is not shown if amount is 0
    expect(screen.queryByText('Discount Applied:')).not.toBeInTheDocument();
    expect(screen.getByText('Total:')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });
});
