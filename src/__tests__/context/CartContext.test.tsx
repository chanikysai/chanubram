import React, { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart, CartItem } from '../context/CartContext'; // Assuming CartContext.tsx is in ../context/

// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
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

const CART_STORAGE_KEY = 'shoppingCart';

describe('CartContext', () => {
  beforeEach(() => {
    // Clear mock localStorage and reset mocks before each test
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    // Clear module cache to ensure fresh load of context
    jest.resetModules();
    // Re-import after reset if needed, or ensure the context is defined in a way that gets re-evaluated
    // For simplicity here, we assume the context file itself isn't cached in a way that prevents re-initialization.
    // If not, we might need to do more complex module mocking.
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );

  // Test 1: Initial state and localStorage loading (happy path)
  test('should initialize with empty cart or load from localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.cartItems).toEqual([]);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith(CART_STORAGE_KEY);

    // Test loading from localStorage
    const initialCartData: CartItem[] = [
      { id: '1', name: 'Test Item 1', price: 10, quantity: 2 },
    ];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(initialCartData));

    // Re-render hook to simulate re-initialization after localStorage is set
    const { result: resultWithStorage } = renderHook(() => useCart(), { wrapper });
    expect(resultWithStorage.current.cartItems).toEqual(initialCartData);
    expect(resultWithStorage.current.getTotalItems()).toBe(2);
    expect(resultWithStorage.current.getTotalPrice()).toBe(20);
  });

  // Test 2: Add item to cart (happy path using addToCart)
  test('should add a new item to the cart using addToCart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const newItem = { id: 'prod-1', name: 'Product A', price: 100 };

    act(() => {
      result.current.addToCart(newItem);
    });

    expect(result.current.cartItems.length).toBe(1);
    expect(result.current.cartItems[0]).toEqual({ ...newItem, quantity: 1 });
    expect(result.current.getTotalItems()).toBe(1);
    expect(result.current.getTotalPrice()).toBe(100);
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1); // Called on first add
  });

  // Test 3: Add existing item (should increment quantity using addToCart)
  test('should increment quantity if item already exists in cart using addToCart', () => {
    const initialCartData: CartItem[] = [{ id: 'prod-1', name: 'Product A', price: 100, quantity: 1 }];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(initialCartData));

    const { result } = renderHook(() => useCart(), { wrapper });
    const existingItem = { id: 'prod-1', name: 'Product A', price: 100 }; // Price shouldn't change on re-add

    act(() => {
      result.current.addToCart(existingItem);
    });

    expect(result.current.cartItems.length).toBe(1);
    expect(result.current.cartItems[0].quantity).toBe(2);
    expect(result.current.getTotalItems()).toBe(2);
    expect(result.current.getTotalPrice()).toBe(200);
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2); // One for load, one for add
  });

  // Test 4: addItem to cart (happy path) - New test for the addItem function
  test('should add a new item to the cart using addItem', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const newProduct = { id: 'prod-prod1', name: 'Sample Product', price: 75 };

    act(() => {
      result.current.addItem(newProduct);
    });

    expect(result.current.cartItems.length).toBe(1);
    expect(result.current.cartItems[0]).toEqual({ ...newProduct, quantity: 1 });
    expect(result.current.getTotalItems()).toBe(1);
    expect(result.current.getTotalPrice()).toBe(75);
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
  });

  // Test 5: addItem to cart - increment quantity if item already exists
  test('should increment quantity if item already exists in cart using addItem', () => {
    const initialCartData: CartItem[] = [{ id: 'prod-prod1', name: 'Sample Product', price: 75, quantity: 1 }];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(initialCartData));

    const { result } = renderHook(() => useCart(), { wrapper });
    const existingProduct = { id: 'prod-prod1', name: 'Sample Product', price: 75 };

    act(() => {
      result.current.addItem(existingProduct);
    });

    expect(result.current.cartItems.length).toBe(1);
    expect(result.current.cartItems[0].quantity).toBe(2);
    expect(result.current.getTotalItems()).toBe(2);
    expect(result.current.getTotalPrice()).toBe(150);
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
  });

  // Test 6: Update item quantity (happy path - increase)
  test('should update item quantity correctly when increasing', () => {
    const initialCartData: CartItem[] = [{ id: 'prod-1', name: 'Product A', price: 100, quantity: 1 }];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(initialCartData));

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.updateQuantity('prod-1', 3);
    });

    expect(result.current.cartItems.length).toBe(1);
    expect(result.current.cartItems[0].quantity).toBe(3);
    expect(result.current.getTotalItems()).toBe(3);
    expect(result.current.getTotalPrice()).toBe(300);
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
  });

  // Test 7: Update item quantity (happy path - decrease)
  test('should update item quantity correctly when decreasing', () => {
    const initialCartData: CartItem[] = [{ id: 'prod-1', name: 'Product A', price: 100, quantity: 3 }];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(initialCartData));

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.updateQuantity('prod-1', 1);
    });

    expect(result.current.cartItems.length).toBe(1);
    expect(result.current.cartItems[0].quantity).toBe(1);
    expect(result.current.getTotalItems()).toBe(1);
    expect(result.current.getTotalPrice()).toBe(100);
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
  });

  // Test 8: Update item quantity to zero (edge case - removes item)
  test('should remove item if quantity is updated to zero or less', () => {
    const initialCartData: CartItem[] = [{ id: 'prod-1', name: 'Product A', price: 100, quantity: 1 }];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(initialCartData));

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.updateQuantity('prod-1', 0);
    });

    expect(result.current.cartItems.length).toBe(0);
    expect(result.current.getTotalItems()).toBe(0);
    expect(result.current.getTotalPrice()).toBe(0);
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
  });

  // Test 9: Update quantity for non-existent item (edge case)
  test('should do nothing if updating quantity for a non-existent item', () => {
    const initialCartData: CartItem[] = [{ id: 'prod-1', name: 'Product A', price: 100, quantity: 1 }];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(initialCartData));

    const { result } = renderHook(() => useCart(), { wrapper });
    const initialCartLength = result.current.cartItems.length;
    const initialTotalItems = result.current.getTotalItems();
    const initialTotalPrice = result.current.getTotalPrice();

    act(() => {
      result.current.updateQuantity('non-existent-id', 5);
    });

    expect(result.current.cartItems.length).toBe(initialCartLength);
    expect(result.current.cartItems[0].quantity).toBe(1); // Original item unchanged
    expect(result.current.getTotalItems()).toBe(initialTotalItems);
    expect(result.current.getTotalPrice()).toBe(initialTotalPrice);
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1); // Only for initial load
  });

  // Test 10: Remove item from cart (happy path)
  test('should remove an item from the cart', () => {
    const initialCartData: CartItem[] = [
      { id: 'prod-1', name: 'Product A', price: 100, quantity: 1 },
      { id: 'prod-2', name: 'Product B', price: 50, quantity: 2 },
    ];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(initialCartData));

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.removeItem('prod-1');
    });

    expect(result.current.cartItems.length).toBe(1);
    expect(result.current.cartItems.find(item => item.id === 'prod-1')).toBeUndefined();
    expect(result.current.cartItems[0].id).toBe('prod-2');
    expect(result.current.getTotalItems()).toBe(2);
    expect(result.current.getTotalPrice()).toBe(100); // 50 * 2
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
  });

  // Test 11: Remove non-existent item (edge case)
  test('should do nothing if removing a non-existent item', () => {
    const initialCartData: CartItem[] = [{ id: 'prod-1', name: 'Product A', price: 100, quantity: 1 }];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(initialCartData));

    const { result } = renderHook(() => useCart(), { wrapper });
    const initialCartLength = result.current.cartItems.length;
    const initialTotalItems = result.current.getTotalItems();
    const initialTotalPrice = result.current.getTotalPrice();

    act(() => {
      result.current.removeItem('non-existent-id');
    });

    expect(result.current.cartItems.length).toBe(initialCartLength);
    expect(result.current.cartItems[0].id).toBe('prod-1');
    expect(result.current.getTotalItems()).toBe(initialTotalItems);
    expect(result.current.getTotalPrice()).toBe(initialTotalPrice);
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1); // Only for initial load
  });

  // Test 12: Clear cart (happy path - with items)
  test('should clear all items from the cart', () => {
    const initialCartData: CartItem[] = [
      { id: 'prod-1', name: 'Product A', price: 100, quantity: 1 },
      { id: 'prod-2', name: 'Product B', price: 50, quantity: 2 },
    ];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(initialCartData));

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cartItems.length).toBe(0);
    expect(result.current.getTotalItems()).toBe(0);
    expect(result.current.getTotalPrice()).toBe(0);
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2); // One for load, one for clear
  });

  // Test 13: Clear cart (happy path - empty cart)
  test('should do nothing if clearing an already empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const initialCartLength = result.current.cartItems.length;
    const initialTotalItems = result.current.getTotalItems();
    const initialTotalPrice = result.current.getTotalPrice();

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cartItems.length).toBe(initialCartLength);
    expect(result.current.getTotalItems()).toBe(initialTotalItems);
    expect(result.current.getTotalPrice()).toBe(initialTotalPrice);
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(0); // No change, so no setItem
  });

  // Test 14: localStorage save failure (error handling)
  test('should handle localStorage save errors gracefully', () => {
    const originalLocalStorageSetItem = mockLocalStorage.setItem;
    mockLocalStorage.setItem.mockImplementation((key, value) => {
      throw new Error('localStorage quota exceeded');
    });
    // Suppress console.error for cleaner test output
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart({ id: 'prod-1', name: 'Product A', price: 100 });
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to save cart to localStorage:', expect.any(Error));
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1); // It attempts to set

    // Restore original function
    mockLocalStorage.setItem.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // Test 15: localStorage load failure (error handling)
  test('should handle localStorage load errors gracefully', () => {
    // Suppress console.error for cleaner test output
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockLocalStorage.getItem.mockImplementation((key) => {
      throw new Error('localStorage access denied');
    });

    // Re-rendering to trigger useEffect that loads from storage
    renderHook(() => useCart(), { wrapper });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load cart from localStorage:', expect.any(Error));
    expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(1);

    // Restore original function
    mockLocalStorage.getItem.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
