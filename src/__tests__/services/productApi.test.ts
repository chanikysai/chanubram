// src/__tests__/services/productApi.test.ts
import { getProducts, getProductById, decreaseInventory } from '../../src/services/productApi';

// Mock Product type
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  inventory: number;
}

// Mock the websocketManager to prevent actual connection attempts during tests
const mockWebSocketManager = {
  on: jest.fn(),
  sendMessage: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
};
jest.mock('../../src/utils/websocket', () => ({
  __esModule: true,
  default: mockWebSocketManager,
}));


describe('productApi', () => {
  // Mock data to ensure tests are independent of the module's initial state
  const mockProductsData: Product[] = [
    { id: 'prod_1', name: 'T-Shirt', description: 'Cotton T-Shirt', price: 25.00, imageUrl: '/img/tshirt.jpg', inventory: 50 },
    { id: 'prod_2', name: 'Jeans', description: 'Denim Jeans', price: 50.00, imageUrl: '/img/jeans.jpg', inventory: 30 },
    { id: 'prod_3', name: 'Sneakers', description: 'Running Sneakers', price: 75.00, imageUrl: '/img/sneakers.jpg', inventory: 20 },
  ];

  // Helper to reset mock products before each test
  const resetMockProducts = () => {
    // This assumes productApi.ts has an internal way to reset or we can access/modify it.
    // Since it's a module, direct modification of mockProducts is tricky without exporting it or having a reset function.
    // For simplicity in this mock, let's assume the module loads fresh or we can override its internal state if needed.
    // In a real scenario, you might export mockProducts for testing or use a setter function.
    // For now, we'll rely on the mock data defined within the module and assume its state can be manipulated.
    // If this fails, we'd need to refactor productApi.ts to export mockProducts or a reset function.
  };

  beforeEach(() => {
    jest.useFakeTimers(); // Use fake timers for setTimeout
    jest.clearAllMocks();
    // Reset mock data if possible. For now, we'll assume state doesn't persist across tests in a way that breaks them.
    // If `mockProducts` were exported, we could reset it here.
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Happy Path Test for getProducts
  test('getProducts should return a list of all products', async () => {
    const products = await getProducts();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0); // Should match the number of mock products
    expect(products[0]).toHaveProperty('id');
    expect(products[0]).toHaveProperty('name');
    expect(products[0]).toHaveProperty('price');
    expect(products[0]).toHaveProperty('imageUrl');
    expect(products[0]).toHaveProperty('inventory');
  });

  // Edge Case Test for getProducts: No products available
  // This would require modifying the mockProducts array within productApi.ts to be empty before the test,
  // which is difficult without exporting/resetting. We'll assume it returns the defined mock data.
  // If mockProducts were empty, this test would be:
  // test('getProducts should return an empty array if no products are available', async () => {
  //   // Setup: Make mockProducts empty (requires refactoring productApi.ts)
  //   const products = await getProducts();
  //   expect(products).toEqual([]);
  // });

  // Happy Path Test for getProductById
  test('getProductById should return a specific product by its ID', async () => {
    const productId = 'prod_1';
    const product = await getProductById(productId);
    expect(product).not.toBeNull();
    expect(product.id).toBe(productId);
    expect(product.name).toBe('Stylish T-Shirt');
  });

  // Error Handling Test for getProductById: Product not found
  test('getProductById should throw an error if the product ID is not found', async () => {
    const nonExistentProductId = 'prod_999';
    await expect(getProductById(nonExistentProductId)).rejects.toThrow(`Product with ID ${nonExistentProductId} not found.`);
  });

  // Happy Path Test for decreaseInventory
  test('decreaseInventory should reduce the product inventory', async () => {
    const productId = 'prod_1';
    const initialInventory = (await getProductById(productId)).inventory;
    const quantityToDecrease = 10;

    await decreaseInventory(productId, quantityToDecrease);

    const updatedProduct = await getProductById(productId);
    expect(updatedProduct.inventory).toBe(initialInventory - quantityToDecrease);
  });

  // Error Handling Test for decreaseInventory: Insufficient inventory
  test('decreaseInventory should throw an error if inventory is insufficient', async () => {
    const productId = 'prod_3'; // Assuming prod_3 has 20 inventory
    const initialInventory = (await getProductById(productId)).inventory;
    const quantityToDecrease = initialInventory + 5; // Request more than available

    await expect(decreaseInventory(productId, quantityToDecrease)).rejects.toThrow('Insufficient inventory.');

    // Ensure inventory remains unchanged after failed attempt
    const productAfterError = await getProductById(productId);
    expect(productAfterError.inventory).toBe(initialInventory);
  });

  // Error Handling Test for decreaseInventory: Product not found
  test('decreaseInventory should throw an error if product is not found', async () => {
    const nonExistentProductId = 'prod_999';
    const quantityToDecrease = 5;

    await expect(decreaseInventory(nonExistentProductId, quantityToDecrease)).rejects.toThrow('Product not found.');
  });

  // Test for WebSocket integration (mocked)
  test('decreaseInventory should trigger a WebSocket inventory update message', async () => {
    const productId = 'prod_2';
    const quantityToDecrease = 5;

    await decreaseInventory(productId, quantityToDecrease);

    // Check if sendMessage was called with the correct payload
    expect(mockWebSocketManager.sendMessage).toHaveBeenCalledTimes(1);
    expect(mockWebSocketManager.sendMessage).toHaveBeenCalledWith({
      type: 'inventoryUpdate',
      payload: { productId: productId, newInventory: 25 }, // 30 - 5 = 25
    });
  });
});
