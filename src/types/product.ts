// src/types/product.ts
// This file defines the Product interface.

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string; // Added description as it's used in ProductDetail
}
