import { processPayment } from '../../src/services/paymentApi';

// Mock for the setTimeout function to control delays
jest.useFakeTimers();

describe('paymentApi', () => {
  // Mock implementations for dependencies if any were used by processPayment,
  // but in this case, it's self-contained logic.

  test('processPayment should return success for valid credit card details', async () => {
    const mockPaymentData = {
      paymentMethod: 'creditCard',
      cardNumber: '1111222233334444',
      expiryDate: '12/25',
      cvv: '123',
    };
    const mockShippingData = {
      fullName: 'Test User',
      addressLine1: '123 Test St',
      city: 'Testville',
      state: 'TS',
      postalCode: '12345',
      country: 'Testland',
    };

    const paymentPromise = processPayment(mockPaymentData, mockShippingData);

    // Advance timers to simulate API delay
    jest.advanceTimersByTime(1000);

    const result = await paymentPromise;

    expect(result.success).toBe(true);
    expect(result.message).toBe('Payment processed successfully!');
    expect(result.transactionId).toMatch(/^txn_/); // Check if transactionId has the expected format
  });

  test('processPayment should return error for incomplete credit card details', async () => {
    const mockPaymentData = {
      paymentMethod: 'creditCard',
      cardNumber: '1111222233334444',
      expiryDate: '12/25',
      // CVV is missing
    };
    const mockShippingData = {
      fullName: 'Test User',
      addressLine1: '123 Test St',
      city: 'Testville',
      state: 'TS',
      postalCode: '12345',
      country: 'Testland',
    };

    const paymentPromise = processPayment(mockPaymentData, mockShippingData);
    jest.advanceTimersByTime(1000);
    const result = await paymentPromise;

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid credit card details provided.');
  });

  test('processPayment should return success for PayPal initiation', async () => {
    const mockPaymentData = {
      paymentMethod: 'paypal',
    };
    const mockShippingData = {
      fullName: 'Test User',
      addressLine1: '123 Test St',
      city: 'Testville',
      state: 'TS',
      postalCode: '12345',
      country: 'Testland',
    };

    const paymentPromise = processPayment(mockPaymentData, mockShippingData);
    jest.advanceTimersByTime(1000);
    const result = await paymentPromise;

    expect(result.success).toBe(true);
    expect(result.message).toBe('PayPal payment initiated. Please complete on PayPal site.');
    expect(result.transactionId).toMatch(/^paypal_txn_/);
  });

  test('processPayment should return error if shipping data is missing', async () => {
    const mockPaymentData = {
      paymentMethod: 'creditCard',
      cardNumber: '1111222233334444',
      expiryDate: '12/25',
      cvv: '123',
    };
    // Shipping data is null
    const mockShippingData = null;

    const paymentPromise = processPayment(mockPaymentData, mockShippingData as any); // Cast to any to bypass TS check for null
    jest.advanceTimersByTime(1000);
    const result = await paymentPromise;

    expect(result.success).toBe(false);
    expect(result.message).toBe('Missing payment or shipping data.');
  });

  test('processPayment should return error for unsupported payment method', async () => {
    const mockPaymentData = {
      paymentMethod: 'bankTransfer' as any, // Unsupported method
    };
    const mockShippingData = {
      fullName: 'Test User',
      addressLine1: '123 Test St',
      city: 'Testville',
      state: 'TS',
      postalCode: '12345',
      country: 'Testland',
    };

    const paymentPromise = processPayment(mockPaymentData, mockShippingData);
    jest.advanceTimersByTime(1000);
    const result = await paymentPromise;

    expect(result.success).toBe(false);
    expect(result.message).toBe('Unsupported payment method or processing error.');
  });

  // Restore real timers after all tests in this describe block
  afterAll(() => {
    jest.useRealTimers();
  });
});
