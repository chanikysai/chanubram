// src/pages/__tests__/CartPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CartProvider, useCart, CartItem } from '../../context/CartContext';
import CartPage from '../CartPage';

// Mock the useCart hook
jest.mock('../../context/CartContext', () => ({
  ...jest.requireActual('../../context/CartContext'),
  useCart: jest.fn(),
}));

// Mock the CartItemComponent to isolate CartPage testing
jest.mock('../CartItem', () => ({
  __esModule: true,
  default: ({ item, onUpdateQuantity, onRemove }: { item: CartItem; onUpdateQuantity: any; onRemove: any }) => (
    <div data-testid="cart-item-mock">
      <h4>{item.name}</h4>
      <p>Price: ${item.price.toFixed(2)}</p>
      <p>Quantity: {item.quantity}</p>
      <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>Inc</button>
      <button onClick={() => onRemove(item.id)}>Remove</button>
    </div>
  ),
}));

// Mock the CartSummary component
jest.mock('../CartSummary', () => ({
  __esModule: true,
  default: ({ items, total, discountAmount, couponMessage }: any) => (
    <div data-testid="cart-summary-mock">
      <h4>Order Summary</h4>
      <p>Subtotal: ${(items || []).reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0).toFixed(2)}</p>
      {discountAmount > 0 && <p>Discount: -${discountAmount.toFixed(2)}</p>}
      {couponMessage && <p>Coupon: {couponMessage}</p>}
      <p>Total: ${total.toFixed(2)}</p>
    </div>
  ),
}));

// Mock the CouponInput component
jest.mock('../CouponInput', () => ({
  __esModule: true,
  default: ({ onApplyCoupon, isLoading, error, successMessage }: any) => (
    <div data-testid="coupon-input-mock">
      <input type="text" placeholder="Enter coupon code" />
      <button onClick={() => onApplyCoupon('TESTCODE')}>{isLoading ? 'Applying...' : 'Apply Coupon'}</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  ),
}));

const mockUpdateQuantity = jest.fn();
const mockRemoveItem = jest.fn();

const mockCartContext = {
  items: [] as CartItem[],
  addItem: jest.fn(),
  updateQuantity: mockUpdateQuantity,
  removeItem: mockRemoveItem,
  clearCart: jest.fn(),
};

describe('CartPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (useCart as jest.Mock).mockReturnValue(mockCartContext);
    mockUpdateQuantity.mockClear();
    mockRemoveItem.mockClear();
    // Clear localStorage as CartProvider uses it
    localStorage.clear();
  });

  test('displays message when cart is empty', () => {
    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    expect(screen.getByText('Your shopping cart is currently empty. Why not add some products?')).toBeInTheDocument();
    expect(screen.queryByTestId('cart-item-mock')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-summary-mock')).not.toBeInTheDocument();
  });

  test('renders cart items and summary when cart is not empty', () => {
    const testItems: CartItem[] = [
      { id: 'p1', name: 'Product A', price: 10.00, quantity: 2 },
      { id: 'p2', name: 'Product B', price: 20.00, quantity: 1 },
    ];
    mockCartContext.items = testItems;

    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    // Check if items are rendered (using mock component's testid)
    expect(screen.getAllByTestId('cart-item-mock')).toHaveLength(2);
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();

    // Check if cart summary is rendered
    expect(screen.getByTestId('cart-summary-mock')).toBeInTheDocument();
    // Subtotal should be (10*2) + (20*1) = 40
    expect(screen.getByText('Subtotal: $40.00')).toBeInTheDocument();
    // Total should be same as subtotal initially
    expect(screen.getByText('Total: $40.00')).toBeInTheDocument();
  });

  test('calls updateQuantity when increment button in mock item is clicked', () => {
    const testItems: CartItem[] = [{ id: 'p1', name: 'Product A', price: 10.00, quantity: 1 }];
    mockCartContext.items = testItems;

    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    const incButton = screen.getByRole('button', { name: 'Inc' });
    fireEvent.click(incButton);

    expect(mockUpdateQuantity).toHaveBeenCalledTimes(1);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('p1', 2);
  });

  test('calls removeItem when remove button in mock item is clicked', () => {
    const testItems: CartItem[] = [{ id: 'p1', name: 'Product A', price: 10.00, quantity: 1 }];
    mockCartContext.items = testItems;

    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    const removeButton = screen.getByRole('button', { name: 'Remove' });
    fireEvent.click(removeButton);

    expect(mockRemoveItem).toHaveBeenCalledTimes(1);
    expect(mockRemoveItem).toHaveBeenCalledWith('p1');
  });

  test('applies coupon and updates total', async () => {
    const testItems: CartItem[] = [
      { id: 'p1', name: 'Product A', price: 10.00, quantity: 2 }, // Subtotal 20.00
      { id: 'p2', name: 'Product B', price: 20.00, quantity: 1 }, // Subtotal 20.00 -> Total 40.00
    ];
    mockCartContext.items = testItems;

    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    // Find the coupon input and apply button within the mock
    const couponInput = screen.getByPlaceholderText('Enter coupon code');
    const applyButton = screen.getByRole('button', { name: 'Apply Coupon' });

    fireEvent.change(couponInput, { target: { value: 'SALE10' } });
    fireEvent.click(applyButton);

    // Wait for the mock API call and state update
    await waitFor(() => {
      expect(screen.getByText('Coupon: Applied 10% discount (4.00)!')).toBeInTheDocument();
      expect(screen.getByText('Total: $36.00')).toBeInTheDocument(); // 40.00 - 4.00
    });
  });

  test('displays error message for invalid coupon', async () => {
    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    const couponInput = screen.getByPlaceholderText('Enter coupon code');
    const applyButton = screen.getByRole('button', { name: 'Apply Coupon' });

    fireEvent.change(couponInput, { target: { value: 'INVALIDCODE' } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid coupon code. Please try again.')).toBeInTheDocument();
      expect(screen.queryByText('Total: $')).not.toBeInTheDocument(); // Ensure total isn't incorrectly updated
    });
  });

  test('persists cart items in localStorage and loads them on page load', () => {
    const initialCartItems: CartItem[] = [
      { id: 'p3', name: 'Product C', price: 15.00, quantity: 3 },
    ];
    // Simulate initial state from localStorage
    localStorage.setItem('cart', JSON.stringify({ items: initialCartItems }));

    // Mock useCart to return items directly, bypassing CartProvider's useEffect for initial load,
    // as CartProvider itself handles loading from localStorage.
    // In a real scenario, you'd test CartProvider's interaction with localStorage more directly,
    // but here we test CartPage's behavior when context provides items.
    // To properly test localStorage persistence, we'd need to render CartProvider.
    // For now, let's test CartPage assumes context has items.

    // Let's re-render CartProvider to test its localStorage load effect
    // Re-mocking useCart to ensure CartProvider is the source of truth
    const mockCartContextForProvider = {
        items: [], // Will be populated by CartProvider's effect
        addItem: jest.fn(),
        updateQuantity: jest.fn(),
        removeItem: jest.fn(),
        clearCart: jest.fn(),
    };
    (useCart as jest.Mock).mockReturnValue(mockCartContextForProvider);

    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    // Wait for localStorage to be read by CartProvider's useEffect
    return new Promise<void>(resolve => {
      setTimeout(() => { // Use setTimeout to allow effects to run
        expect(mockCartContextForProvider.items).toEqual(initialCartItems);
        expect(screen.getAllByTestId('cart-item-mock')).toHaveLength(1);
        expect(screen.getByText('Product C')).toBeInTheDocument();
        resolve();
      }, 100); // A small delay to ensure effects have time to run
    });
  });
});
