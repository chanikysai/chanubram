// src/__tests__/services/paymentApi.test.ts
import { processPayment } from '../../src/services/paymentApi';

// Mock the current date and random number generator for predictable transaction IDs if necessary,
// but for now, we'll check for the existence of the ID.

describe('paymentApi', () => {
  // Test case for successful credit card payment
  test('should successfully process credit card payment', async () => {
    const paymentData = {
      paymentMethod: 'creditCard',
      cardNumber: '4111111111111111',
      expiryDate: '12/25',
      cvv: '123',
    };
    const shippingData = {
      fullName: 'Test User',
      addressLine1: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345',
      country: 'USA',
    };

    const response = await processPayment(paymentData, shippingData);

    expect(response.success).toBe(true);
    expect(response.message).toBe('Payment processed successfully!');
    expect(response).toHaveProperty('transactionId');
    expect(response.transactionId).toMatch(/^txn_/); // Check if transactionId is generated
  });

  // Test case for successful PayPal payment initiation
  test('should successfully initiate PayPal payment', async () => {
    const paymentData = {
      paymentMethod: 'paypal',
    };
    const shippingData = {
      fullName: 'Test User',
      addressLine1: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345',
      country: 'USA',
    };

    const response = await processPayment(paymentData, shippingData);

    expect(response.success).toBe(true);
    expect(response.message).toBe('PayPal payment initiated. Please complete on PayPal site.');
    expect(response).toHaveProperty('transactionId');
    expect(response.transactionId).toMatch(/^paypal_txn_/); // Check if transactionId is generated for PayPal
  });

  // Test case for missing payment data
  test('should return an error if payment data is missing', async () => {
    const shippingData = {
      fullName: 'Test User',
      addressLine1: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345',
      country: 'USA',
    };

    const response = await processPayment(null as any, shippingData); // Pass null for paymentData

    expect(response.success).toBe(false);
    expect(response.message).toBe('Missing payment or shipping data.');
  });

  // Test case for missing shipping data
  test('should return an error if shipping data is missing', async () => {
    const paymentData = {
      paymentMethod: 'creditCard',
      cardNumber: '4111111111111111',
      expiryDate: '12/25',
      cvv: '123',
    };

    const response = await processPayment(paymentData, null as any); // Pass null for shippingData

    expect(response.success).toBe(false);
    expect(response.message).toBe('Missing payment or shipping data.');
  });

  // Test case for invalid credit card details (missing CVV)
  test('should return an error for invalid credit card details (missing CVV)', async () => {
    const paymentData = {
      paymentMethod: 'creditCard',
      cardNumber: '4111111111111111',
      expiryDate: '12/25',
      // CVV is missing
    };
    const shippingData = {
      fullName: 'Test User',
      addressLine1: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345',
      country: 'USA',
    };

    const response = await processPayment(paymentData, shippingData);

    expect(response.success).toBe(false);
    expect(response.message).toBe('Invalid credit card details provided.');
  });

  // Test case for unsupported payment method
  test('should return an error for an unsupported payment method', async () => {
    const paymentData = {
      paymentMethod: 'bitcoin' as any, // Unsupported method
    };
    const shippingData = {
      fullName: 'Test User',
      addressLine1: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345',
      country: 'USA',
    };

    const response = await processPayment(paymentData, shippingData);

    expect(response.success).toBe(false);
    expect(response.message).toBe('Unsupported payment method or processing error.');
  });
});
