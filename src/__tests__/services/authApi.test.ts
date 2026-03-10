// src/__tests__/services/authApi.test.ts

import { registerUser, loginUser } from '../../services/authApi';

// Mock data for testing
// These are internal to the module, so we cannot directly reset them easily without exporting them.
// For testing purposes, we'll assume the initial state or test against known conditions.
// In a real scenario, you might expose a reset function or use a more sophisticated mocking library.

describe('authApi', () => {
  // Test cases for registerUser
  describe('registerUser', () => {
    test('should successfully register a new user', async () => {
      const userData = { email: 'newuser@example.com', name: 'New User', password: 'password123' };
      const result = await registerUser(userData);
      expect(result).not.toHaveProperty('message');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(userData.email);
      expect(result.user.name).toBe(userData.name);
    });

    test('should return an error if email is already in use', async () => {
      // 'user@example.com' is pre-populated in the mock
      const userData = { email: 'user@example.com', name: 'Existing User Attempt', password: 'password123' };
      const result = await registerUser(userData);
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Email already in use.');
    });

    test('should return an error for passwords shorter than 6 characters', async () => {
      const userData = { email: 'shortpass@example.com', name: 'Short Password User', password: 'pass' };
      const result = await registerUser(userData);
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Password must be at least 6 characters long.');
    });
  });

  // Test cases for loginUser
  describe('loginUser', () => {
    test('should successfully log in an existing user', async () => {
      // 'user@example.com' is pre-populated in the mock
      const credentials = { email: 'user@example.com', password: 'password123' }; // Mock password that works for pre-populated user
      const result = await loginUser(credentials);
      expect(result).not.toHaveProperty('message');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(credentials.email);
    });

    test('should return an error for invalid email or password', async () => {
      const credentials = { email: 'nonexistent@example.com', password: 'wrongpassword' };
      const result = await loginUser(credentials);
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Invalid email or password.');
    });

    test('should return an error if the user exists but password is wrong (simulated)', async () => {
        // The mock loginUser is simplified and doesn't do real password comparison.
        // This test will fail with the current mock if it relies on password correctness.
        // We will test based on the current mock's logic: if email exists and token matches.
        // Let's assume the 'user@example.com' requires 'password123' for the token generation.
        // If we send a different password, the token won't match.
        const credentials = { email: 'user@example.com', password: 'incorrectpassword' };
        const result = await loginUser(credentials);
        expect(result).toHaveProperty('message');
        expect(result.message).toBe('Invalid email or password.');
    });
  });
});
