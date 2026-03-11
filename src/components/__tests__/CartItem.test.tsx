// src/components/__tests__/CartItem.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CartItemComponent from '../CartItem';
import { CartItem } from '../../context/CartContext';

// Mock data
const mockItem: CartItem = {
  id: 'prod-1',
  name: 'Test Product',
  price: 25.50,
  quantity: 2,
};

// Mock functions
const mockUpdateQuantity = jest.fn();
const mockRemoveItem = jest.fn();

describe('CartItemComponent', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    mockUpdateQuantity.mockClear();
    mockRemoveItem.mockClear();
  });

  test('renders correctly with item details', () => {
    render(
      <CartItemComponent
        item={mockItem}
        onUpdateQuantity={mockUpdateQuantity}
        onRemove={mockRemoveItem}
      />
    );

    // Check if product name and price are displayed
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$25.50 each')).toBeInTheDocument();

    // Check if quantity input shows the correct initial quantity
    const quantityInput = screen.getByLabelText('Quantity for Test Product') as HTMLInputElement;
    expect(quantityInput).toBeInTheDocument();
    expect(quantityInput.value).toBe('2');

    // Check if the total price for the item is displayed
    expect(screen.getByText('$51.00')).toBeInTheDocument(); // 25.50 * 2

    // Check if Remove button is present
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  test('calls onUpdateQuantity when quantity input changes', () => {
    render(
      <CartItemComponent
        item={mockItem}
        onUpdateQuantity={mockUpdateQuantity}
        onRemove={mockRemoveItem}
      />
    );

    const quantityInput = screen.getByLabelText('Quantity for Test Product') as HTMLInputElement;
    fireEvent.change(quantityInput, { target: { value: '3' } });

    expect(mockUpdateQuantity).toHaveBeenCalledTimes(1);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-1', 3);
  });

  test('calls onUpdateQuantity when increment button is clicked', () => {
    render(
      <CartItemComponent
        item={mockItem}
        onUpdateQuantity={mockUpdateQuantity}
        onRemove={mockRemoveItem}
      />
    );

    const incrementButton = screen.getByRole('button', { name: '+' });
    fireEvent.click(incrementButton);

    expect(mockUpdateQuantity).toHaveBeenCalledTimes(1);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-1', 3); // current quantity (2) + 1
  });

  test('calls onRemove when decrement button is clicked and quantity is 1', () => {
    const singleItem: CartItem = { ...mockItem, quantity: 1 };
    render(
      <CartItemComponent
        item={singleItem}
        onUpdateQuantity={mockUpdateQuantity}
        onRemove={mockRemoveItem}
      />
    );

    const decrementButton = screen.getByRole('button', { name: '-' });
    fireEvent.click(decrementButton);

    // Expect onRemove to be called when quantity becomes 0
    expect(mockRemoveItem).toHaveBeenCalledTimes(1);
    expect(mockRemoveItem).toHaveBeenCalledWith('prod-1');
    expect(mockUpdateQuantity).not.toHaveBeenCalled(); // Should not call updateQuantity if removed
  });

  test('calls onUpdateQuantity when decrement button is clicked and quantity is greater than 1', () => {
    render(
      <CartItemComponent
        item={mockItem} // quantity is 2
        onUpdateQuantity={mockUpdateQuantity}
        onRemove={mockRemoveItem}
      />
    );

    const decrementButton = screen.getByRole('button', { name: '-' });
    fireEvent.click(decrementButton);

    expect(mockUpdateQuantity).toHaveBeenCalledTimes(1);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-1', 1); // current quantity (2) - 1
    expect(mockRemoveItem).not.toHaveBeenCalled();
  });

  test('calls onRemove when remove button is clicked', () => {
    render(
      <CartItemComponent
        item={mockItem}
        onUpdateQuantity={mockUpdateQuantity}
        onRemove={mockRemoveItem}
      />
    );

    const removeButton = screen.getByRole('button', { name: 'Remove' });
    fireEvent.click(removeButton);

    expect(mockRemoveItem).toHaveBeenCalledTimes(1);
    expect(mockRemoveItem).toHaveBeenCalledWith('prod-1');
  });
});
