// src/services/productApi.ts
import { Product } from '../types/product';
import websocketManager from '../utils/websocket'; // Import the WebSocket manager

// Mock product data with inventory
let mockProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'Stylish T-Shirt',
    description: 'A comfortable and stylish t-shirt made from 100% cotton.',
    price: 25.00,
    imageUrl: '/images/product1.jpg',
    inventory: 50, // Initial stock level
  },
  {
    id: 'prod_2',
    name: 'Comfortable Jeans',
    description: 'Durable and soft denim jeans for everyday wear.',
    price: 50.00,
    imageUrl: '/images/product2.jpg',
    inventory: 30, // Initial stock level
  },
  {
    id: 'prod_3',
    name: 'Classic Sneakers',
    description: 'Timeless sneakers perfect for any casual outfit.',
    price: 75.00,
    imageUrl: '/images/product3.jpg',
    inventory: 20, // Initial stock level
  },
  {
    id: 'prod_4',
    name: 'Leather Wallet',
    description: 'Genuine leather wallet with multiple card slots.',
    price: 30.00,
    imageUrl: '/images/product4.jpg',
    inventory: 100, // Initial stock level
  },
  {
    id: 'prod_5',
    name: 'Winter Jacket',
    description: 'Warm and waterproof jacket for cold weather.',
    price: 120.00,
    imageUrl: '/images/product5.jpg',
    inventory: 15, // Initial stock level
  },
];

// Function to update inventory locally based on WebSocket messages
const updateInventoryLocally = (productId: string, newInventory: number) => {
  const productIndex = mockProducts.findIndex(p => p.id === productId);
  if (productIndex > -1) {
    mockProducts[productIndex].inventory = newInventory;
    console.log(`Product ${productId} inventory updated to ${newInventory}`);
    // In a real app, you'd also update state management here to reflect changes in UI
  }
};

// Setup WebSocket listener for inventory updates when the module loads
websocketManager.on('inventoryUpdate', (data: { productId: string, newInventory: number }) => {
  if (data && data.productId && typeof data.newInventory === 'number') {
    updateInventoryLocally(data.productId, data.newInventory);
  }
});

// Ensure WebSocket connection is open (or attempting to connect)
// The WebSocketManager constructor already calls connect()
// If we needed to explicitly ensure connection here for service usage:
// websocketManager.connect(); // This is called in the constructor, so not strictly needed here again.

export const getProductById = async (id: string): Promise<Product> => {
  console.log(`Mock API: Fetching product with ID ${id}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const product = mockProducts.find(p => p.id === id);
  if (!product) {
    throw new Error(`Product with ID ${id} not found.`);
  }
  // Return product with its current inventory (could be updated by WebSocket)
  return product;
};

// Helper function to simulate decreasing inventory for testing purposes (e.g., when an order is placed)
// In a real app, this logic would be in the backend.
export const decreaseInventory = async (productId: string, quantity: number): Promise<void> => {
  console.log(`Simulating backend inventory decrease for ${productId} by ${quantity}`);
  const productIndex = mockProducts.findIndex(p => p.id === productId);
  if (productIndex > -1) {
    const currentInventory = mockProducts[productIndex].inventory;
    if (currentInventory >= quantity) {
      mockProducts[productIndex].inventory -= quantity;
      console.log(`Local inventory for ${productId} is now ${mockProducts[productIndex].inventory}`);
      // Simulate broadcasting update via WebSocket
      const updatedProduct = mockProducts[productIndex];
      websocketManager.sendMessage({
        type: 'inventoryUpdate',
        payload: { productId: updatedProduct.id, newInventory: updatedProduct.inventory },
      });
    } else {
      console.error(`Insufficient inventory for ${productId}. Requested: ${quantity}, Available: ${currentInventory}`);
      throw new Error('Insufficient inventory.');
    }
  } else {
    console.error(`Product ${productId} not found for inventory decrease.`);
    throw new Error('Product not found.');
  }
};
