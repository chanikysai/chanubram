import { Product } from '../types/product';

// Mock data for demonstration purposes. In a real app, this would come from an API.
let mockProducts: Product[] = [
  { id: 'prod-1', name: 'Laptop', description: 'High performance laptop', price: 1200, stock: 50 },
  { id: 'prod-2', name: 'Keyboard', description: 'Mechanical keyboard', price: 75, stock: 120 },
];
let nextId = 3;

export const getProducts = async (): Promise<Product[]> => {
  console.log('Fetching products...');
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...mockProducts]; // Return a copy to prevent direct mutation
};

export const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  console.log('Creating product:', productData);
  await new Promise(resolve => setTimeout(resolve, 300));
  const newProduct: Product = {
    id: `prod-${nextId++}`,
    ...productData,
  };
  mockProducts.push(newProduct);
  return newProduct;
};

export const updateProduct = async (productId: string, productData: Partial<Omit<Product, 'id'>>): Promise<Product> => {
  console.log(`Updating product ${productId}:`, productData);
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = mockProducts.findIndex(p => p.id === productId);
  if (index === -1) {
    throw new Error('Product not found');
  }
  mockProducts[index] = { ...mockProducts[index], ...productData };
  return mockProducts[index];
};

export const deleteProduct = async (productId: string): Promise<void> => {
  console.log(`Deleting product ${productId}...`);
  await new Promise(resolve => setTimeout(resolve, 300));
  const initialLength = mockProducts.length;
  mockProducts = mockProducts.filter(p => p.id !== productId);
  if (mockProducts.length === initialLength) {
    throw new Error('Product not found');
  }
};
