// src/context/__tests__/CartContext.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CartProvider, useCart, CartItem } from '../CartContext';
import { Product } from '../../types/product';

// Mock the localStorage API
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Helper component to test the context
const MockCartConsumer: React.FC<{
  action: 'addItem' | 'removeItem' | 'updateQuantity' | 'clearCart' | 'getCart';
  productId?: string;
  quantity?: number;
  productToAdd?: Product;
}> = ({ action, productId, quantity, productToAdd }) => {
  const { items, addItem, removeItem, updateQuantity, clearCart } = useCart();

  const handleClick = () => {
    switch (action) {
      case 'addItem':
        if (productToAdd) addItem(productToAdd);
        break;
      case 'removeItem':
        if (productId) removeItem(productId);
        break;
      case 'updateQuantity':
        if (productId !== undefined && quantity !== undefined) updateQuantity(productId, quantity);
        break;
      case 'clearCart':
        clearCart();
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <button onClick={handleClick} data-testid={`test-button-${action}`}>
        {action}
      </button>
      <div data-testid="cart-items">
        {items.map((item) => (
          <div key={item.id}>
            {item.name} - Qty: {item.quantity} - Price: ${item.price}
          </div>
        ))}
      </div>
    </div>
  );
};

describe('CartProvider', () => {
  const product1: Product = { id: 'p1', name: 'Laptop', price: 1200.00 };
  const product2: Product = { id: 'p2', name: 'Mouse', price: 25.00 };

  beforeEach(() => {
    // Clear mocks and localStorage before each test
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  test('initializes with empty cart and loads from localStorage if available', () => {
    const initialItems: CartItem[] = [{ ...product1, quantity: 1 }];
    mockLocalStorage.setItem('cart', JSON.stringify({ items: initialItems }));

    render(
      <CartProvider>
        <MockCartConsumer action="getCart" />
      </CartProvider>
    );

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('cart');
    expect(screen.getByTestId('cart-items')).toHaveTextContent('Laptop - Qty: 1 - Price: $1200');
  });

  test('handles empty localStorage gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue(null); // Simulate no cart saved

    render(
      <CartProvider>
        <MockCartConsumer action="getCart" />
      </CartProvider>
    );

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('cart');
    expect(screen.getByTestId('cart-items')).toBeEmptyDOMElement();
  });

  test('adds a new item to the cart', () => {
    render(
      <CartProvider>
        <MockCartConsumer action="addItem" productToAdd={product1} />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId('test-button-addItem'));

    expect(screen.getByTestId('cart-items')).toHaveTextContent('Laptop - Qty: 1 - Price: $1200');
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify({ items: [{ ...product1, quantity: 1 }] }));
  });

  test('increments quantity if item already exists in cart', () => {
    // Manually set up initial state in the provider for this test
    const initialItems: CartItem[] = [{ ...product1, quantity: 1 }];
    const { rerender } = render(
      <CartProvider>
        <MockCartConsumer action="getCart" />
      </CartProvider>
    );

    // Add the same product again
    rerender(
      <CartProvider>
        <MockCartConsumer action="addItem" productToAdd={product1} />
      </CartProvider>
    );
    fireEvent.click(screen.getByTestId('test-button-addItem'));

    expect(screen.getByTestId('cart-items')).toHaveTextContent('Laptop - Qty: 2 - Price: $1200');
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1); // localStorage set only once for the combined state
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify({ items: [{ ...product1, quantity: 2 }] }));
  });

  test('removes an item from the cart', () => {
    const initialItems: CartItem[] = [{ ...product1, quantity: 2 }];
    mockLocalStorage.setItem('cart', JSON.stringify({ items: initialItems }));

    render(
      <CartProvider>
        <MockCartConsumer action="removeItem" productId={product1.id} />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId('test-button-removeItem'));

    expect(screen.getByTestId('cart-items')).toBeEmptyDOMElement();
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify({ items: [] }));
  });

  test('updates quantity of an item in the cart', () => {
    const initialItems: CartItem[] = [{ ...product1, quantity: 1 }];
    mockLocalStorage.setItem('cart', JSON.stringify({ items: initialItems }));

    render(
      <CartProvider>
        <MockCartConsumer action="updateQuantity" productId={product1.id} quantity={3} />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId('test-button-updateQuantity'));

    expect(screen.getByTestId('cart-items')).toHaveTextContent('Laptop - Qty: 3 - Price: $1200');
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify({ items: [{ ...product1, quantity: 3 }] }));
  });

  test('removes item if quantity is updated to 0', () => {
    const initialItems: CartItem[] = [{ ...product1, quantity: 1 }];
    mockLocalStorage.setItem('cart', JSON.stringify({ items: initialItems }));

    render(
      <CartProvider>
        <MockCartConsumer action="updateQuantity" productId={product1.id} quantity={0} />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId('test-button-updateQuantity'));

    expect(screen.getByTestId('cart-items')).toBeEmptyDOMElement();
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify({ items: [] }));
  });

  test('clears all items from the cart', () => {
    const initialItems: CartItem[] = [{ ...product1, quantity: 2 }, { ...product2, quantity: 1 }];
    mockLocalStorage.setItem('cart', JSON.stringify({ items: initialItems }));

    render(
      <CartProvider>
        <MockCartConsumer action="clearCart" />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId('test-button-clearCart'));

    expect(screen.getByTestId('cart-items')).toBeEmptyDOMElement();
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify({ items: [] }));
  });

  test('handles localStorage errors gracefully', async () => {
    // Simulate localStorage errors
    mockLocalStorage.setItem.mockImplementation(() => { throw new Error('Storage full'); });
    mockLocalStorage.getItem.mockImplementation(() => { throw new Error('Storage read error'); });

    // Test loading from localStorage
    render(
      <CartProvider>
        <MockCartConsumer action="getCart" />
      </CartProvider>
    );
    expect(console.error).toHaveBeenCalledWith('Failed to load cart from localStorage:', expect.any(Error));

    // Test saving to localStorage
    render(
      <CartProvider>
        <MockCartConsumer action="addItem" productToAdd={product1} />
      </CartProvider>
    );
    fireEvent.click(screen.getByTestId('test-button-addItem')); // This will trigger setItem
    expect(console.error).toHaveBeenCalledWith('Failed to save cart to localStorage:', expect.any(Error));
  });
});
