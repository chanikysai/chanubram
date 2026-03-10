// src/__tests__/context/CartContext.test.tsx
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CartProvider, useCart, CartItem } from '../../context/CartContext';
import { Product } from '../../types/product';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Helper component to consume context and expose functions for testing
const TestComponent: React.FC<{ productId?: string, productToAdd?: Product, quantityToUpdate?: number }> = ({
  productId,
  productToAdd,
  quantityToUpdate,
}) => {
  const { items, addItem, removeItem, updateQuantity, clearCart } = useCart();

  // Simulate actions based on props for specific tests
  React.useEffect(() => {
    if (productToAdd) {
      addItem(productToAdd);
    }
  }, [productToAdd, addItem]);

  React.useEffect(() => {
    if (productId && quantityToUpdate !== undefined) {
      updateQuantity(productId, quantityToUpdate);
    }
  }, [productId, quantityToUpdate, updateQuantity]);

  return (
    <div>
      <div data-testid="cart-items">
        {items.map((item) => (
          <div key={item.id} data-testid={`cart-item-${item.id}`}>
            {item.name} - Quantity: {item.quantity} - Price: {item.price}
          </div>
        ))}
      </div>
      <div data-testid="cart-count">{items.length}</div>
      <button onClick={() => productToAdd && addItem(productToAdd)} data-testid="add-item-button">
        Add Item
      </button>
      {productId && (
        <button onClick={() => removeItem(productId)} data-testid={`remove-item-${productId}`}>
          Remove Item {productId}
        </button>
      )}
      {productId && quantityToUpdate !== undefined && (
        <button onClick={() => updateQuantity(productId, quantityToUpdate)} data-testid={`update-quantity-${productId}`}>
          Update Quantity {productId} to {quantityToUpdate}
        </button>
      )}
      <button onClick={clearCart} data-testid="clear-cart-button">Clear Cart</button>
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    // Clear mock localStorage and reset mocks before each test
    mockLocalStorage.clear();
    jest.clearAllMocks();
    // Reset localStorage mock to default if it was modified by other tests
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });
  });

  // Happy Path: Add a new item to an empty cart
  test('should add a new item to the cart', () => {
    const product: Product = { id: '1', name: 'Laptop', price: 1200 };
    render(
      <CartProvider>
        <TestComponent productToAdd={product} />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.queryByTestId(`cart-item-${product.id}`)).toBeNull();

    // Simulate adding the item via the button for explicit action test
    fireEvent.click(screen.getByTestId('add-item-button'));

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    expect(screen.getByTestId(`cart-item-${product.id}`)).toHaveTextContent('Laptop - Quantity: 1 - Price: 1200');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify({ items: [{ ...product, quantity: 1 }] }));
  });

  // Edge Case: Add the same item multiple times
  test('should increase quantity when adding an existing item', () => {
    const product: Product = { id: '1', name: 'Laptop', price: 1200 };
    // Initial state with one item
    mockLocalStorage.setItem('cart', JSON.stringify({ items: [{ ...product, quantity: 1 }] }));

    render(
      <CartProvider>
        <TestComponent productToAdd={product} />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    expect(screen.getByTestId(`cart-item-${product.id}`)).toHaveTextContent('Laptop - Quantity: 1 - Price: 1200');

    // Add the same item again
    fireEvent.click(screen.getByTestId('add-item-button'));

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1'); // Still 1 item type, but quantity increased
    expect(screen.getByTestId(`cart-item-${product.id}`)).toHaveTextContent('Laptop - Quantity: 2 - Price: 1200');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify({ items: [{ ...product, quantity: 2 }] }));
  });

  // Happy Path: Remove an item from the cart
  test('should remove an item from the cart', () => {
    const product1: Product = { id: '1', name: 'Laptop', price: 1200 };
    const product2: Product = { id: '2', name: 'Mouse', price: 25 };
    const initialItems: CartItem[] = [
      { ...product1, quantity: 1 },
      { ...product2, quantity: 1 },
    ];
    mockLocalStorage.setItem('cart', JSON.stringify({ items: initialItems }));

    render(
      <CartProvider>
        <TestComponent productId="1" />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
    expect(screen.getByTestId('cart-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('cart-item-2')).toBeInTheDocument();

    // Remove the first item
    fireEvent.click(screen.getByTestId('remove-item-1'));

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    expect(screen.queryByTestId('cart-item-1')).toBeNull();
    expect(screen.getByTestId('cart-item-2')).toBeInTheDocument();
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify({ items: [{ ...product2, quantity: 1 }] }));
  });

  // Happy Path: Update quantity of an item
  test('should update the quantity of an item', () => {
    const product: Product = { id: '1', name: 'Laptop', price: 1200 };
    const initialItems: CartItem[] = [{ ...product, quantity: 1 }];
    mockLocalStorage.setItem('cart', JSON.stringify({ items: initialItems }));

    render(
      <CartProvider>
        <TestComponent productId="1" quantityToUpdate={3} />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Laptop - Quantity: 1 - Price: 1200');

    // Update quantity to 3
    fireEvent.click(screen.getByTestId('update-quantity-1'));

    expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Laptop - Quantity: 3 - Price: 1200');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify({ items: [{ ...product, quantity: 3 }] }));
  });

  // Edge Case: Update quantity to 0, should remove the item
  test('should remove item if quantity is updated to 0', () => {
    const product: Product = { id: '1', name: 'Laptop', price: 1200 };
    const initialItems: CartItem[] = [{ ...product, quantity: 1 }];
    mockLocalStorage.setItem('cart', JSON.stringify({ items: initialItems }));

    render(
      <CartProvider>
        <TestComponent productId="1" quantityToUpdate={0} />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    expect(screen.getByTestId('cart-item-1')).toBeInTheDocument();

    // Update quantity to 0
    fireEvent.click(screen.getByTestId('update-quantity-1'));

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.queryByTestId('cart-item-1')).toBeNull();
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify({ items: [] }));
  });

  // Edge Case: Load cart from localStorage
  test('should load cart items from localStorage on mount', () => {
    const product1: Product = { id: '1', name: 'Laptop', price: 1200 };
    const product2: Product = { id: '2', name: 'Mouse', price: 25 };
    const savedCartState = {
      items: [
        { ...product1, quantity: 2 },
        { ...product2, quantity: 1 },
      ],
    };
    mockLocalStorage.setItem('cart', JSON.stringify(savedCartState));

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
    expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Laptop - Quantity: 2 - Price: 1200');
    expect(screen.getByTestId('cart-item-2')).toHaveTextContent('Mouse - Quantity: 1 - Price: 25');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('cart');
  });

  // Error Handling: Corrupted localStorage
  test('should handle corrupted localStorage data gracefully', () => {
    // Simulate corrupted JSON in localStorage
    mockLocalStorage.setItem('cart', 'invalid json');

    // Spy on console.error to check if it's called
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Should not throw an error and should start with an empty cart
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load cart from localStorage:', expect.any(Error));

    consoleSpy.mockRestore(); // Restore console.error
  });

  // Happy Path: Clear cart
  test('should clear all items from the cart', () => {
    const product: Product = { id: '1', name: 'Laptop', price: 1200 };
    const initialItems: CartItem[] = [{ ...product, quantity: 1 }];
    mockLocalStorage.setItem('cart', JSON.stringify({ items: initialItems }));

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    expect(screen.getByTestId('cart-item-1')).toBeInTheDocument();

    // Clear the cart
    fireEvent.click(screen.getByTestId('clear-cart-button'));

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.queryByTestId('cart-item-1')).toBeNull();
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify({ items: [] }));
  });

  // Error Handling: localStorage save failure (e.g., quota exceeded)
  test('should handle localStorage save errors', () => {
    const product: Product = { id: '1', name: 'Laptop', price: 1200 };
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage quota exceeded');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <CartProvider>
        <TestComponent productToAdd={product} />
      </CartProvider>
    );

    // Attempt to add an item, which should trigger save
    fireEvent.click(screen.getByTestId('add-item-button'));

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1'); // State update should still work locally
    expect(consoleSpy).toHaveBeenCalledWith('Failed to save cart to localStorage:', expect.any(Error));

    consoleSpy.mockRestore();
  });
});
