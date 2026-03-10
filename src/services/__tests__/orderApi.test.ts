// src/services/__tests__/orderApi.test.ts
import { placeOrder, getOrderHistory, getOrderById } from '../orderApi';
import { decreaseInventory } from '../productApi'; // Import to mock it
import { v4 as uuidv4 } from 'uuid'; // Import to mock it

// Mock dependencies
jest.mock('../productApi', () => ({
  decreaseInventory: jest.fn(),
}));
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

// Cast mocks for type safety
const mockDecreaseInventory = decreaseInventory as jest.Mock;
const mockUuidv4 = uuidv4 as jest.Mock;

describe('orderApi', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Resetting module registry to ensure fresh import of orderApi
    // This is important because orderApi might have state (like mockOrders)
    // that persists between tests if not re-imported.
    jest.resetModules();

    // Re-mock dependencies after resetting modules
    jest.mock('../productApi', () => ({
      decreaseInventory: jest.fn(),
    }));
    jest.mock('uuid', () => ({
      v4: jest.fn(),
    }));

    // Re-assign mocks after reset
    // @ts-ignore
    const { decreaseInventory: di } = require('../productApi');
    // @ts-ignore
    const { v4: u4 } = require('uuid');
    // @ts-ignore
    mockDecreaseInventory.mockClear();
    mockDecreaseInventory.mockImplementation(di.mockImplementation); // Restore original implementation if needed, but we'll override
    // @ts-ignore
    mockUuidv4.mockClear();
    mockUuidv4.mockImplementation(u4.mockImplementation); // Restore original implementation if needed, but we'll override
  });

  // Test case 1: Successful order placement with sufficient inventory
  test('placeOrder should successfully place an order and decrease inventory', async () => {
    // Mock decreaseInventory to succeed for all items
    mockDecreaseInventory.mockResolvedValue(undefined);
    // Mock uuidv4 for predictable order ID
    mockUuidv4.mockReturnValue('mock-order-id-123');

    const orderDetails = {
      items: [
        { productId: 'prod_1', name: 'Stylish T-Shirt', quantity: 2, price: 25.00 },
        { productId: 'prod_2', name: 'Comfortable Jeans', quantity: 1, price: 50.00 },
      ],
      shippingAddress: '123 Test St',
      paymentMethod: 'Credit Card',
    };

    const placedOrder = await placeOrder(orderDetails);

    // Verify decreaseInventory was called for each item
    expect(mockDecreaseInventory).toHaveBeenCalledTimes(2);
    expect(mockDecreaseInventory).toHaveBeenCalledWith('prod_1', 2);
    expect(mockDecreaseInventory).toHaveBeenCalledWith('prod_2', 1);

    // Verify uuidv4 was called to generate an ID
    expect(mockUuidv4).toHaveBeenCalledTimes(1);

    // Verify the returned order details are correct
    expect(placedOrder).toBeDefined();
    expect(placedOrder.id).toBe('ord_mock-order-id-123'); // Based on mockUuidv4
    expect(placedOrder.status).toBe('Processing');
    expect(placedOrder.totalAmount).toBeCloseTo(100.00); // (2 * 25.00) + (1 * 50.00)
    expect(placedOrder.items).toEqual(orderDetails.items);
    expect(placedOrder.shippingAddress).toBe(orderDetails.shippingAddress);
    expect(placedOrder.paymentMethod).toBe(orderDetails.paymentMethod);
    expect(placedOrder.date).toBeDefined(); // Should have a date
  });

  // Test case 2: Order placement fails if inventory is insufficient for one item
  test('placeOrder should throw an error and not place order if inventory is insufficient for any item', async () => {
    // Mock decreaseInventory for the first item to succeed, but fail for the second
    mockDecreaseInventory
      .mockResolvedValueOnce(undefined) // For 'prod_1'
      .mockRejectedValueOnce(new Error('Insufficient inventory.')); // For 'prod_2'

    const orderDetails = {
      items: [
        { productId: 'prod_1', name: 'Stylish T-Shirt', quantity: 2, price: 25.00 },
        { productId: 'prod_2', name: 'Comfortable Jeans', quantity: 1, price: 50.00 },
      ],
      shippingAddress: '123 Test St',
      paymentMethod: 'Credit Card',
    };

    // Expect the call to throw an error
    await expect(placeOrder(orderDetails)).rejects.toThrow('Insufficient inventory.');

    // Verify decreaseInventory was called for the first item but not the second
    expect(mockDecreaseInventory).toHaveBeenCalledTimes(1); // Only called once before the error
    expect(mockDecreaseInventory).toHaveBeenCalledWith('prod_1', 2);

    // Verify uuidv4 was NOT called (order was not placed)
    expect(mockUuidv4).not.toHaveBeenCalled();

    // Verify that getOrderHistory still returns the original mock orders (no new order added)
    const history = await getOrderHistory();
    expect(history.length).toBe(3); // Original number of mock orders
  });

  // Test case 3: Order placement with multiple items where the first one fails
  test('placeOrder should throw an error immediately if the first item has insufficient inventory', async () => {
    // Mock decreaseInventory to fail for the very first item
    mockDecreaseInventory.mockRejectedValue(new Error('Insufficient inventory.'));

    const orderDetails = {
      items: [
        { productId: 'prod_1', name: 'Stylish T-Shirt', quantity: 5, price: 25.00 }, // This one will fail
        { productId: 'prod_2', name: 'Comfortable Jeans', quantity: 1, price: 50.00 }, // This one should not be called
      ],
      shippingAddress: '123 Test St',
      paymentMethod: 'Credit Card',
    };

    await expect(placeOrder(orderDetails)).rejects.toThrow('Insufficient inventory.');

    // Verify decreaseInventory was called only for the first item
    expect(mockDecreaseInventory).toHaveBeenCalledTimes(1);
    expect(mockDecreaseInventory).toHaveBeenCalledWith('prod_1', 5);

    // Verify uuidv4 was NOT called
    expect(mockUuidv4).not.toHaveBeenCalled();
  });

  // Test case 4: Order placement with empty items array (should succeed with 0 total)
  test('placeOrder should handle an empty items array gracefully', async () => {
    mockDecreaseInventory.mockResolvedValue(undefined);
    mockUuidv4.mockReturnValue('mock-order-id-empty');

    const orderDetails = {
      items: [],
      shippingAddress: '456 Empty St',
      paymentMethod: 'Gift Card',
    };

    const placedOrder = await placeOrder(orderDetails);

    // Verify decreaseInventory was not called
    expect(mockDecreaseInventory).not.toHaveBeenCalled();

    // Verify uuidv4 was called
    expect(mockUuidv4).toHaveBeenCalledTimes(1);

    // Verify the returned order details are correct
    expect(placedOrder).toBeDefined();
    expect(placedOrder.id).toBe('ord_mock-order-id-empty');
    expect(placedOrder.totalAmount).toBe(0); // Should be zero for no items
    expect(placedOrder.items).toEqual([]);
    expect(placedOrder.shippingAddress).toBe(orderDetails.shippingAddress);
  });

  // Test case 5: Test getOrderHistory and getOrderById return correct mock data structure
  test('getOrderHistory and getOrderById should return mock data correctly', async () => {
    const history = await getOrderHistory();
    expect(history.length).toBe(3);
    expect(history[0].id).toBe('ord_001');

    const order = await getOrderById('ord_002');
    expect(order.id).toBe('ord_002');
    expect(order.totalAmount).toBeCloseTo(75.00);
  });
});
