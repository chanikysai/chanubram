import { registerUser, loginUser, logoutUser } from '../../src/services/authApi';
import { AuthResponse, ErrorResponse } from '../../src/services/authApi';

// Helper to reset mocks if needed, though authApi's state is internal
// If authApi had exports for its internal state, we'd reset them here.
// For now, we assume the file is imported fresh for each test file or has self-contained logic.

describe('authApi Service', () => {

  // Test case 1: registerUser - Happy path
  test('registerUser should successfully register a new user', async () => {
    // Simulate a fresh start for this test
    // Note: This might not work as expected if module state persists across imports.
    // For robust testing of stateful modules, consider jest.isolateModules or similar.

    const userData = {
      email: 'newuser@example.com',
      name: 'New User',
      password: 'securepassword123',
    };

    const result = await registerUser(userData);

    // Check if the result is a successful AuthResponse
    expect(result).not.toHaveProperty('message');
    const authResponse = result as AuthResponse;
    expect(authResponse.user).toBeDefined();
    expect(authResponse.user.email).toBe(userData.email);
    expect(authResponse.user.name).toBe(userData.name);
    expect(authResponse.token).toBeDefined();
    expect(authResponse.token).toBe('mock-jwt-token-for-newuser@example.com'); // Based on the mock implementation
  });

  // Test case 2: registerUser - Email already in use
  test('registerUser should return an error if email is already in use', async () => {
    // Assume 'user@example.com' already exists from the initial mock data
    const userData = {
      email: 'user@example.com', // This email is already in the mockUsers list
      name: 'Existing User Again',
      password: 'somepassword',
    };

    const result = await registerUser(userData);

    // Check if the result is an ErrorResponse
    expect(result).toHaveProperty('message');
    const errorResponse = result as ErrorResponse;
    expect(errorResponse.message).toBe('Email already in use.');
  });

  // Test case 3: registerUser - Password too short
  test('registerUser should return an error for a password less than 6 characters', async () => {
    const userData = {
      email: 'shortpass@example.com',
      name: 'Shorty',
      password: '123', // Less than 6 characters
    };

    const result = await registerUser(userData);

    // Check if the result is an ErrorResponse
    expect(result).toHaveProperty('message');
    const errorResponse = result as ErrorResponse;
    expect(errorResponse.message).toBe('Password must be at least 6 characters long.');
  });

  // Test case 4: loginUser - Happy path
  test('loginUser should return user and token for valid credentials', async () => {
    const credentials = {
      email: 'user@example.com',
      password: 'password123', // The mock checks for existence and a token pattern
    };

    const result = await loginUser(credentials);

    // Check if the result is a successful AuthResponse
    expect(result).not.toHaveProperty('message');
    const authResponse = result as AuthResponse;
    expect(authResponse.user).toBeDefined();
    expect(authResponse.user.email).toBe(credentials.email);
    expect(authResponse.token).toBeDefined();
    expect(authResponse.token).toBe('mock-jwt-token-for-user@example.com');
  });

  // Test case 5: loginUser - Invalid credentials
  test('loginUser should return an error for invalid email or password', async () => {
    const credentials = {
      email: 'wrong@example.com',
      password: 'wrongpassword',
    };

    const result = await loginUser(credentials);

    // Check if the result is an ErrorResponse
    expect(result).toHaveProperty('message');
    const errorResponse = result as ErrorResponse;
    expect(errorResponse.message).toBe('Invalid email or password.');
  });

  // Test case 6: logoutUser - Happy path
  test('logoutUser should return a success message', async () => {
    // The current mock for logoutUser is very basic.
    // In a real scenario, it would invalidate tokens server-side and clear client-side storage.
    const result = await logoutUser();

    expect(result).toBeDefined();
    expect(result.message).toBe('Logged out successfully.');
  });
});
