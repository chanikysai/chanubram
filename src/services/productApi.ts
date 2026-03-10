// src/services/productApi.ts
import { Product } from '../types/product';

// Mock product data
const mockProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'Stylish T-Shirt',
    description: 'A comfortable and stylish t-shirt made from 100% cotton.',
    price: 25.00,
    imageUrl: '/images/product1.jpg',
  },
  {
    id: 'prod_2',
    name: 'Comfortable Jeans',
    description: 'Durable and soft denim jeans for everyday wear.',
    price: 50.00,
    imageUrl: '/images/product2.jpg',
  },
  {
    id: 'prod_3',
    name: 'Classic Sneakers',
    description: 'Timeless sneakers perfect for any casual outfit.',
    price: 75.00,
    imageUrl: '/images/product3.jpg',
  },
  {
    id: 'prod_4',
    name: 'Leather Wallet',
    description: 'Genuine leather wallet with multiple card slots.',
    price: 30.00,
    imageUrl: '/images/product4.jpg',
  },
  {
    id: 'prod_5',
    name: 'Winter Jacket',
    description: 'Warm and waterproof jacket for cold weather.',
    price: 120.00,
    imageUrl: '/images/product5.jpg',
  },
];

export const getProductById = async (id: string): Promise<Product> => {
  console.log(`Mock API: Fetching product with ID ${id}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const product = mockProducts.find(p => p.id === id);
  if (!product) {
    throw new Error(`Product with ID ${id} not found.`);
  }
  return product;
};
