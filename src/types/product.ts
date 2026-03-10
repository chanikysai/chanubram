// src/types/product.ts
export interface Product {
  id: string;
  name: string;
  description?: string; // Added description for ProductDetail
  price: number;
  imageUrl?: string; // Added imageUrl for ProductCard and ProductDetail
  inventory: number; // Add inventory field for real-time updates
  // Add other relevant product properties as needed
}
