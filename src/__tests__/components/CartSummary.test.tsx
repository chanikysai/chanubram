import React from 'react';
import { render, screen } from '@testing-library/react';
import CartSummary from './CartSummary';
import { useCart } from '../context/CartContext'; // Assuming CartContext is in ../context/

// Mock the useCart hook
jest.mock('../context/CartContext', () => ({
  ...jest.requireActual('../context/CartContext'),
  useCart: jest.fn(),
}));

const mockUseCart = useCart as jest.Mock;

describe('CartSummary', () => {
  // Test 1: Render summary with items in cart (happy path)
  test('should display total items and total price when cart is not empty', () => {
    const mockTotalItems = 5;
    const mockTotalPrice = 125.75;

    mockUseCart.mockReturnValue({
      getTotalItems: () => mockTotalItems,
      getTotalPrice: () => mockTotalPrice,
      clearCart: jest.fn(),
    });

    render(<CartSummary />);

    expect(screen.getByText('Cart Summary')).toBeInTheDocument();
    expect(screen.getByText(`Total Items: ${mockTotalItems}`)).toBeInTheDocument();
    expect(screen.getByText(`Total Price: $${mockTotalPrice.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear Cart' })).toBeInTheDocument();
  });

  // Test 2: Render summary when cart is empty (edge case)
  test('should display zero items and zero price when cart is empty', () => {
    mockUseCart.mockReturnValue({
      getTotalItems: () => 0,
      getTotalPrice: () => 0,
      clearCart: jest.fn(),
    });

    render(<CartSummary />);

    expect(screen.getByText('Cart Summary')).toBeInTheDocument();
    expect(screen.getByText('Total Items: 0')).toBeInTheDocument();
    expect(screen.getByText('Total Price: $0.00')).toBeInTheDocument();
    // The "Clear Cart" button should not be present if there are no items
    expect(screen.queryByRole('button', { name: 'Clear Cart' })).not.toBeInTheDocument();
  });

  // Test 3: Call clearCart when the button is clicked (happy path)
  test('should call clearCart when the "Clear Cart" button is clicked', () => {
    const mockClearCart = jest.fn();
    mockUseCart.mockReturnValue({
      getTotalItems: () => 3,
      getTotalPrice: () => 75.00,
      clearCart: mockClearCart,
    });

    render(<CartSummary />);

    const clearButton = screen.getByRole('button', { name: 'Clear Cart' });
    fireEvent.click(clearButton);

    expect(mockClearCart).toHaveBeenCalledTimes(1);
  });
});
