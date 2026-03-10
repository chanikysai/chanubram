import React, { createContext, useContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';

const CART_STORAGE_KEY = 'shoppingCart';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Assuming Product type is available in ../types/product and has id, name, price
// interface Product {
//   id: string;
//   name: string;
//   price: number;
//   // potentially other fields
// }

interface State {
  cartItems: CartItem[];
}

type Action =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'UPDATE_ITEM_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const initialState: State = {
  cartItems: [],
};

const cartReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOAD_CART':
      return { ...state, cartItems: action.payload };
    case 'ADD_ITEM': {
      const existingItemIndex = state.cartItems.findIndex(item => item.id === action.payload.id);
      if (existingItemIndex > -1) {
        const updatedItems = [...state.cartItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
        return { ...state, cartItems: updatedItems };
      }
      return {
        ...state,
        cartItems: [...state.cartItems, { ...action.payload, quantity: 1 }],
      };
    }
    case 'UPDATE_ITEM_QUANTITY': {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, cartItems: state.cartItems.filter(item => item.id !== itemId) };
      }
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        ),
      };
    }
    case 'REMOVE_ITEM': {
      return { ...state, cartItems: state.cartItems.filter(item => item.id !== action.payload.itemId) };
    }
    case 'CLEAR_CART':
      return { ...state, cartItems: [] };
    default:
      return state;
  }
};

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  // addItem is used by ProductCard.tsx which passes a Product object
  addItem: (product: { id: string; name: string; price: number }) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(storedCart) });
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      // Optionally clear localStorage if it's corrupted
      // localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cartItems));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [state.cartItems]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  // addItem is intended to be called from components like ProductCard
  // It takes a product object and dispatches the ADD_ITEM action.
  const addItem = (product: { id: string; name: string; price: number }) => {
    // Map the product to the structure expected by ADD_ITEM action
    const newItemPayload = {
      id: product.id,
      name: product.name,
      price: product.price,
    };
    dispatch({ type: 'ADD_ITEM', payload: newItemPayload });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_ITEM_QUANTITY', payload: { itemId, quantity } });
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalItems = () => {
    return state.cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const value: CartContextType = {
    cartItems: state.cartItems,
    addToCart,
    addItem, // Expose addItem
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
