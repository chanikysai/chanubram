// src/types/product.ts
export interface Product {
    id: string;
    vendorId: string;
    name: string;
    description: string;
    price: number;
    inventory: number;
    imageUrl: string; // URL for the product image
    createdAt?: Date;
    updatedAt?: Date;
}
