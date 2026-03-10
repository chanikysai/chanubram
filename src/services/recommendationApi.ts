// src/services/recommendationApi.ts
import { Product } from '../types/product';

// Mock product data - Reusing data from productApi.ts for consistency
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
  'p4': { // Added for more variety in recommendations
    id: 'p4',
    name: 'Fourth Item',
    description: 'An item that complements other products.',
    price: 75.20,
    imageUrl: '/path/to/fourth.jpg',
  },
  'p5': { // Added for more variety in recommendations
    id: 'p5',
    name: 'Fifth Product',
    description: 'A popular choice among our customers.',
    price: 150.00,
    imageUrl: '/path/to/fifth.jpg',
  },
};

// Helper to simulate network delay
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches product recommendations.
 * If productId is provided, it returns items similar to that product.
 * Otherwise, it returns a list of popular items.
 * @param productId Optional: The ID of the product to find similar recommendations for.
 * @returns A promise that resolves to an array of recommended Product objects.
 */
export const getRecommendations = async (productId?: string): Promise<Product[]> => {
  await simulateDelay(300); // Simulate network latency
  console.log(`API: Fetching recommendations. productId: ${productId || 'none'}`);

  let recommendations: Product[] = [];

  if (productId) {
    // Basic "customers who viewed this also viewed..." logic
    // For example, if viewing 'p1', recommend 'p2' and 'p4'
    // if viewing 'p2', recommend 'p1' and 'p5'
    switch (productId) {
      case 'p1':
        recommendations = [mockProducts['p2'], mockProducts['p4']];
        break;
      case 'p2':
        recommendations = [mockProducts['p1'], mockProducts['p5']];
        break;
      case 'p3':
        recommendations = [mockProducts['p4'], mockProducts['p5']];
        break;
      default:
        // For any other product, return a general popular list
        recommendations = [mockProducts['p1'], mockProducts['p2'], mockProducts['p3']];
        break;
    }
    console.log(`API: Recommendations for ${productId}:`, recommendations.map(p => p.id));
  } else {
    // Default: return popular items
    recommendations = [mockProducts['p1'], mockProducts['p2'], mockProducts['p3'], mockProducts['p5']];
    console.log('API: Returning popular recommendations:', recommendations.map(p => p.id));
  }

  // Ensure we don't return more than a reasonable number of recommendations
  return recommendations.slice(0, 4);
};

export const getPopularProducts = async (): Promise<Product[]> => {
  await simulateDelay(200);
  console.log('API: Fetching popular products');
  // For simplicity, popular products are a subset of all products
  const popular = [mockProducts['p1'], mockProducts['p2'], mockProducts['p3'], mockProducts['p5']];
  return popular.slice(0, 4);
};
