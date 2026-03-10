// src/services/vendorApi.ts
import { Product } from '../types/product';

// Mock API functions for vendor-specific operations
// In a real application, these would interact with a backend API.
export const vendorApi = {
    // Simulate fetching products for the logged-in vendor
    getProducts: async (): Promise<Product[]> => {
        console.log('vendorApi.getProducts called');
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Return dummy data
        return [
            { id: 'prod_1', vendorId: 'vendor_abc', name: 'Gourmet Coffee Beans', description: '1kg bag of premium Arabica beans.', price: 25.99, inventory: 150, imageUrl: 'https://via.placeholder.com/150/coffee.png' },
            { id: 'prod_2', vendorId: 'vendor_abc', name: 'Artisan Ceramic Mug', description: 'Handcrafted ceramic mug with unique glaze.', price: 18.50, inventory: 75, imageUrl: 'https://via.placeholder.com/150/mug.png' },
            { id: 'prod_3', vendorId: 'vendor_abc', name: 'Organic Green Tea', description: '25 tea bags of soothing organic green tea.', price: 12.00, inventory: 200, imageUrl: 'https://via.placeholder.com/150/tea.png' },
        ];
    },

    // Simulate creating a new product
    createProduct: async (productData: Omit<Product, 'id' | 'vendorId'>): Promise<Product> => {
        console.log('vendorApi.createProduct called with:', productData);
        await new Promise(resolve => setTimeout(resolve, 500));
        const newProduct: Product = {
            id: `prod_\${Math.random().toString(36).substring(7)}`, // Generate a fake ID
            vendorId: 'vendor_abc', // Assume logged-in vendor ID
            ...productData,
            // Ensure price and inventory are correctly typed
            price: typeof productData.price === 'number' ? productData.price : parseFloat(productData.price as any),
            inventory: typeof productData.inventory === 'number' ? productData.inventory : parseInt(productData.inventory as any, 10),
            imageUrl: productData.imageUrl || 'https://via.placeholder.com/150/default.png', // Use placeholder if none provided
        };
        console.log('Created product:', newProduct);
        return newProduct;
    },

    // Simulate updating an existing product
    updateProduct: async (productId: string, productData: Partial<Omit<Product, 'id' | 'vendorId'>>): Promise<Product> => {
        console.log(`vendorApi.updateProduct called for \${productId} with:`, productData);
        await new Promise(resolve => setTimeout(resolve, 500));
        // Simulate finding and updating the product
        const updatedProduct: Product = {
            id: productId,
            vendorId: 'vendor_abc', // Assume vendorId remains the same
            name: productData.name !== undefined ? productData.name : 'Old Name',
            description: productData.description !== undefined ? productData.description : 'Old Description',
            price: productData.price !== undefined ? parseFloat(productData.price as any) : 0,
            inventory: productData.inventory !== undefined ? parseInt(productData.inventory as any, 10) : 0,
            imageUrl: productData.imageUrl || 'https://via.placeholder.com/150/default.png',
        };
        console.log('Updated product:', updatedProduct);
        return updatedProduct;
    },

    // Simulate deleting a product
    deleteProduct: async (productId: string): Promise<void> => {
        console.log(`vendorApi.deleteProduct called for \${productId}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`Product \${productId} simulated deletion.`);
    },
};
