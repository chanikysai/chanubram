// src/context/CartContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Product } from '../types/product';

// Define the structure of an item in the cart
export interface CartItem extends Product {
  quantity: number;
}

// Define the shape of the cart state
interface CartState {
  items: CartItem[];
}

// Define the shape of the context value
interface CartContextType extends CartState {
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void; // Added clearCart for completeness
}

// Default initial state
const initialCartState: CartState = {
  items: [],
};

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartState, setCartState] = useState<CartState>(initialCartState);

  // Load cart from localStorage on initial mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart: CartState = JSON.parse(savedCart);
        // Ensure items are valid before setting state
        if (parsedCart && Array.isArray(parsedCart.items)) {
          setCartState({ items: parsedCart.items });
        }
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
        // Optionally clear localStorage if corrupted
        // localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever cartState changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartState));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cartState]);

  const addItem = (product: Product) => {
    setCartState((prevState) => {
      const existingItemIndex = prevState.items.findIndex(item => item.id === product.id);
      let newItems;

      if (existingItemIndex > -1) {
        // Product already exists, increase quantity
        newItems = [...prevState.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1,
        };
      } else {
        // Add new product to cart
        newItems = [...prevState.items, { ...product, quantity: 1 }];
      }
      return { items: newItems };
    });
  };

  const removeItem = (productId: string) => {
    setCartState((prevState) => ({
      items: prevState.items.filter(item => item.id !== productId),
    }));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      // If quantity is 0 or less, remove the item
      removeItem(productId);
      return;
    }
    setCartState((prevState) => ({
      items: prevState.items.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ),
    }));
  };

  const clearCart = () => {
    setCartState(initialCartState);
  };

  const contextValue: CartContextType = {
    ...cartState,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

// Custom hook to use the CartContext
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
