// src/services/productApi.ts
import { Product } from '../types/product';

// Mock product data
const mockProducts: Record<string, Product> = {
  'p1': {
    id: 'p1',
    name: 'Example Gadget',
    description: 'This is a wonderful gadget that does amazing things.',
    price: 99.99,
    imageUrl: '/path/to/gadget.jpg',
  },
  'p2': {
    id: 'p2',
    name: 'Another Item',
    description: 'A different product with unique features.',
    price: 49.50,
    imageUrl: '/path/to/item.jpg',
  },
  'p3': {
    id: 'p3',
    name: 'Third Product',
    description: 'This product is essential for your daily needs.',
    price: 25.00,
    imageUrl: '/path/to/third.jpg',
  },
};

// Helper to simulate network delay
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches a single product by its ID.
 * @param productId The ID of the product to fetch.
 * @returns A promise that resolves to a Product object.
 * @throws Error if the product is not found.
 */
export const getProductById = async (productId: string): Promise<Product> => {
  await simulateDelay(50); // Simulate network latency
  console.log(`API: Fetching product with ID \${productId}`);
  const product = mockProducts[productId];
  if (!product) {
    console.error(`API Error: Product with ID \${productId} not found.`);
    throw new Error('Product not found');
  }
  return product;
};
