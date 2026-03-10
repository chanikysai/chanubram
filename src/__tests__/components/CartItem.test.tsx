import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CartItem from './CartItem';
import { useCart } from '../context/CartContext'; // Assuming CartContext is in ../context/

// Mock the useCart hook
jest.mock('../context/CartContext', () => ({
  ...jest.requireActual('../context/CartContext'),
  useCart: jest.fn(),
}));

const mockUseCart = useCart as jest.Mock;

describe('CartItem', () => {
  const mockItem = {
    id: 'prod-1',
    name: 'Sample Product',
    price: 25.50,
    quantity: 2,
  };

  beforeEach(() => {
    // Reset mocks before each test
    mockUseCart.mockClear();
  });

  // Test 1: Render item details correctly (happy path)
  test('should render item details, quantity, and subtotal correctly', () => {
    mockUseCart.mockReturnValue({
      updateQuantity: jest.fn(),
      removeItem: jest.fn(),
    });

    render(<CartItem item={mockItem} />);

    expect(screen.getByText('Sample Product')).toBeInTheDocument();
    expect(screen.getByText('Price: $25.50')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Quantity
    expect(screen.getByText('Subtotal: $51.00')).toBeInTheDocument(); // 25.50 * 2
  });

  // Test 2: Update quantity (happy path - increase)
  test('should call updateQuantity with incremented value when "+" is clicked', () => {
    const mockUpdateQuantity = jest.fn();
    mockUseCart.mockReturnValue({
      updateQuantity: mockUpdateQuantity,
      removeItem: jest.fn(),
    });

    render(<CartItem item={mockItem} />);

    const increaseButton = screen.getByLabelText('Increase quantity');
    fireEvent.click(increaseButton);

    expect(mockUpdateQuantity).toHaveBeenCalledTimes(1);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-1', 3); // item.quantity + 1
  });

  // Test 3: Update quantity (happy path - decrease)
  test('should call updateQuantity with decremented value when "-" is clicked', () => {
    const mockUpdateQuantity = jest.fn();
    mockUseCart.mockReturnValue({
      updateQuantity: mockUpdateQuantity,
      removeItem: jest.fn(),
    });

    render(<CartItem item={mockItem} />);

    const decreaseButton = screen.getByLabelText('Decrease quantity');
    fireEvent.click(decreaseButton);

    expect(mockUpdateQuantity).toHaveBeenCalledTimes(1);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-1', 1); // item.quantity - 1
  });

  // Test 4: Disable decrease button when quantity is 1 (edge case)
  test('should disable the decrease quantity button when item quantity is 1', () => {
    const singleItem = { ...mockItem, quantity: 1 };
    mockUseCart.mockReturnValue({
      updateQuantity: jest.fn(),
      removeItem: jest.fn(),
    });

    render(<CartItem item={singleItem} />);

    const decreaseButton = screen.getByLabelText('Decrease quantity');
    expect(decreaseButton).toBeDisabled();

    // Ensure clicking it does not call updateQuantity
    fireEvent.click(decreaseButton);
    expect(mockUseCart().updateQuantity).not.toHaveBeenCalled();
  });

  // Test 5: Remove item (happy path)
  test('should call removeItem when the "Remove" button is clicked', () => {
    const mockRemoveItem = jest.fn();
    mockUseCart.mockReturnValue({
      updateQuantity: jest.fn(),
      removeItem: mockRemoveItem,
    });

    render(<CartItem item={mockItem} />);

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(mockRemoveItem).toHaveBeenCalledTimes(1);
    expect(mockRemoveItem).toHaveBeenCalledWith('prod-1');
  });

  // Test 6: Update quantity to 0 (edge case handled by context, but test component call)
  test('should call updateQuantity with 0 if decrease button is clicked when quantity is 1', () => {
    const singleItem = { ...mockItem, quantity: 1 };
    const mockUpdateQuantity = jest.fn();
    mockUseCart.mockReturnValue({
      updateQuantity: mockUpdateQuantity,
      removeItem: jest.fn(),
    });

    render(<CartItem item={singleItem} />);

    const decreaseButton = screen.getByLabelText('Decrease quantity');
    fireEvent.click(decreaseButton);

    // The component calls updateQuantity(itemId, quantity - 1).
    // If quantity is 1, it calls updateQuantity('prod-1', 0).
    // The context handles quantity 0 by removing the item.
    expect(mockUpdateQuantity).toHaveBeenCalledTimes(1);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-1', 0);
  });
});
