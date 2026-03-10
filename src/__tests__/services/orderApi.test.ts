// src/__tests__/services/orderApi.test.ts
import { getOrderHistory, getOrderById } from '../../services/orderApi';

// Mock data provided by the service
const mockOrders = [
  {
    id: 'ord_001',
    date: new Date(Date.UTC(2026, 2, 1, 10, 30, 0)).toISOString(),
    totalAmount: 89.99,
    status: 'Delivered' as const,
    items: [
      { productId: 'p1', name: 'Awesome Gadget', quantity: 1, price: 49.99 },
      { productId: 'p2', name: 'Super Widget', quantity: 2, price: 19.50 },
    ],
    shippingAddress: '123 Main St, Anytown, USA',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'ord_002',
    date: new Date(Date.UTC(2026, 2, 5, 14, 0, 0)).toISOString(),
    totalAmount: 120.00,
    status: 'Shipped' as const,
    items: [
      { productId: 'p3', name: 'Mega Tool', quantity: 1, price: 120.00 },
    ],
    shippingAddress: '456 Oak Ave, Otherville, USA',
    paymentMethod: 'PayPal',
  },
  {
    id: 'ord_003',
    date: new Date(Date.UTC(2026, 2, 8, 9, 15, 0)).toISOString(),
    totalAmount: 75.00,
    status: 'Processing' as const,
    items: [
      { productId: 'p4', name: 'Mini Gizmo', quantity: 5, price: 15.00 },
    ],
    shippingAddress: '789 Pine Ln, Somewhere, USA',
    paymentMethod: 'Credit Card',
  },
];

describe('orderApi', () => {
  // Mock the setTimeout to control delay in tests
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // Happy Path: Fetch all orders
  test('should fetch order history successfully', async () => {
    const orders = await getOrderHistory();

    // Advance timers to allow setTimeout to complete
    jest.advanceTimersByTime(500);

    expect(orders).toBeDefined();
    expect(orders.length).toBeGreaterThan(0);
    // Check if the fetched orders match the mock data structure and content
    expect(orders).toEqual(mockOrders);
    expect(orders[0].id).toBe('ord_001');
    expect(orders[0].totalAmount).toBe(89.99);
  });

  // Happy Path: Fetch a specific order by ID
  test('should fetch a specific order by ID successfully', async () => {
    const orderId = 'ord_002';
    const order = await getOrderById(orderId);

    jest.advanceTimersByTime(500);

    expect(order).toBeDefined();
    expect(order.id).toBe(orderId);
    expect(order.status).toBe('Shipped');
    expect(order.items.length).toBe(1);
    expect(order.totalAmount).toBe(120.00);
  });

  // Edge Case/Error Handling: Fetch a non-existent order
  test('should throw an error if order ID is not found', async () => {
    const nonExistentOrderId = 'ord_999';

    // We expect getOrderById to throw an error when the order is not found
    await expect(getOrderById(nonExistentOrderId)).rejects.toThrow(
      `Order with ID ${nonExistentOrderId} not found.`
    );

    jest.advanceTimersByTime(500); // Advance timers to ensure mock timeout is processed
  });

  // Additional Edge Case: Fetching history when there are no orders (if mock data were empty)
  // This would be tested by temporarily making mockOrders an empty array and calling getOrderHistory
  // For now, our mock data has orders, so we focus on the existing structure.
});
