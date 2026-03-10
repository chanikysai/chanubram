// src/__tests__/pages/CartPage.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CartPage from '../../pages/CartPage';
import { CartProvider, useCart, CartItem } from '../../context/CartContext';
import { Product } from '../../types/product';

// Mock custom hooks and components
jest.mock('../../context/CartContext');
jest.mock('../../components/CartItem');
jest.mock('../../components/CartSummary');

// Define mock functions and data
const mockUseCart = useCart as jest.Mock;
const MockCartItemComponent = CartItemComponent as jest.Mock;
const MockCartSummary = CartSummary as jest.Mock;

describe('CartPage', () => {
  const mockProduct1: Product = { id: '1', name: 'Laptop', price: 1200 };
  const mockProduct2: Product = { id: '2', name: 'Mouse', price: 25 };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Happy Path: Renders cart page with items
  test('should render cart items and summary when cart is not empty', () => {
    const mockCartItems: CartItem[] = [
      { ...mockProduct1, quantity: 1 },
      { ...mockProduct2, quantity: 2 },
    ];

    // Configure mock useCart hook
    mockUseCart.mockReturnValue({
      items: mockCartItems,
      updateQuantity: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(), // Needed by context but not directly used by page in this render
    });

    // Mock CartSummary to return a placeholder div for its content
    MockCartSummary.mockReturnValue(
      <div data-testid="mock-cart-summary">Mock Summary</div>
    );

    render(
      <CartProvider> {/* CartProvider is still needed to wrap context usage */}
        <CartPage />
      </CartProvider>
    );

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-cart-summary')).toBeInTheDocument();

    // Check if CartItemComponent was rendered for each item
    expect(MockCartItemComponent).toHaveBeenCalledTimes(mockCartItems.length);

    // Verify props passed to CartItemComponent
    expect(MockCartItemComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        item: mockCartItems[0],
        onUpdateQuantity: expect.any(Function),
        onRemove: expect.any(Function),
      }),
      {} // second argument to component (props)
    );
    expect(MockCartItemComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        item: mockCartItems[1],
        onUpdateQuantity: expect.any(Function),
        onRemove: expect.any(Function),
      }),
      {}
    );
  });

  // Edge Case: Renders cart page with empty cart
  test('should display a message when the cart is empty', () => {
    const mockCartItems: CartItem[] = [];

    mockUseCart.mockReturnValue({
      items: mockCartItems,
      updateQuantity: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
    });

    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    expect(screen.getByText('Your shopping cart is currently empty. Why not add some products?')).toBeInTheDocument();
    expect(MockCartItemComponent).not.toHaveBeenCalled(); // Should not render any CartItemComponent
    expect(MockCartSummary).not.toHaveBeenCalled(); // CartSummary should not be rendered if no items
  });

  // Happy Path: Interactions with CartItemComponent trigger context functions
  test('should call context functions when CartItemComponent actions are triggered', () => {
    const mockCartItems: CartItem[] = [{ ...mockProduct1, quantity: 1 }];
    const mockUpdateQuantity = jest.fn();
    const mockRemoveItem = jest.fn();

    mockUseCart.mockReturnValue({
      items: mockCartItems,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
      clearCart: jest.fn(),
    });

    // Mock CartItemComponent to simulate its internal event handlers calling its props
    MockCartItemComponent.mockImplementation(({ item, onUpdateQuantity, onRemove }) => (
      <div>
        {/* Simulate clicking "+" */}
        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>Plus</button>
        {/* Simulate clicking "-" */}
        <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>Minus</button>
        {/* Simulate clicking "Remove" */}
        <button onClick={() => onRemove(item.id)}>Remove</button>
      </div>
    ));

    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    // Find the buttons rendered by the mocked CartItemComponent
    const plusButton = screen.getByText('Plus');
    const minusButton = screen.getByText('Minus');
    const removeButton = screen.getByText('Remove');

    // Simulate clicking Plus
    fireEvent.click(plusButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith(mockProduct1.id, 2);

    // Simulate clicking Minus
    fireEvent.click(minusButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith(mockProduct1.id, 0);

    // Simulate clicking Remove
    fireEvent.click(removeButton);
    expect(mockRemoveItem).toHaveBeenCalledWith(mockProduct1.id);
  });

  // Error Handling: Although CartPage doesn't directly handle errors from context,
  // we ensure it renders correctly even if context returns empty state or errors
  // (this is implicitly tested by the empty cart case, but we can add a note).
  // If the context were to throw an error, the provider would catch it,
  // or if the page itself had error boundaries, they would be tested here.
  // For now, the empty state test covers graceful degradation.
});
