// src/services/__tests__/productApi.test.ts
import { getProductById, decreaseInventory } from '../productApi';
import websocketManager from '../../utils/websocket'; // Import to mock it

// Mock the websocketManager
jest.mock('../../utils/websocket', () => ({
  __esModule: true,
  default: {
    on: jest.fn(),
    sendMessage: jest.fn(),
    close: jest.fn(),
  },
}));

// Mock WebSocketManager instance
const mockWebsocketManager = websocketManager as jest.Mocked<typeof websocketManager>;

describe('productApi', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Resetting module registry to ensure fresh import of productApi
    // This is important because productApi might have state (like mockProducts)
    // that persists between tests if not re-imported.
    jest.resetModules();

    // Re-mock websocketManager after resetting modules
    jest.mock('../../utils/websocket', () => ({
      __esModule: true,
      default: {
        on: jest.fn(),
        sendMessage: jest.fn(),
        close: jest.fn(),
      },
    }));
    // @ts-ignore - Re-assign mock after reset
    const { default: wsManager } = require('../../utils/websocket');
    // @ts-ignore - Re-assign mock
    mockWebsocketManager.on = wsManager.on;
    // @ts-ignore
    mockWebsocketManager.sendMessage = wsManager.sendMessage;
    // @ts-ignore
    mockWebsocketManager.close = wsManager.close;
  });

  // Mock the Product type for type checking within tests, though not strictly needed for API tests
  // import { Product } from '../../types/product';

  // Helper to simulate receiving a WebSocket inventory update
  const simulateInventoryUpdate = (productId: string, newInventory: number) => {
    // Find the listener registered for 'inventoryUpdate'
    const onInventoryUpdateListener = mockWebsocketManager.on.mock.calls.find(
      (call) => call[0] === 'inventoryUpdate'
    );
    if (onInventoryUpdateListener) {
      const listenerFn = onInventoryUpdateListener[1]; // The callback function
      listenerFn({ productId, newInventory }); // Execute the listener
    } else {
      throw new Error('inventoryUpdate listener not found');
    }
  };

  // Test case 1: Fetching a product by ID
  test('getProductById should return a product with its inventory', async () => {
    const product = await getProductById('prod_1');
    expect(product).toBeDefined();
    expect(product.id).toBe('prod_1');
    expect(product.name).toBe('Stylish T-Shirt');
    expect(product.inventory).toBe(50); // Initial inventory
  });

  // Test case 2: Fetching a non-existent product
  test('getProductById should throw an error if product not found', async () => {
    await expect(getProductById('non_existent_prod')).rejects.toThrow('Product with ID non_existent_prod not found.');
  });

  // Test case 3: decreaseInventory reduces inventory and broadcasts update (happy path)
  test('decreaseInventory should reduce inventory and broadcast via WebSocket', async () => {
    const productId = 'prod_1';
    const initialInventory = 50;
    const quantityToDecrease = 10;

    // First, get the product to confirm its initial state
    const initialProduct = await getProductById(productId);
    expect(initialProduct.inventory).toBe(initialInventory);

    // Call decreaseInventory
    await decreaseInventory(productId, quantityToDecrease);

    // Verify inventory is decreased locally
    const updatedProduct = await getProductById(productId); // Fetch again to see updated mock state
    expect(updatedProduct.inventory).toBe(initialInventory - quantityToDecrease);

    // Verify sendMessage was called with the correct update payload
    expect(mockWebsocketManager.sendMessage).toHaveBeenCalledTimes(1);
    expect(mockWebsocketManager.sendMessage).toHaveBeenCalledWith({
      type: 'inventoryUpdate',
      payload: { productId: productId, newInventory: initialInventory - quantityToDecrease },
    });
  });

  // Test case 4: decreaseInventory throws error if insufficient inventory
  test('decreaseInventory should throw an error if inventory is insufficient', async () => {
    const productId = 'prod_1';
    const initialInventory = 50;
    const quantityToDecrease = 60; // More than available

    // Ensure initial state is correct
    const initialProduct = await getProductById(productId);
    expect(initialProduct.inventory).toBe(initialInventory);

    // Expect the call to throw an error
    await expect(decreaseInventory(productId, quantityToDecrease)).rejects.toThrow('Insufficient inventory.');

    // Verify inventory was NOT decreased
    const productAfterFailedAttempt = await getProductById(productId);
    expect(productAfterFailedAttempt.inventory).toBe(initialInventory);

    // Verify sendMessage was NOT called
    expect(mockWebsocketManager.sendMessage).not.toHaveBeenCalled();
  });

  // Test case 5: Product inventory is updated locally when WebSocket message is received
  test('getProductById should return updated inventory after WebSocket message', async () => {
    const productId = 'prod_1';
    const initialInventory = 50;
    const newInventory = 35;

    // Get initial product state
    let product = await getProductById(productId);
    expect(product.inventory).toBe(initialInventory);

    // Simulate a WebSocket message arriving
    simulateInventoryUpdate(productId, newInventory);

    // Fetch the product again to see if it reflects the update
    // Note: The mockProducts array is modified directly by the listener, so subsequent calls to getProductById will reflect this.
    product = await getProductById(productId);
    expect(product.inventory).toBe(newInventory);
  });

  // Test case 6: decreaseInventory handles non-existent product gracefully (should throw error)
  test('decreaseInventory should throw an error for non-existent product', async () => {
    const nonExistentProductId = 'prod_999';
    const quantity = 5;

    await expect(decreaseInventory(nonExistentProductId, quantity)).rejects.toThrow('Product not found.');
    expect(mockWebsocketManager.sendMessage).not.toHaveBeenCalled();
  });
});
