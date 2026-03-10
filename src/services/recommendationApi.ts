// src/services/recommendationApi.ts

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
}

// Mock data for recommendations
const mockProducts: Product[] = [
  { id: 'prod_1', name: 'Stylish T-Shirt', imageUrl: '/images/product1.jpg', price: 25 },
  { id: 'prod_2', name: 'Comfortable Jeans', imageUrl: '/images/product2.jpg', price: 50 },
  { id: 'prod_3', name: 'Classic Sneakers', imageUrl: '/images/product3.jpg', price: 75 },
  { id: 'prod_4', name: 'Leather Wallet', imageUrl: '/images/product4.jpg', price: 30 },
  { id: 'prod_5', name: 'Winter Jacket', imageUrl: '/images/product5.jpg', price: 120 },
];

// Simple "customers who viewed this also viewed..." logic
const productViewMap: { [key: string]: string[] } = {
  'prod_1': ['prod_2', 'prod_4'],
  'prod_2': ['prod_1', 'prod_3'],
  'prod_3': ['prod_2', 'prod_5'],
  'prod_4': ['prod_1'],
  'prod_5': ['prod_3'],
};

export const getRecommendations = async (productId: string): Promise<Product[]> => {
  console.log(`Fetching recommendations for product ID: ${productId}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const recommendedIds = productViewMap[productId] || [];
  const recommendations = recommendedIds
    .map(id => mockProducts.find(p => p.id === id))
    .filter((p): p is Product => p !== undefined); // Type guard

  // Fallback: If no specific recommendations, return popular items or a subset
  if (recommendations.length === 0 && mockProducts.length > 0) {
    // Return first few products as popular if no specific recommendations
    return mockProducts.slice(0, 3).filter(p => p.id !== productId);
  }

  return recommendations.filter(p => p.id !== productId); // Ensure no self-recommendation
};
