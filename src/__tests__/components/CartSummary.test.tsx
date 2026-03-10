// src/__tests__/components/CartSummary.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import CartSummary from '../../components/CartSummary';
import { CartItem } from '../../context/CartContext';

describe('CartSummary', () => {
  // Happy Path: Renders summary with multiple items
  test('should render the correct total for multiple items', () => {
    const mockItems: CartItem[] = [
      { id: '1', name: 'Laptop', price: 1200, quantity: 1 },
      { id: '2', name: 'Mouse', price: 25, quantity: 2 },
      { id: '3', name: 'Keyboard', price: 75, quantity: 1 },
    ];
    render(<CartSummary items={mockItems} />);

    expect(screen.getByText('Order Summary')).toBeInTheDocument();

    // Check individual item subtotals
    expect(screen.getByText('Laptop (1x)')).toBeInTheDocument();
    expect(screen.getByText('$1200.00')).toBeInTheDocument(); // 1200 * 1

    expect(screen.getByText('Mouse (2x)')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument(); // 25 * 2

    expect(screen.getByText('Keyboard (1x)')).toBeInTheDocument();
    expect(screen.getByText('$75.00')).toBeInTheDocument(); // 75 * 1

    // Check total
    // Total = (1200*1) + (25*2) + (75*1) = 1200 + 50 + 75 = 1325
    expect(screen.getByText('Total:')).toBeInTheDocument();
    expect(screen.getByText('$1325.00')).toBeInTheDocument();
  });

  // Edge Case: Renders summary with an empty cart
  test('should display a message when the cart is empty', () => {
    const mockItems: CartItem[] = [];
    render(<CartSummary items={mockItems} />);

    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    expect(screen.queryByText('Total:')).toBeNull(); // Total should not be displayed if empty
  });

  // Edge Case: Renders summary with a single item
  test('should render the correct total for a single item', () => {
    const mockItems: CartItem[] = [
      { id: '1', name: 'Monitor', price: 300, quantity: 1 },
    ];
    render(<CartSummary items={mockItems} />);

    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Monitor (1x)')).toBeInTheDocument();
    expect(screen.getByText('$300.00')).toBeInTheDocument();
    expect(screen.getByText('Total:')).toBeInTheDocument();
    expect(screen.getByText('$300.00')).toBeInTheDocument();
  });

  // Edge Case: Item with zero price (though unlikely, good to test calculation)
  test('should handle items with zero price correctly', () => {
    const mockItems: CartItem[] = [
      { id: '1', name: 'Freebie', price: 0, quantity: 5 },
      { id: '2', name: 'Standard Item', price: 10, quantity: 1 },
    ];
    render(<CartSummary items={mockItems} />);

    expect(screen.getByText('Freebie (5x)')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument(); // 0 * 5

    expect(screen.getByText('Standard Item (1x)')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument(); // 10 * 1

    expect(screen.getByText('Total:')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument(); // 0 + 10
  });
});
