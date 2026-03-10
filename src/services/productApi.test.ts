// src/services/productApi.test.ts
import { getProductById } from './productApi';

describe('productApi', () => {
  // Happy Path: Get product by existing ID
  test('should return product details for a valid product ID', async () => {
    const productId = 'prod_1';
    const product = await getProductById(productId);

    expect(product).toBeDefined();
    expect(product.id).toBe(productId);
    expect(product.name).toBe('Stylish T-Shirt');
    expect(product.price).toBe(25.00);
    expect(product.imageUrl).toBe('/images/product1.jpg');
  });

  // Edge Case: Product ID not found
  test('should throw an error if product ID is not found', async () => {
    const nonExistentProductId = 'prod_999';
    await expect(getProductById(nonExistentProductId)).rejects.toThrow(`Product with ID ${nonExistentProductId} not found.`);
  });

  // Edge Case: Empty product ID (though likely handled by routing, good to test API robustness)
  test('should throw an error for an empty product ID', async () => {
    const emptyProductId = '';
    await expect(getProductById(emptyProductId)).rejects.toThrow('Product with ID  not found.');
  });
});
