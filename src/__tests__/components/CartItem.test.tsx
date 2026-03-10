// src/__tests__/components/CartItem.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CartItemComponent from '../../components/CartItem';
import { CartItem } from '../../context/CartContext';

describe('CartItemComponent', () => {
  const mockItem: CartItem = {
    id: 'prod-1',
    name: 'Example Product',
    price: 19.99,
    description: 'A sample product',
    quantity: 2,
  };

  const mockUpdateQuantity = jest.fn();
  const mockRemove = jest.fn();

  beforeEach(() => {
    // Clear mocks before each test
    mockUpdateQuantity.mockClear();
    mockRemove.mockClear();
    jest.clearAllMocks();
  });

  // Happy Path: Renders item details correctly
  test('should render item details correctly', () => {
    render(
      <CartItemComponent
        item={mockItem}
        onUpdateQuantity={mockUpdateQuantity}
        onRemove={mockRemove}
      />
    );

    expect(screen.getByText('Example Product')).toBeInTheDocument();
    expect(screen.getByText('Price: $19.99')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Quantity
  });

  // Happy Path: Increase quantity when plus button is clicked
  test('should call onUpdateQuantity with increased quantity when plus button is clicked', () => {
    render(
      <CartItemComponent
        item={mockItem}
        onUpdateQuantity={mockUpdateQuantity}
        onRemove={mockRemove}
      />
    );

    const plusButton = screen.getByText('+');
    fireEvent.click(plusButton);

    expect(mockUpdateQuantity).toHaveBeenCalledTimes(1);
    expect(mockUpdateQuantity).toHaveBeenCalledWith(mockItem.id, mockItem.quantity + 1); // Should be 3
  });

  // Happy Path: Decrease quantity when minus button is clicked
  test('should call onUpdateQuantity with decreased quantity when minus button is clicked', () => {
    render(
      <CartItemComponent
        item={mockItem}
        onUpdateQuantity={mockUpdateQuantity}
        onRemove={mockRemove}
      />
    );

    const minusButton = screen.getByText('-');
    fireEvent.click(minusButton);

    expect(mockUpdateQuantity).toHaveBeenCalledTimes(1);
    expect(mockUpdateQuantity).toHaveBeenCalledWith(mockItem.id, mockItem.quantity - 1); // Should be 1
  });

  // Edge Case: Decrease quantity to 0 (handled by context, but component should trigger it)
  // Note: The context logic handles removing when quantity becomes 0.
  // This test verifies the component correctly passes quantity - 1.
  test('should call onUpdateQuantity with 0 when minus button is clicked and quantity is 1', () => {
    const singleItem: CartItem = { ...mockItem, quantity: 1 };

    render(
      <CartItemComponent
        item={singleItem}
        onUpdateQuantity={mockUpdateQuantity}
        onRemove={mockRemove}
      />
    );

    const minusButton = screen.getByText('-');
    fireEvent.click(minusButton);

    expect(mockUpdateQuantity).toHaveBeenCalledTimes(1);
    expect(mockUpdateQuantity).toHaveBeenCalledWith(singleItem.id, 0); // Quantity will become 0
  });

  // Happy Path: Remove item when remove button is clicked
  test('should call onRemove when remove button is clicked', () => {
    render(
      <CartItemComponent
        item={mockItem}
        onUpdateQuantity={mockUpdateQuantity}
        onRemove={mockRemove}
      />
    );

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(mockRemove).toHaveBeenCalledWith(mockItem.id);
  });
});
